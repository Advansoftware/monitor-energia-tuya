import { Injectable, Logger } from '@nestjs/common';
import { MongoClient, Db } from 'mongodb';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);
  private client: MongoClient;
  private db: Db;

  constructor() {
    this.connectToDatabase();
  }

  private async connectToDatabase() {
    try {
      const uri = process.env.MONGODB_URI || 'mongodb://192.168.3.13:27017/monitor_energia';
      this.client = new MongoClient(uri);
      await this.client.connect();
      this.db = this.client.db('monitor_energia');
      this.logger.log('📊 Conectado ao MongoDB');
    } catch (error) {
      this.logger.error('❌ Erro ao conectar no MongoDB:', error.message);
      throw error;
    }
  }

  async getDevices() {
    try {
      const devices = await this.db.collection('devices').find({}).toArray();
      return devices.map(device => ({
        deviceId: device.deviceId,
        name: device.name,
        category: device.category,
      }));
    } catch (error) {
      this.logger.error('❌ Erro ao buscar dispositivos:', error.message);
      throw error;
    }
  }

  async saveEnergyReading(reading: {
    deviceId: string;
    power: number;
    voltage: number;
    current: number;
    energy: number;
    timestamp: Date;
  }) {
    try {
      await this.db.collection('readings').insertOne({
        ...reading,
        createdAt: new Date(),
      });
    } catch (error) {
      this.logger.error('❌ Erro ao salvar leitura:', error.message);
      throw error;
    }
  }

  async getCollectionStats() {
    try {
      const [devicesCount, readingsCount, lastReading] = await Promise.all([
        this.db.collection('devices').countDocuments(),
        this.db.collection('readings').countDocuments(),
        this.db.collection('readings').findOne({}, { sort: { timestamp: -1 } }),
      ]);

      return {
        devicesCount,
        readingsCount,
        lastReading: lastReading?.timestamp || null,
      };
    } catch (error) {
      this.logger.error('❌ Erro ao obter estatísticas:', error.message);
      return {
        devicesCount: 0,
        readingsCount: 0,
        lastReading: null,
      };
    }
  }

  async onApplicationShutdown() {
    if (this.client) {
      await this.client.close();
      this.logger.log('📊 Conexão MongoDB fechada');
    }
  }
}