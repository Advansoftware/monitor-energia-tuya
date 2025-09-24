import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class TuyaService {
  private readonly logger = new Logger(TuyaService.name);
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  private readonly accessId = process.env.TUYA_ACCESS_ID;
  private readonly accessSecret = process.env.TUYA_ACCESS_SECRET;
  private readonly endpoint = process.env.TUYA_ENDPOINT || 'https://openapi.tuyaus.com';

  constructor() {
    if (!this.accessId || !this.accessSecret) {
      this.logger.error('⚠️ Credenciais Tuya não configuradas');
    }
  }

  private generateSign(method: string, path: string, params: string, timestamp: string, accessToken?: string) {
    const contentHash = crypto.createHash('sha256').update(params).digest('hex');
    const stringToSign = method + '\n' + contentHash + '\n' + '\n' + path;
    const signStr = this.accessId + (accessToken || '') + timestamp + stringToSign;

    return crypto
      .createHmac('sha256', this.accessSecret)
      .update(signStr, 'utf8')
      .digest('hex')
      .toUpperCase();
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const timestamp = Date.now().toString();
    const method = 'GET';
    const path = '/v1.0/token?grant_type=1';
    const sign = this.generateSign(method, path, '', timestamp);

    try {
      const response = await axios.get(`${this.endpoint}${path}`, {
        headers: {
          't': timestamp,
          'sign_method': 'HMAC-SHA256',
          'client_id': this.accessId,
          'sign': sign,
        },
      });

      if (response.data.success) {
        this.accessToken = response.data.result.access_token;
        this.tokenExpiry = Date.now() + (response.data.result.expire_time * 1000);
        this.logger.log('🔑 Token de acesso Tuya renovado');
        return this.accessToken;
      } else {
        throw new Error(`Falha ao obter token: ${response.data.msg}`);
      }
    } catch (error) {
      this.logger.error('❌ Erro ao obter token Tuya:', error.message);
      throw error;
    }
  }

  async getDeviceStatus(deviceId: string) {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = Date.now().toString();
      const method = 'GET';
      const path = `/v1.0/devices/${deviceId}/status`;
      const sign = this.generateSign(method, path, '', timestamp, accessToken);

      const response = await axios.get(`${this.endpoint}${path}`, {
        headers: {
          't': timestamp,
          'sign_method': 'HMAC-SHA256',
          'client_id': this.accessId,
          'access_token': accessToken,
          'sign': sign,
        },
      });

      if (response.data.success) {
        const status = response.data.result;

        // Mapear os status para os valores esperados
        const mappedData = {
          power: 0,
          voltage: 0,
          current: 0,
          energy: 0,
        };

        status.forEach((item: any) => {
          switch (item.code) {
            case 'cur_power':
            case 'power':
              mappedData.power = item.value / 10; // Converter de deciWatts para Watts
              break;
            case 'cur_voltage':
            case 'voltage':
              mappedData.voltage = item.value / 10; // Converter de deciVolts para Volts
              break;
            case 'cur_current':
            case 'current':
              mappedData.current = item.value; // Já em miliAmperes
              break;
            case 'add_ele':
            case 'energy':
              mappedData.energy = item.value / 1000; // Converter de Wh para kWh
              break;
          }
        });

        return mappedData;
      } else {
        this.logger.warn(`⚠️ Falha ao obter status do dispositivo ${deviceId}: ${response.data.msg}`);
        return null;
      }
    } catch (error) {
      this.logger.error(`❌ Erro ao obter status do dispositivo ${deviceId}:`, error.message);
      throw error;
    }
  }
}