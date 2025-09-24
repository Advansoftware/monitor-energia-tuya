'use client';

import { useState, useEffect } from 'react';
import { Activity, Zap, TrendingUp, Settings as SettingsIcon, BarChart3, Cog, History as HistoryIcon } from 'lucide-react';
import DeviceCard from '@/components/DeviceCard';
import EnergyChart from '@/components/EnergyChart';
import StatsCard from '@/components/StatsCard';
import Analytics from '@/components/Analytics';
import DeviceManager from '@/components/DeviceManager';
import History from '@/components/History';
import Settings from '@/components/Settings';
import NotificationSystem from '@/components/NotificationSystem';
import { ModalProvider } from '@/components/ModalProvider';

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

export default function Home() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPower, setTotalPower] = useState(0);
  const [totalEnergy, setTotalEnergy] = useState(0);
  const [onlineCount, setOnlineCount] = useState(0);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [settings, setSettings] = useState<any>(null);

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
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <span className="text-dark-100">Carregando dispositivos...</span>
        </div>
      </div>
    );
  }

  return (
    <ModalProvider>
      <div className="min-h-screen bg-dark-900 text-dark-50">
      <header className="bg-dark-800 border-b border-dark-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-600 p-2 rounded-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-dark-50">Monitor de Energia</h1>
              <p className="text-sm text-dark-400">
                {devices.length} dispositivos • {onlineCount} online
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`p-2 rounded-lg transition-colors ${
                activeTab === 'dashboard' ? 'bg-primary-600 text-white' : 'hover:bg-dark-700 text-dark-400'
              }`}
              title="Dashboard"
            >
              <Activity className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`p-2 rounded-lg transition-colors ${
                activeTab === 'analytics' ? 'bg-primary-600 text-white' : 'hover:bg-dark-700 text-dark-400'
              }`}
              title="Analytics"
            >
              <BarChart3 className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setActiveTab('devices')}
              className={`p-2 rounded-lg transition-colors ${
                activeTab === 'devices' ? 'bg-primary-600 text-white' : 'hover:bg-dark-700 text-dark-400'
              }`}
              title="Gerenciar Dispositivos"
            >
              <Cog className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`p-2 rounded-lg transition-colors ${
                activeTab === 'history' ? 'bg-primary-600 text-white' : 'hover:bg-dark-700 text-dark-400'
              }`}
              title="Histórico"
            >
              <HistoryIcon className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`p-2 rounded-lg transition-colors ${
                activeTab === 'settings' ? 'bg-primary-600 text-white' : 'hover:bg-dark-700 text-dark-400'
              }`}
              title="Configurações"
            >
              <SettingsIcon className="h-5 w-5" />
            </button>
            <NotificationSystem devices={devices} settings={settings} />
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-red-500 rounded-full"></div>
              <span className="text-red-200">{error}</span>
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
    </div>
    </ModalProvider>
  );
}
