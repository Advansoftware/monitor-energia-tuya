'use client';

import { useState, useEffect } from 'react';
import { Bell, X, AlertTriangle, TrendingUp, Target, Zap } from 'lucide-react';
import { useModal } from './ModalProvider';

interface Notification {
  id: string;
  type: 'high-consumption' | 'goal-exceeded' | 'device-offline' | 'energy-saving';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  deviceId?: string;
  value?: number;
}

interface NotificationSystemProps {
  devices: any[];
  settings?: any;
}

export default function NotificationSystem({ devices, settings }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const { showAlert } = useModal();

  useEffect(() => {
    checkForNotifications();
    const interval = setInterval(checkForNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [devices, settings]);

  const checkForNotifications = async () => {
    const newNotifications: Notification[] = [];
    const now = new Date();

    // Check for high consumption
    devices.forEach(device => {
      if (device.power > (settings?.highConsumptionThreshold || 500)) {
        const existingNotification = notifications.find(
          n => n.type === 'high-consumption' && n.deviceId === device.deviceId && !n.read
        );

        if (!existingNotification) {
          newNotifications.push({
            id: `high-consumption-${device.deviceId}-${now.getTime()}`,
            type: 'high-consumption',
            title: 'Consumo Alto Detectado',
            message: `O dispositivo "${device.name}" está consumindo ${device.power}W, acima do limite de ${settings?.highConsumptionThreshold || 500}W.`,
            timestamp: now,
            read: false,
            deviceId: device.deviceId,
            value: device.power,
          });
        }
      }
    });

    // Check for offline devices
    devices.forEach(device => {
      if (!device.online) {
        const existingNotification = notifications.find(
          n => n.type === 'device-offline' && n.deviceId === device.deviceId && !n.read
        );

        if (!existingNotification) {
          newNotifications.push({
            id: `offline-${device.deviceId}-${now.getTime()}`,
            type: 'device-offline',
            title: 'Dispositivo Offline',
            message: `O dispositivo "${device.name}" está offline desde ${device.lastUpdate ? new Date(device.lastUpdate).toLocaleString() : 'data desconhecida'}.`,
            timestamp: now,
            read: false,
            deviceId: device.deviceId,
          });
        }
      }
    });

    // Check monthly goal (simplified check)
    if (settings?.monthlyGoal) {
      const totalMonthlyConsumption = devices.reduce((acc, device) => {
        return acc + ((device.power * 24 * 30) / 1000); // Estimate monthly consumption
      }, 0);

      if (totalMonthlyConsumption > settings.monthlyGoal) {
        const existingNotification = notifications.find(
          n => n.type === 'goal-exceeded' && !n.read
        );

        if (!existingNotification) {
          newNotifications.push({
            id: `goal-exceeded-${now.getTime()}`,
            type: 'goal-exceeded',
            title: 'Meta Mensal Ultrapassada',
            message: `O consumo estimado do mês (${totalMonthlyConsumption.toFixed(1)} kWh) ultrapassou sua meta de ${settings.monthlyGoal} kWh.`,
            timestamp: now,
            read: false,
            value: totalMonthlyConsumption,
          });
        }
      }
    }

    // Energy saving opportunities
    const highConsumptionDevices = devices.filter(d => d.power > 100);
    if (highConsumptionDevices.length > 0 && Math.random() < 0.1) { // 10% chance to show energy saving tip
      newNotifications.push({
        id: `savings-tip-${now.getTime()}`,
        type: 'energy-saving',
        title: 'Dica de Economia',
        message: `Você tem ${highConsumptionDevices.length} dispositivos com alto consumo. Considere otimizar o uso durante horários de pico.`,
        timestamp: now,
        read: false,
      });
    }

    if (newNotifications.length > 0) {
      setNotifications(prev => [...newNotifications, ...prev]);
      
      // Show immediate alert for critical notifications
      newNotifications.forEach(notification => {
        if (notification.type === 'high-consumption' || notification.type === 'goal-exceeded') {
          showAlert(notification.message, 'warning');
        }
      });
    }

    setLastCheck(now);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'high-consumption':
        return <AlertTriangle className="h-5 w-5 text-red-400" />;
      case 'goal-exceeded':
        return <Target className="h-5 w-5 text-orange-400" />;
      case 'device-offline':
        return <Zap className="h-5 w-5 text-gray-400" />;
      case 'energy-saving':
        return <TrendingUp className="h-5 w-5 text-green-400" />;
      default:
        return <Bell className="h-5 w-5 text-blue-400" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 rounded-lg hover:bg-dark-700 transition-colors"
        title="Notificações"
      >
        <Bell className="h-5 w-5 text-dark-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <div className="absolute right-0 top-12 w-96 max-h-96 bg-dark-800 border border-dark-600 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="p-4 border-b border-dark-600 flex items-center justify-between">
            <h3 className="font-semibold text-dark-50">Notificações</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary-400 hover:text-primary-300"
                >
                  Marcar todas como lidas
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Limpar todas
                </button>
              )}
              <button
                onClick={() => setShowPanel(false)}
                className="p-1 hover:bg-dark-700 rounded"
              >
                <X className="h-4 w-4 text-dark-400" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-dark-400">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              <div className="divide-y divide-dark-600">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-dark-700 transition-colors ${
                      !notification.read ? 'bg-dark-750' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {getIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-dark-50">
                            {notification.title}
                          </h4>
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 hover:bg-dark-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3 text-dark-400" />
                          </button>
                        </div>
                        <p className="text-xs text-dark-300 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-dark-500 mt-2">
                          {notification.timestamp.toLocaleString()}
                        </p>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs text-primary-400 hover:text-primary-300 mt-1"
                          >
                            Marcar como lida
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}