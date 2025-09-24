import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { EnergyReading } from '@/types';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId, power, voltage, current, totalEnergy } = body;

    if (!deviceId) {
      return NextResponse.json(
        { success: false, error: 'Device ID é obrigatório' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const reading: EnergyReading = {
      deviceId,
      timestamp: new Date(),
      power: Number(power) || 0,
      voltage: Number(voltage) || 0,
      current: Number(current) || 0,
      totalEnergy: Number(totalEnergy) || 0,
      createdAt: new Date(),
    };

    const result = await db.collection('energy_readings').insertOne(reading);

    return NextResponse.json({
      success: true,
      readingId: result.insertedId,
      reading,
    });
  } catch (error) {
    console.error('Erro ao salvar leitura de energia:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    const period = searchParams.get('period') || '24h';

    const { db } = await connectToDatabase();

    let query: any = {};
    let timeFilter: any = {};

    if (deviceId) {
      query.deviceId = deviceId;
    }

    // Definir filtro de tempo baseado no período
    const now = new Date();
    switch (period) {
      case '1h':
        timeFilter = { $gte: new Date(now.getTime() - 60 * 60 * 1000) };
        break;
      case '24h':
        timeFilter = { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) };
        break;
      case '7d':
        timeFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
        break;
      case '30d':
        timeFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
        break;
    }

    query.timestamp = timeFilter;

    const readings = await db
      .collection('energy_readings')
      .find(query)
      .sort({ timestamp: -1 })
      .limit(1000)
      .toArray();

    return NextResponse.json({
      success: true,
      readings,
      count: readings.length,
    });
  } catch (error) {
    console.error('Erro ao buscar leituras de energia:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}