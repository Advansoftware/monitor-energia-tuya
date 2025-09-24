import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Device } from '@/types/database';

export async function PUT(
  request: NextRequest,
  { params }: { params: { deviceId: string } }
) {
  try {
    const deviceId = params.deviceId;
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Verificar se o dispositivo já existe
    const existingDevice = await db.collection('devices').findOne({ deviceId });

    const deviceData = {
      deviceId,
      name,
      category: existingDevice?.category || 'unknown',
      online: existingDevice?.online || false,
      updatedAt: new Date(),
    };

    let result;
    if (existingDevice) {
      // Atualizar dispositivo existente
      result = await db
        .collection('devices')
        .updateOne(
          { deviceId },
          { $set: deviceData }
        );
    } else {
      // Criar novo dispositivo
      const newDevice: Omit<Device, '_id'> = {
        ...deviceData,
        createdAt: new Date(),
      };
      result = await db.collection('devices').insertOne(newDevice);
    }

    return NextResponse.json({
      success: true,
      device: deviceData,
      updated: existingDevice ? true : false,
    });
  } catch (error) {
    console.error('Erro ao atualizar dispositivo:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { deviceId: string } }
) {
  try {
    const deviceId = params.deviceId;
    const { db } = await connectToDatabase();

    // Remover dispositivo
    await db.collection('devices').deleteOne({ deviceId });

    // Remover todas as leituras do dispositivo
    await db.collection('energy_readings').deleteMany({ deviceId });

    // Remover todas as previsões do dispositivo
    await db.collection('monthly_predictions').deleteMany({ deviceId });

    return NextResponse.json({
      success: true,
      message: 'Dispositivo removido com sucesso',
    });
  } catch (error) {
    console.error('Erro ao remover dispositivo:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}