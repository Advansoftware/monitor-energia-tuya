import { ObjectId } from 'mongodb';

export interface Device {
  _id?: ObjectId;
  deviceId: string; // ID do dispositivo Tuya
  name: string; // Nome customizado pelo usuário
  category: string; // Categoria do dispositivo
  online: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EnergyReading {
  _id?: ObjectId;
  deviceId: string;
  timestamp: Date;
  power: number; // Potência atual em watts
  voltage: number; // Tensão em volts
  current: number; // Corrente em amperes
  totalEnergy: number; // Energia total consumida em kWh
  createdAt: Date;
}

export interface MonthlyPrediction {
  _id?: ObjectId;
  deviceId: string;
  year: number;
  month: number;
  predictedConsumption: number; // kWh previsto para o mês
  predictedCost: number; // Custo previsto em reais
  actualConsumption?: number; // kWh real consumido (quando disponível)
  actualCost?: number; // Custo real (quando disponível)
  kwhPrice: number; // Preço do kWh usado para o cálculo
  createdAt: Date;
  updatedAt: Date;
}

export interface AppSettings {
  _id?: ObjectId;
  kwhPrice: number; // Preço do kWh em reais
  currency: string; // Moeda (BRL)
  timezone: string; // Fuso horário
  createdAt: Date;
  updatedAt: Date;
}

export interface DeviceStatus {
  deviceId: string;
  name: string;
  online: boolean;
  currentPower: number;
  todayConsumption: number;
  monthConsumption: number;
  estimatedMonthlyCost: number;
}