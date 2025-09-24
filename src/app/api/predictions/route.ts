import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { MonthlyPrediction } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());

    const { db } = await connectToDatabase();

    let query: any = { year, month };
    if (deviceId) {
      query.deviceId = deviceId;
    }

    const predictions = await db
      .collection('monthly_predictions')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, predictions });
  } catch (error) {
    console.error('Erro ao buscar previsões:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId, year, month, predictedConsumption, kwhPrice } = body;

    if (!deviceId || !year || !month || predictedConsumption === undefined || kwhPrice === undefined) {
      return NextResponse.json(
        { success: false, error: 'Dados obrigatórios em falta' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const predictedCost = predictedConsumption * kwhPrice;

    const prediction: Omit<MonthlyPrediction, '_id'> = {
      deviceId,
      year: Number(year),
      month: Number(month),
      predictedConsumption: Number(predictedConsumption),
      predictedCost,
      kwhPrice: Number(kwhPrice),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Verificar se já existe uma previsão para este mês/ano/dispositivo
    const existingPrediction = await db
      .collection('monthly_predictions')
      .findOne({ deviceId, year: Number(year), month: Number(month) });

    let result;
    if (existingPrediction) {
      // Atualizar previsão existente
      result = await db
        .collection('monthly_predictions')
        .updateOne(
          { deviceId, year: Number(year), month: Number(month) },
          { $set: { ...prediction, updatedAt: new Date() } }
        );
    } else {
      // Criar nova previsão
      result = await db.collection('monthly_predictions').insertOne(prediction);
    }

    return NextResponse.json({
      success: true,
      prediction,
      updated: existingPrediction ? true : false,
    });
  } catch (error) {
    console.error('Erro ao criar/atualizar previsão:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}