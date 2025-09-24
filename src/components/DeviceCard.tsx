import { Activity, Zap, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Device } from '@/types';

interface DeviceCardProps {
  device: Device;
}

export default function DeviceCard({ device }: DeviceCardProps) {
  const formatLastUpdate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'agora';
    if (minutes < 60) return `${minutes}min atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  };

  // Calculate daily consumption (estimation based on current power)
  const calculateDailyConsumption = () => {
    if (!device.online || device.power === 0) return 0;
    // Estimate daily consumption: current power * 24 hours / 1000 (to get kWh)
    return (device.power * 24) / 1000;
  };

  // Calculate cost estimation (assuming R$ 0.65 per kWh)
  const calculateDailyCost = () => {
    return calculateDailyConsumption() * 0.65;
  };

  const dailyConsumption = calculateDailyConsumption();
  const dailyCost = calculateDailyCost();

  return (
    <div className="mobile-card space-y-4">
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
            <h3 className="font-semibold text-foreground">{device.name}</h3>
            <p className="text-sm text-muted-foreground">{device.category}</p>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="text-sm text-muted-foreground">Potência</span>
          </div>
          <p className="text-lg font-bold text-foreground">{device.power.toFixed(1)} W</p>
        </div>
        <div className="space-y-1">
          <span className="text-sm text-muted-foreground">Energia Total</span>
          <p className="text-lg font-bold text-foreground">{device.totalEnergy.toFixed(2)} kWh</p>
        </div>
      </div>

      {/* Real-time Consumption */}
      <div className="border-t border-border pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Consumo Estimado (Hoje)</span>
          <div className="flex items-center space-x-1">
            <Activity className="h-3 w-3 text-primary" />
            <span className="text-xs text-muted-foreground">Em tempo real</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-accent/20 rounded-lg p-2">
            <p className="text-xs text-muted-foreground">Consumo</p>
            <p className="text-base font-semibold text-foreground">
              {dailyConsumption.toFixed(2)} kWh
            </p>
          </div>
          <div className="bg-accent/20 rounded-lg p-2">
            <p className="text-xs text-muted-foreground">Custo</p>
            <p className="text-base font-semibold text-green-400">
              R$ {dailyCost.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Tensão</span>
          <p className="text-sm font-medium text-foreground">{device.voltage.toFixed(1)} V</p>
        </div>
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Corrente</span>
          <p className="text-sm font-medium text-foreground">{device.current.toFixed(1)} mA</p>
        </div>
      </div>

      {/* Status Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center space-x-2">
          <div className={cn(
            'status-dot',
            device.online ? 'status-online' : 'status-offline'
          )}></div>
          <span className="text-xs text-muted-foreground">
            {device.online ? 'Online' : 'Offline'}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {formatLastUpdate(device.lastUpdate)}
        </span>
      </div>
    </div>
  );
}