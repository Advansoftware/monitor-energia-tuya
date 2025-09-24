import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TuyaService } from './tuya.service';
import { DatabaseService } from './database.service';

@Injectable()
export class CollectorService {
  private readonly logger = new Logger(CollectorService.name);
  private stats = {
    totalCollections: 0,
    successfulCollections: 0,
    failedCollections: 0,
    lastCollectionTime: null,
    lastCollectionStatus: 'pending',
  };

  constructor(
    private readonly tuyaService: TuyaService,
    private readonly databaseService: DatabaseService,
  ) { }

  @Cron(process.env.CRON_SCHEDULE || '*/5 * * * *')
  async handleCron() {
    this.logger.log('🔄 Iniciando coleta automática de dados...');
    await this.collectData();
  }

  async collectData() {
    const startTime = Date.now();
    this.stats.totalCollections++;
    this.stats.lastCollectionTime = new Date();

    try {
      // Buscar dispositivos cadastrados
      const devices = await this.databaseService.getDevices();
      this.logger.log(`📱 Encontrados ${devices.length} dispositivos`);

      if (devices.length === 0) {
        this.logger.warn('⚠️ Nenhum dispositivo encontrado para coleta');
        this.stats.lastCollectionStatus = 'no-devices';
        return { success: true, collected: 0, message: 'Nenhum dispositivo encontrado' };
      }

      let collected = 0;
      const errors = [];

      for (const device of devices) {
        try {
          // Coletar dados do dispositivo via Tuya API
          const deviceData = await this.tuyaService.getDeviceStatus(device.deviceId);

          if (deviceData) {
            // Salvar no banco de dados
            await this.databaseService.saveEnergyReading({
              deviceId: device.deviceId,
              power: deviceData.power || 0,
              voltage: deviceData.voltage || 0,
              current: deviceData.current || 0,
              energy: deviceData.energy || 0,
              timestamp: new Date(),
            });

            collected++;
            this.logger.debug(`✅ Dados coletados para ${device.name}: ${deviceData.power}W`);
          }
        } catch (error) {
          this.logger.error(`❌ Erro ao coletar dados do dispositivo ${device.name}:`, error.message);
          errors.push({ device: device.name, error: error.message });
        }
      }

      const duration = Date.now() - startTime;
      this.stats.successfulCollections++;
      this.stats.lastCollectionStatus = 'success';

      this.logger.log(`✅ Coleta concluída: ${collected}/${devices.length} dispositivos em ${duration}ms`);

      return {
        success: true,
        collected,
        total: devices.length,
        duration,
        errors: errors.length > 0 ? errors : undefined,
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      this.stats.failedCollections++;
      this.stats.lastCollectionStatus = 'error';

      this.logger.error(`💥 Erro na coleta de dados:`, error.message);

      return {
        success: false,
        error: error.message,
        duration,
      };
    }
  }

  getStats() {
    return {
      ...this.stats,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    };
  }
}