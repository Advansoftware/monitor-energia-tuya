import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { tuyaService } from '@/lib/tuya';

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    // Buscar dispositivos do Tuya
    const tuyaDevices = await tuyaService.getDevices();

    // Verificar se tuyaDevices é um array
    if (!Array.isArray(tuyaDevices)) {
      return NextResponse.json({ success: true, devices: [] });
    }

    // Buscar dispositivos salvos no banco
    const savedDevices = await db.collection('devices').find({}).toArray();

    // Combinar dados do Tuya com dados salvos
    const devicesWithInfo = await Promise.all(
      tuyaDevices.map(async (device: any) => {
        const savedDevice = savedDevices.find(d => d.deviceId === device.id);

        try {
          // Buscar status atual do dispositivo
          const status = await tuyaService.getDeviceStatus(device.id);
          const energyData = tuyaService.parseEnergyData(Array.isArray(status) ? status : []);

          return {
            deviceId: device.id,
            name: savedDevice?.name || device.name,
            category: device.category,
            online: device.online,
            ...energyData,
            lastUpdate: new Date(),
          };
        } catch (statusError) {
          console.error(`Erro ao buscar status do dispositivo ${device.id}:`, statusError);
          return {
            deviceId: device.id,
            name: savedDevice?.name || device.name,
            category: device.category,
            online: false,
            power: 0,
            voltage: 0,
            current: 0,
            totalEnergy: 0,
            lastUpdate: new Date(),
          };
        }
      })
    );

    return NextResponse.json({ success: true, devices: devicesWithInfo });
  } catch (error) {
    console.error('Erro ao buscar dispositivos:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}