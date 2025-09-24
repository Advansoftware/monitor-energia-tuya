import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Settings } from '@/types';

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    let settings = await db.collection('settings').findOne({});

    if (!settings) {
      // Criar configurações padrão
      const defaultSettings: Omit<Settings, '_id'> = {
        kwhPrice: 0.65, // Preço médio do kWh no Brasil
        currency: 'BRL',
        timezone: 'America/Sao_Paulo',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db.collection('settings').insertOne(defaultSettings);
      settings = { ...defaultSettings, _id: result.insertedId };
    }

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { kwhPrice, currency, timezone } = body;

    const { db } = await connectToDatabase();

    const updateData = {
      ...(kwhPrice !== undefined && { kwhPrice: Number(kwhPrice) }),
      ...(currency && { currency }),
      ...(timezone && { timezone }),
      updatedAt: new Date(),
    };

    const result = await db.collection('settings').updateOne(
      {},
      { $set: updateData },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      updated: result.modifiedCount > 0 || result.upsertedCount > 0,
    });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}