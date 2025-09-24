import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend: 'up' | 'down' | 'neutral';
  change?: string;
}

export default function StatsCard({ title, value, icon: Icon, trend, change }: StatsCardProps) {
  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-dark-400',
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-primary-600/20 p-2 rounded-lg">
            <Icon className="h-5 w-5 text-primary-400" />
          </div>
          <div>
            <p className="text-sm text-dark-400">{title}</p>
            <p className="text-xl font-bold text-dark-50">{value}</p>
          </div>
        </div>
        {change && (
          <div className={cn('flex items-center space-x-1', trendColors[trend])}>
            <TrendIcon className="h-4 w-4" />
            <span className="text-sm font-medium">{change}</span>
          </div>
        )}
      </div>
    </div>
  );
}