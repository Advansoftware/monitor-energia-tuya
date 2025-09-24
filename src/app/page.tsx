'use client';

import { useState, useEffect } from 'react';
import { Activity, Zap, TrendingUp } from 'lucide-react';
import DeviceCard from '@/components/DeviceCard';
import EnergyChart from '@/components/EnergyChart';
import StatsCard from '@/components/StatsCard';
import Analytics from '@/components/Analytics';
import DeviceManager from '@/components/DeviceManager';
import History from '@/components/History';
import Settings from '@/components/Settings';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import { ModalProvider } from '@/components/ModalProvider';
import BottomNavigation from '@/components/BottomNavigation';
import MobileHeader from '@/components/MobileHeader';
import { Device, Settings as SettingsType } from '@/types';

export default function Home() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPower, setTotalPower] = useState(0);
  const [totalEnergy, setTotalEnergy] = useState(0);
  const [onlineCount, setOnlineCount] = useState(0);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [settings, setSettings] = useState<SettingsType | null>(null);

  useEffect(() => {
    fetchDevices();
    fetchSettings();
    const interval = setInterval(fetchDevices, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const stats = devices.reduce(
      (acc, device) => ({
        totalPower: acc.totalPower + device.power,
        totalEnergy: acc.totalEnergy + device.totalEnergy,
        onlineCount: acc.onlineCount + (device.online ? 1 : 0),
      }),
      { totalPower: 0, totalEnergy: 0, onlineCount: 0 }
    );
    
    setTotalPower(stats.totalPower);
    setTotalEnergy(stats.totalEnergy);
    setOnlineCount(stats.onlineCount);
  }, [devices]);

  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/devices');
      const data = await response.json();
      
      if (data.success) {
        setDevices(data.devices);
        setError(null);
      } else {
        setError(data.error || 'Erro ao carregar dispositivos');
      }
    } catch (err) {
      setError('Erro de conexão');
      console.error('Erro ao buscar dispositivos:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error('Erro ao buscar configurações:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card text-center animate-pulse">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-400 to-accent-400 opacity-20 animate-pulse"></div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-100 mb-1">Carregando...</h3>
              <p className="text-slate-400 text-sm">Conectando com dispositivos Tuya</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <ModalProvider>
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-slate-50">
        {/* Mobile Header */}
        <MobileHeader devices={devices} settings={settings || undefined} />
        
        {/* Main Content with padding for header and bottom nav */}
        <main className="pt-[calc(64px+env(safe-area-inset-top))] pb-[calc(72px+env(safe-area-inset-bottom))] px-4 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="mobile-card border border-red-500/30">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h4 className="text-red-200 font-medium text-sm">Erro de Conexão</h4>
                  <p className="text-red-300/80 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-3 rounded-xl shadow-lg">
                <Activity className="h-7 w-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">Monitor de Energia</h1>
              <p className="text-sm text-slate-400 flex items-center space-x-2">
                <span className="inline-flex items-center space-x-1">
                  <div className="w-2 h-2 bg-accent-400 rounded-full animate-pulse"></div>
                  <span>{devices.length} dispositivos</span>
                </span>
                <span>•</span>
                <span className="inline-flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>{onlineCount} online</span>
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`p-3 rounded-xl transition-all duration-300 ${
                activeTab === 'dashboard' 
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25' 
                  : 'hover:bg-white/10 text-slate-400 hover:text-slate-200'
              }`}
              title="Dashboard"
            >
              <Activity className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`p-3 rounded-xl transition-all duration-300 ${
                activeTab === 'analytics' 
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25' 
                  : 'hover:bg-white/10 text-slate-400 hover:text-slate-200'
              }`}
              title="Analytics"
            >
              <BarChart3 className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setActiveTab('devices')}
              className={`p-3 rounded-xl transition-all duration-300 ${
                activeTab === 'devices' 
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25' 
                  : 'hover:bg-white/10 text-slate-400 hover:text-slate-200'
              }`}
              title="Gerenciar Dispositivos"
            >
              <Cog className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`p-3 rounded-xl transition-all duration-300 ${
                activeTab === 'history' 
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25' 
                  : 'hover:bg-white/10 text-slate-400 hover:text-slate-200'
              }`}
              title="Histórico"
            >
              <HistoryIcon className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`p-3 rounded-xl transition-all duration-300 ${
                activeTab === 'settings' 
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25' 
                  : 'hover:bg-white/10 text-slate-400 hover:text-slate-200'
              }`}
              title="Configurações"
            >
              <SettingsIcon className="h-5 w-5" />
            </button>
            <NotificationSystem devices={devices} settings={settings || undefined} />
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6 animate-fade-in">
        {error && (
          <div className="glass-dark border border-red-500/30 rounded-xl p-4 animate-slide-up">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h4 className="text-red-200 font-medium text-sm">Erro de Conexão</h4>
                <p className="text-red-300/80 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation Mobile */}
        <div className="block sm:hidden">
          <div className="grid grid-cols-4 bg-dark-800 rounded-lg p-1 gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center justify-center py-2 rounded transition-colors ${
                activeTab === 'dashboard' ? 'bg-primary-600 text-white' : 'text-dark-400'
              }`}
            >
              <Activity className="h-4 w-4 mb-1" />
              <span className="text-xs">Home</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex flex-col items-center justify-center py-2 rounded transition-colors ${
                activeTab === 'analytics' ? 'bg-primary-600 text-white' : 'text-dark-400'
              }`}
            >
              <BarChart3 className="h-4 w-4 mb-1" />
              <span className="text-xs">Analytics</span>
            </button>
            <button
              onClick={() => setActiveTab('devices')}
              className={`flex flex-col items-center justify-center py-2 rounded transition-colors ${
                activeTab === 'devices' ? 'bg-primary-600 text-white' : 'text-dark-400'
              }`}
            >
              <Cog className="h-4 w-4 mb-1" />
              <span className="text-xs">Dispositivos</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex flex-col items-center justify-center py-2 rounded transition-colors ${
                activeTab === 'history' ? 'bg-primary-600 text-white' : 'text-dark-400'
              }`}
            >
              <HistoryIcon className="h-4 w-4 mb-1" />
              <span className="text-xs">Histórico</span>
            </button>
          </div>
        </div>

        {/* Content Based on Active Tab */}
        {activeTab === 'dashboard' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatsCard
                title="Potência Total"
                value={`${totalPower.toFixed(1)} W`}
                icon={Zap}
                trend={totalPower > 0 ? 'up' : 'neutral'}
              />
              <StatsCard
                title="Energia Total"
                value={`${totalEnergy.toFixed(2)} kWh`}
                icon={TrendingUp}
                trend="up"
              />
              <StatsCard
                title="Dispositivos Online"
                value={`${onlineCount}/${devices.length}`}
                icon={Activity}
                trend={onlineCount === devices.length ? 'up' : 'down'}
              />
            </div>

            {devices.length > 0 && (
              <div className="card">
                <h2 className="text-lg font-semibold mb-4">Consumo em Tempo Real</h2>
                <EnergyChart devices={devices} />
              </div>
            )}

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Dispositivos</h2>
              {devices.length === 0 ? (
                <div className="card text-center py-8">
                  <Activity className="h-12 w-12 text-dark-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-dark-300 mb-2">
                    Nenhum dispositivo encontrado
                  </h3>
                  <p className="text-dark-400">
                    Verifique se seus dispositivos Tuya estão configurados corretamente.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {devices.map((device) => (
                    <DeviceCard key={device.deviceId} device={device} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'analytics' && <Analytics devices={devices} />}

        {activeTab === 'devices' && (
          <DeviceManager devices={devices} onDevicesUpdate={fetchDevices} />
        )}

        {activeTab === 'history' && <History devices={devices} />}

        {activeTab === 'settings' && <Settings />}
      </main>
      
      <PWAInstallPrompt />
    </div>
    </ModalProvider>
  );
}
