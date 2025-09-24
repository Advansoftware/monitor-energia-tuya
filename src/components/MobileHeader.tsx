'use client';

import { Bell } from 'lucide-react';
import NotificationSystem from './NotificationSystemEnhanced';
import PWAInstallPrompt from './PWAInstallPrompt';
import { Device, Settings } from '@/types';

interface MobileHeaderProps {
  devices: Device[];
  settings?: Settings;
}

export default function MobileHeader({ devices, settings }: MobileHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-b border-border">
      {/* Safe area padding for devices with notch */}
      <div className="pt-safe">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo/Title */}
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Monitor Energia
              </h1>
              <p className="text-xs text-muted-foreground">
                Controle inteligente
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Subtle PWA Install */}
            <div className="opacity-60 hover:opacity-100 transition-opacity">
              <PWAInstallPrompt />
            </div>
            
            {/* Notifications */}
            <NotificationSystem devices={devices} settings={settings} />
          </div>
        </div>
      </div>
    </header>
  );
}