'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Bell, X, AlertTriangle, TrendingUp, Target, Zap, Check, Trash2 } from 'lucide-react';
import { useModal } from './ModalProvider';
import { Device, Settings, Notification } from '@/types';
import { Button } from './ui/Button';

interface NotificationSystemProps {
  devices: Device[];
  settings?: Settings;
}

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
  onSwipe: (id: string, direction: 'left' | 'right') => void;
}

function NotificationItem({ notification, onRead, onDelete, onSwipe }: NotificationItemProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const constraintsRef = useRef(null);

  const getIcon = () => {
    switch (notification.type) {
      case 'high-consumption': return AlertTriangle;
      case 'energy-goal': return Target;
      case 'device-offline': return Zap;
      case 'prediction': return TrendingUp;
      default: return Bell;
    }
  };

  const getIconColor = () => {
    switch (notification.type) {
      case 'high-consumption': return 'text-red-400';
      case 'energy-goal': return 'text-green-400';
      case 'device-offline': return 'text-orange-400';
      case 'prediction': return 'text-blue-400';
      default: return 'text-primary';
    }
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    const threshold = 100;
    
    if (Math.abs(info.offset.x) > threshold) {
      const direction = info.offset.x > 0 ? 'right' : 'left';
      setSwipeDirection(direction);
      onSwipe(notification.id, direction);
    }
  };

  const Icon = getIcon();

  return (
    <motion.div
      ref={constraintsRef}
      className="relative overflow-hidden"
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        x: swipeDirection === 'left' ? -400 : swipeDirection === 'right' ? 400 : 0
      }}
      exit={{ 
        opacity: 0, 
        scale: 0.8,
        y: -30,
        x: swipeDirection === 'left' ? -400 : swipeDirection === 'right' ? 400 : 0,
        transition: { duration: 0.3, ease: "easeInOut" }
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        opacity: { duration: 0.2 }
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        drag="x"
        dragConstraints={{ left: -200, right: 200 }}
        dragElastic={0.2}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        className={`
          card cursor-grab active:cursor-grabbing transition-all duration-200
          ${isDragging ? 'shadow-lg scale-105' : ''}
          ${notification.read ? 'opacity-60' : ''}
        `}
        whileDrag={{ 
          scale: 1.05,
          rotate: isDragging ? (Math.random() - 0.5) * 2 : 0,
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
        }}
      >
        {/* Swipe Actions Background */}
        <div className="absolute inset-0 flex">
          {/* Left swipe - Delete */}
          <motion.div 
            className="flex-1 bg-red-500/20 flex items-center justify-start pl-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: isDragging ? 1 : 0 }}
          >
            <Trash2 className="h-5 w-5 text-red-400" />
          </motion.div>
          
          {/* Right swipe - Mark as read */}
          <motion.div 
            className="flex-1 bg-green-500/20 flex items-center justify-end pr-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: isDragging ? 1 : 0 }}
          >
            <Check className="h-5 w-5 text-green-400" />
          </motion.div>
        </div>

        {/* Notification Content */}
        <div className="relative z-10 bg-slate-800/80 backdrop-blur-sm rounded-lg p-4 border border-slate-700/30">
          <div className="flex items-start space-x-3">
            <motion.div
              className={`p-2 rounded-lg bg-dark-700 ${getIconColor()}`}
              whileHover={{ rotate: 5, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Icon className="h-4 w-4" />
            </motion.div>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <motion.h4 
                    className="font-medium text-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    {notification.title}
                  </motion.h4>
                  <motion.p 
                    className="text-sm text-slate-200 mt-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                  >
                    {notification.message}
                  </motion.p>
                  <motion.p 
                    className="text-xs text-slate-400 mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {notification.timestamp.toLocaleString('pt-BR')}
                  </motion.p>
                </div>

                <div className="flex items-center space-x-1 ml-2">
                  {!notification.read && (
                    <motion.button
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        onRead(notification.id);
                      }}
                      className="p-1 hover:bg-green-600/20 rounded-lg transition-colors"
                      title="Marcar como lida"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Check className="h-3 w-3 text-green-400" />
                    </motion.button>
                  )}
                  
                  <motion.button
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      onDelete(notification.id);
                    }}
                    className="p-1 hover:bg-red-600/20 rounded-lg transition-colors"
                    title="Excluir notificação"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="h-3 w-3 text-red-400" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>

          {/* Read indicator */}
          {!notification.read && (
            <motion.div
              className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function NotificationSystem({ devices, settings }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const { showAlert } = useModal();

  useEffect(() => {
    loadNotifications();
    checkForNotifications();
    const interval = setInterval(checkForNotifications, 60000);
    return () => clearInterval(interval);
  }, [devices, settings]);

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.map((notif: any) => ({
          ...notif,
          id: notif._id,
          timestamp: new Date(notif.createdAt || notif.timestamp)
        })));
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  const checkForNotifications = async () => {
    const newNotifications: Notification[] = [];
    const now = new Date();

    devices.forEach(device => {
      if (device.power > (settings?.highConsumptionThreshold || 500)) {
        const existingNotification = notifications.find(
          n => n.type === 'high-consumption' && n.deviceId === device.deviceId && !n.read
        );

        if (!existingNotification) {
          newNotifications.push({
            id: `high-consumption-${device.deviceId}-${Date.now()}`,
            type: 'high-consumption',
            title: 'Alto Consumo Detectado',
            message: `${device.name} está consumindo ${device.power.toFixed(1)}W`,
            deviceId: device.deviceId,
            read: false,
            timestamp: now
          });
        }
      }

      if (!device.online) {
        const existingNotification = notifications.find(
          n => n.type === 'device-offline' && n.deviceId === device.deviceId && !n.read
        );

        if (!existingNotification) {
          newNotifications.push({
            id: `device-offline-${device.deviceId}-${Date.now()}`,
            type: 'device-offline',
            title: 'Dispositivo Offline',
            message: `${device.name} está desconectado`,
            deviceId: device.deviceId,
            read: false,
            timestamp: now
          });
        }
      }
    });

    if (newNotifications.length > 0) {
      await saveNotifications(newNotifications);
      setNotifications(prev => [...newNotifications, ...prev]);
    }
  };

  const saveNotifications = async (newNotifications: Notification[]) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifications: newNotifications }),
      });
    } catch (error) {
      console.error('Erro ao salvar notificações:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, read: true }),
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
      }
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    setDeletingIds(prev => new Set([...prev, id]));
    
    try {
      const response = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        // Remove imediatamente para animação fluida
        setNotifications(prev => prev.filter(n => n.id !== id));
        setDeletingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    } catch (error) {
      console.error('Erro ao excluir notificação:', error);
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleSwipe = (id: string, direction: 'left' | 'right') => {
    if (direction === 'left') {
      deleteNotification(id);
    } else {
      markAsRead(id);
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    
    if (unreadNotifications.length === 0) return;
    
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'markAllAsRead',
          ids: unreadNotifications.map(n => n.id)
        }),
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, read: true }))
        );
      }
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const clearAll = async () => {
    if (notifications.length === 0) return;
    
    try {
      const response = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'clearAll',
          ids: notifications.map(n => n.id)
        }),
      });

      if (response.ok) {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Erro ao limpar todas as notificações:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <motion.button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 hover:bg-dark-700 rounded-lg transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Bell className="h-5 w-5 text-dark-300" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 500 }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Notification Panel */}
      <AnimatePresence>
        {showPanel && (
          <>
            {/* Invisible backdrop for closing */}
            <motion.div
              className="fixed inset-0 z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPanel(false)}
            />

            {/* Panel */}
            <motion.div
              className="absolute right-0 top-12 w-80 max-w-[90vw] max-h-[70vh] bg-slate-900/70 backdrop-blur-xl border border-slate-700/30 rounded-xl shadow-2xl z-40 overflow-hidden"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-600/50 bg-slate-800/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">Notificações</h3>
                  <motion.button
                    onClick={() => setShowPanel(false)}
                    className="p-1 hover:bg-slate-700/50 rounded-lg transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="h-4 w-4 text-slate-400" />
                  </motion.button>
                </div>
                
                {notifications.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={markAllAsRead}
                      variant="secondary"
                      size="sm"
                      disabled={unreadCount === 0}
                    >
                      Marcar Todas
                    </Button>
                    <Button
                      onClick={clearAll}
                      variant="destructive"
                      size="sm"
                    >
                      Limpar Todas
                    </Button>
                  </div>
                )}
              </div>

              {/* Notifications List */}
              <div className="overflow-y-auto max-h-96 p-2">
                <AnimatePresence mode="popLayout">
                  {notifications.length === 0 ? (
                    <motion.div
                      className="text-center py-8 text-dark-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhuma notificação</p>
                    </motion.div>
                  ) : (
                    <motion.div 
                      className="space-y-2"
                      layout
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                      {notifications.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onRead={markAsRead}
                          onDelete={deleteNotification}
                          onSwipe={handleSwipe}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}