import { Activity, Zap, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface DeviceCardProps {
  device: Device;
}

export default function DeviceCard({ device }: DeviceCardProps) {
  const formatLastUpdate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'agora';
    if (minutes < 60) return `${minutes}min atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  };

  return (
    <div className="card space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={cn(
            'p-2 rounded-lg',
            device.online ? 'bg-green-600/20' : 'bg-red-600/20'
          )}>
            <Activity className={cn(
              'h-5 w-5',
              device.online ? 'text-green-400' : 'text-red-400'
            )} />
          </div>
          <div>
            <h3 className="font-semibold text-dark-50">{device.name}</h3>
            <p className="text-sm text-dark-400">{device.category}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {device.online ? (
            <Eye className="h-4 w-4 text-green-400" />
          ) : (
            <EyeOff className="h-4 w-4 text-red-400" />
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="text-sm text-dark-400">Potência</span>
          </div>
          <p className="text-lg font-bold text-dark-50">{device.power.toFixed(1)} W</p>
        </div>
        <div className="space-y-1">
          <span className="text-sm text-dark-400">Energia Total</span>
          <p className="text-lg font-bold text-dark-50">{device.totalEnergy.toFixed(2)} kWh</p>
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-dark-700">
        <div className="space-y-1">
          <span className="text-xs text-dark-500">Tensão</span>
          <p className="text-sm font-medium text-dark-300">{device.voltage.toFixed(1)} V</p>
        </div>
        <div className="space-y-1">
          <span className="text-xs text-dark-500">Corrente</span>
          <p className="text-sm font-medium text-dark-300">{device.current.toFixed(1)} mA</p>
        </div>
      </div>

      {/* Status Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-dark-700">
        <div className="flex items-center space-x-2">
          <div className={cn(
            'h-2 w-2 rounded-full',
            device.online ? 'bg-green-400' : 'bg-red-400'
          )}></div>
          <span className="text-xs text-dark-400">
            {device.online ? 'Online' : 'Offline'}
          </span>
        </div>
        <span className="text-xs text-dark-500">
          {formatLastUpdate(device.lastUpdate)}
        </span>
      </div>
    </div>
  );
}