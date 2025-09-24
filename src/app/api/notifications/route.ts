import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { notifications } = await request.json();

    if (!notifications || !Array.isArray(notifications)) {
      return NextResponse.json(
        { error: 'Array de notificações é obrigatório' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
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
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, read, action, ids } = body;

    const { db } = await connectToDatabase();
    const collection = db.collection('notifications');

    // Ação em lote - marcar todas como lidas
    if (action === 'markAllAsRead' && ids) {
      const result = await collection.updateMany(
        { id: { $in: ids } },
        {
          $set: {
            read: true,
            readAt: new Date()
          }
        }
      );

      return NextResponse.json({
        success: true,
        message: `${result.modifiedCount} notificações marcadas como lidas`
      });
    }

    // Ação individual
    if (id && read !== undefined) {
      const result = await collection.updateOne(
        { id: id },
        {
          $set: {
            read: read,
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
        message: 'Notificação atualizada'
      });
    }

    return NextResponse.json(
      { error: 'Parâmetros inválidos' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Erro ao atualizar notificação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, ids } = body;

    const { db } = await connectToDatabase();
    const collection = db.collection('notifications');

    // Ação em lote - limpar todas
    if (action === 'clearAll' && ids) {
      const result = await collection.deleteMany(
        { id: { $in: ids } }
      );

      return NextResponse.json({
        success: true,
        message: `${result.deletedCount} notificações removidas`
      });
    }

    // Ação individual
    if (id) {
      const result = await collection.deleteOne({ id: id });

      if (result.deletedCount === 0) {
        return NextResponse.json(
          { error: 'Notificação não encontrada' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Notificação removida'
      });
    }

    return NextResponse.json(
      { error: 'Parâmetros inválidos' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Erro ao remover notificação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('notifications');

    // Buscar todas as notificações dos últimos 7 dias, ordenadas por data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const notifications = await collection
      .find({
        timestamp: { $gte: sevenDaysAgo }
      })
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json(notifications);

  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}