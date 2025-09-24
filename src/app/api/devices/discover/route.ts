import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { tuyaService } from '@/lib/tuya';

export async function POST() {
  try {
    const { db } = await connectToDatabase();

    // Buscar dispositivos do Tuya
    const tuyaDevices = await tuyaService.getDevices();

    if (!Array.isArray(tuyaDevices)) {
      return NextResponse.json({
        success: false,
        error: 'Não foi possível conectar com a API do Tuya'
      });
    }

    // Buscar dispositivos já salvos no banco
    const savedDevices = await db.collection('devices').find({}).toArray();
    const savedDeviceIds = savedDevices.map(d => d.deviceId);

    // Encontrar novos dispositivos
    const newDevices = tuyaDevices.filter(
      (device: any) => !savedDeviceIds.includes(device.id)
    );

    const discovered = [];

    // Salvar novos dispositivos no banco
    for (const device of newDevices) {
      try {
        const deviceData = {
          deviceId: device.id,
          name: device.name || `Dispositivo ${device.id}`,
          category: device.category || 'unknown',
          online: device.online || false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await db.collection('devices').insertOne(deviceData);
        discovered.push(deviceData);
      } catch (error) {
        console.error(`Erro ao salvar dispositivo ${device.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      discovered,
      totalFound: tuyaDevices.length,
      newDevices: discovered.length,
      message: `${discovered.length} novos dispositivos descobertos`,
    });
  } catch (error) {
    console.error('Erro ao descobrir dispositivos:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}