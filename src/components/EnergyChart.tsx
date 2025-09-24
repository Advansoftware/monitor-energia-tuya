'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useState, useEffect } from 'react';

interface Device {
  deviceId: string;
  name: string;
  category: string;
  online: boolean;
  power: number;
  voltage: number;
  current: number;
  totalEnergy: number;
  lastUpdate: Date;
}

interface EnergyChartProps {
  devices: Device[];
}

export default function EnergyChart({ devices }: EnergyChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  useEffect(() => {
    // Simular dados históricos para demonstração
    const generateMockData = () => {
      const data = [];
      const now = new Date();
      
      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        const hour = time.getHours();
        
        const dataPoint: any = {
          time: `${hour.toString().padStart(2, '0')}:00`,
          timestamp: time.toISOString(),
        };

        // Adicionar dados para cada dispositivo
        devices.forEach(device => {
          // Simular variação de potência baseada na hora do dia
          let basePower = device.power;
          if (hour >= 6 && hour <= 9) basePower *= 1.2; // Pico manhã
          if (hour >= 18 && hour <= 22) basePower *= 1.5; // Pico noite
          if (hour >= 0 && hour <= 5) basePower *= 0.3; // Madrugada
          
          const variation = (Math.random() - 0.5) * 0.2;
          dataPoint[device.name] = Math.max(0, basePower * (1 + variation));
        });

        data.push(dataPoint);
      }
      
      return data;
    };

    setChartData(generateMockData());
  }, [devices]);

  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-800 border border-dark-600 rounded-lg p-3 shadow-lg">
          <p className="text-dark-200 font-medium">{`Hora: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value.toFixed(1)} W`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (devices.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-dark-400">
        Nenhum dispositivo para exibir
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Chart Type Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-dark-300">Últimas 24 horas</h3>
        <div className="flex bg-dark-700 rounded-lg p-1">
          <button
            onClick={() => setChartType('line')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              chartType === 'line'
                ? 'bg-primary-600 text-white'
                : 'text-dark-300 hover:text-dark-100'
            }`}
          >
            Linha
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              chartType === 'bar'
                ? 'bg-primary-600 text-white'
                : 'text-dark-300 hover:text-dark-100'
            }`}
          >
            Barra
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                label={{ value: 'Potência (W)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              {devices.map((device, index) => (
                <Line
                  key={device.deviceId}
                  type="monotone"
                  dataKey={device.name}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                label={{ value: 'Potência (W)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              {devices.map((device, index) => (
                <Bar
                  key={device.deviceId}
                  dataKey={device.name}
                  fill={colors[index % colors.length]}
                  radius={[2, 2, 0, 0]}
                />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {devices.map((device, index) => (
          <div key={device.deviceId} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colors[index % colors.length] }}
            ></div>
            <span className="text-sm text-dark-300">{device.name}</span>
            <span className="text-xs text-dark-500">
              {device.power.toFixed(1)}W
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}