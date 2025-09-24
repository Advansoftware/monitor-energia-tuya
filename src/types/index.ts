// Common interfaces for the energy monitoring application

export interface Device {
  deviceId: string;
  name: string;
  category: string;
  online: boolean;
  power: number;
  voltage: number;
  current: number;
  totalEnergy: number;
  lastUpdate: Date | string;
}

export interface EnergyReading {
  _id?: string;
  deviceId: string;
  timestamp: Date | string;
  power: number;
  voltage: number;
  current: number;
  totalEnergy: number;
}

export interface Settings {
  _id?: string;
  monthlyGoal?: number;
  highConsumptionThreshold?: number;
  notificationsEnabled?: boolean;
  emailNotifications?: boolean;
  realTimeUpdates?: boolean;
  dataRetentionDays?: number;
  updatedAt?: Date | string;
}

export interface Notification {
  _id?: string;
  id: string;
  type: 'high-consumption' | 'goal-exceeded' | 'device-offline' | 'energy-saving';
  title: string;
  message: string;
  timestamp: Date | string;
  createdAt?: Date | string;
  read: boolean;
  readAt?: Date | string;
  deviceId?: string;
  value?: number;
}

export interface MonthlyStats {
  month: string;
  totalConsumption: number;
  averagePower: number;
  peakPower: number;
  cost: number;
  devices: Array<{
    deviceId: string;
    name: string;
    consumption: number;
    cost: number;
  }>;
}

export interface PredictionData {
  _id?: string;
  deviceId: string;
  date: Date | string;
  predictedConsumption: number;
  confidenceLevel: number;
  factors: {
    historical: number;
    seasonal: number;
    trend: number;
  };
}