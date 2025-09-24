import { TuyaContext } from '@tuya/tuya-connector-nodejs';

class TuyaService {
  private context: TuyaContext;

  constructor() {
    this.context = new TuyaContext({
      baseUrl: process.env.TUYA_ENDPOINT || 'https://openapi.tuyaus.com',
      accessKey: process.env.TUYA_ACCESS_KEY || '',
      secretKey: process.env.TUYA_SECRET_KEY || '',
    });
  }

  async getDevices() {
    try {
      const response = await this.context.request({
        path: `/v1.0/users/${process.env.TUYA_APP_ACCOUNT_ID}/devices`,
        method: 'GET',
      });

      return response.result || [];
    } catch (error) {
      console.error('Erro ao buscar dispositivos:', error);
      throw error;
    }
  }

  async getDeviceStatus(deviceId: string) {
    try {
      const response = await this.context.request({
        path: `/v1.0/devices/${deviceId}/status`,
        method: 'GET',
      });

      return response.result || [];
    } catch (error) {
      console.error(`Erro ao buscar status do dispositivo ${deviceId}:`, error);
      throw error;
    }
  }

  async getDeviceInfo(deviceId: string) {
    try {
      const response = await this.context.request({
        path: `/v1.0/devices/${deviceId}`,
        method: 'GET',
      });

      return response.result;
    } catch (error) {
      console.error(`Erro ao buscar informações do dispositivo ${deviceId}:`, error);
      throw error;
    }
  }

  async getDeviceStatistics(deviceId: string, type: string = 'day') {
    try {
      const response = await this.context.request({
        path: `/v1.0/devices/${deviceId}/statistics/${type}`,
        method: 'GET',
      });

      return response.result;
    } catch (error) {
      console.error(`Erro ao buscar estatísticas do dispositivo ${deviceId}:`, error);
      throw error;
    }
  }

  parseEnergyData(statusData: any[]) {
    const energyData = {
      power: 0,
      voltage: 0,
      current: 0,
      totalEnergy: 0,
    };

    statusData.forEach((item) => {
      switch (item.code) {
        case 'cur_power':
        case 'power':
          energyData.power = item.value / 10; // Converter de deciWatts para Watts
          break;
        case 'cur_voltage':
        case 'voltage':
          energyData.voltage = item.value / 10; // Converter de deciVolts para Volts
          break;
        case 'cur_current':
        case 'current':
          energyData.current = item.value; // mA
          break;
        case 'add_ele':
        case 'total_forward_energy':
          energyData.totalEnergy = item.value / 100; // Converter para kWh
          break;
      }
    });

    return energyData;
  }
}

export const tuyaService = new TuyaService();