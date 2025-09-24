'use client';

import { 
  Activity, 
  BarChart3, 
  History as HistoryIcon, 
  Settings as SettingsIcon,
  Cog 
} from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = [
  {
    id: 'dashboard',
    label: 'Início',
    icon: Activity,
  },
  {
    id: 'analytics',
    label: 'Análises',
    icon: BarChart3,
  },
  {
    id: 'history',
    label: 'Histórico',
    icon: HistoryIcon,
  },
  {
    id: 'devices',
    label: 'Dispositivos',
    icon: Cog,
  },
  {
    id: 'settings',
    label: 'Configurações',
    icon: SettingsIcon,
  },
];

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <>
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border">
        {/* Safe area padding for devices with home indicator */}
        <div className="pb-safe">
          <div className="flex items-center justify-around px-2 py-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`
                    flex flex-col items-center justify-center
                    min-w-[64px] min-h-[56px] px-3 py-2
                    rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }
                  `}
                  aria-label={item.label}
                >
                  <Icon 
                    size={20} 
                    className={`mb-1 ${isActive ? 'scale-110' : ''} transition-transform`} 
                  />
                  <span className={`text-xs font-medium ${isActive ? '' : 'opacity-80'}`}>
                    {item.label}
                  </span>
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
      
      {/* Bottom padding to prevent content from being hidden behind navigation */}
      <div className="h-[calc(56px+env(safe-area-inset-bottom))]" />
    </>
  );
}