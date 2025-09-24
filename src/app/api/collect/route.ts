import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { tuyaService } from '@/lib/tuya';
import { EnergyReading } from '@/types';

export async function POST() {
  try {
    const { db } = await connectToDatabase();

    // Buscar todos os dispositivos salvos
    const devices = await db.collection('devices').find({}).toArray();

    if (devices.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nenhum dispositivo para coletar dados',
        collected: 0,
      });
    }

    const readings = [];
    const errors = [];

    // Coletar dados de cada dispositivo
    for (const device of devices) {
      try {
        const status = await tuyaService.getDeviceStatus(device.deviceId);
        const energyData = tuyaService.parseEnergyData(Array.isArray(status) ? status : []);

        const reading: Omit<EnergyReading, '_id'> = {
          deviceId: device.deviceId,
          timestamp: new Date(),
          power: energyData.power,
          voltage: energyData.voltage,
          current: energyData.current,
          totalEnergy: energyData.totalEnergy,
          createdAt: new Date(),
        };

        await db.collection('energy_readings').insertOne(reading);
        readings.push(reading);

        // Atualizar status online do dispositivo
        await db.collection('devices').updateOne(
          { deviceId: device.deviceId },
          {
            $set: {
              online: true,
              updatedAt: new Date()
            }
          }
        );

      } catch (error) {
        console.error(`Erro ao coletar dados do dispositivo ${device.deviceId}:`, error);
        errors.push({
          deviceId: device.deviceId,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        });

        // Marcar dispositivo como offline
        await db.collection('devices').updateOne(
          { deviceId: device.deviceId },
          {
            $set: {
              online: false,
              updatedAt: new Date()
            }
          }
        );
      }
    }

    return NextResponse.json({
      success: true,
      collected: readings.length,
      errors: errors.length,
      message: `${readings.length} leituras coletadas, ${errors.length} erros`,
      details: { readings, errors },
    });

  } catch (error) {
    console.error('Erro na coleta de dados:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}