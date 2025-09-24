import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI!);

export async function POST(request: NextRequest) {
  try {
    const { notifications } = await request.json();

    if (!notifications || !Array.isArray(notifications)) {
      return NextResponse.json(
        { error: 'Array de notificações é obrigatório' },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db('energia_monitor');
    const collection = db.collection('notifications');

    const notificationsToSave = notifications.map(notification => ({
      ...notification,
      createdAt: new Date(),
      read: false
    }));

    const result = await collection.insertMany(notificationsToSave);

    return NextResponse.json({
      success: true,
      insertedCount: result.insertedCount
    });

  } catch (error) {
    console.error('Erro ao salvar notificações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { notificationId } = await request.json();

    if (!notificationId) {
      return NextResponse.json(
        { error: 'ID da notificação é obrigatório' },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db('energia_monitor');
    const collection = db.collection('notifications');

    const result = await collection.updateOne(
      { _id: new ObjectId(notificationId) },
      {
        $set: {
          read: true,
          readAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Notificação não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notificação marcada como lida'
    });

  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

export async function GET() {
  try {
    await client.connect();
    const db = client.db('energia_monitor');
    const collection = db.collection('notifications');

    // Buscar apenas notificações não lidas dos últimos 7 dias
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const notifications = await collection
      .find({
        read: { $ne: true },
        createdAt: { $gte: sevenDaysAgo }
      })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    return NextResponse.json(notifications);

  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}