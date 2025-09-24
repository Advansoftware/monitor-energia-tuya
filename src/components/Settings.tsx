'use client';

import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, DollarSign, Target, Bell, Save, RotateCcw } from 'lucide-react';
import { useModal } from './ModalProvider';

export default function Settings() {
  const [settings, setSettings] = useState({
    kwhPrice: 0.65,
    monthlyGoal: 300,
    highConsumptionThreshold: 500,
    notifications: {
      highConsumption: true,
      goalExceeded: true,
      dailyReport: false,
    },
    tariffType: 'conventional', // conventional, white, green
    peakHours: {
      start: '18:00',
      end: '21:00',
      price: 0.85,
    },
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { showAlert } = useModal();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      if (data.success && data.settings) {
        setSettings({ ...settings, ...data.settings });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev } as any;
      if (key.includes('.')) {
        const [parent, child] = key.split('.');
        newSettings[parent] = { ...newSettings[parent], [child]: value };
      } else {
        newSettings[key] = value;
      }
      return newSettings;
    });
    setHasChanges(true);
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();
      if (data.success) {
        setHasChanges(false);
        showAlert('Configurações salvas com sucesso!', 'success');
      } else {
        showAlert('Erro ao salvar configurações', 'error');
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      showAlert('Erro ao salvar configurações', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const resetToDefaults = () => {
    setSettings({
      kwhPrice: 0.65,
      monthlyGoal: 300,
      highConsumptionThreshold: 500,
      notifications: {
        highConsumption: true,
        goalExceeded: true,
        dailyReport: false,
      },
      tariffType: 'conventional',
      peakHours: {
        start: '18:00',
        end: '21:00',
        price: 0.85,
      },
    });
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <SettingsIcon className="h-6 w-6 text-primary-400" />
          <h2 className="text-xl font-bold text-dark-50">Configurações</h2>
        </div>
        
        {hasChanges && (
          <div className="flex space-x-2">
            <button
              onClick={resetToDefaults}
              className="btn-secondary flex items-center space-x-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Resetar</span>
            </button>
            <button
              onClick={saveSettings}
              disabled={isLoading}
              className="btn-primary flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{isLoading ? 'Salvando...' : 'Salvar'}</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-6">
        {/* Configurações de Tarifa */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <DollarSign className="h-5 w-5 text-green-400" />
            <h3 className="text-lg font-semibold text-dark-50">Configurações de Tarifa</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Tipo de Tarifa
              </label>
              <select
                value={settings.tariffType}
                onChange={(e) => handleSettingChange('tariffType', e.target.value)}
                className="input w-full"
              >
                <option value="conventional">Convencional</option>
                <option value="white">Tarifa Branca</option>
                <option value="green">Tarifa Verde</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Preço por kWh (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={settings.kwhPrice}
                onChange={(e) => handleSettingChange('kwhPrice', parseFloat(e.target.value) || 0)}
                className="input w-full"
              />
            </div>

            {settings.tariffType === 'white' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-dark-800 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">
                    Horário de Ponta - Início
                  </label>
                  <input
                    type="time"
                    value={settings.peakHours.start}
                    onChange={(e) => handleSettingChange('peakHours.start', e.target.value)}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">
                    Horário de Ponta - Fim
                  </label>
                  <input
                    type="time"
                    value={settings.peakHours.end}
                    onChange={(e) => handleSettingChange('peakHours.end', e.target.value)}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">
                    Preço Horário de Ponta (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={settings.peakHours.price}
                    onChange={(e) => handleSettingChange('peakHours.price', parseFloat(e.target.value) || 0)}
                    className="input w-full"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Metas e Limites */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <Target className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-dark-50">Metas e Limites</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Meta Mensal de Consumo (kWh)
              </label>
              <input
                type="number"
                min="0"
                value={settings.monthlyGoal}
                onChange={(e) => handleSettingChange('monthlyGoal', parseInt(e.target.value) || 0)}
                className="input w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Limite de Consumo Alto (W)
              </label>
              <input
                type="number"
                min="0"
                value={settings.highConsumptionThreshold}
                onChange={(e) => handleSettingChange('highConsumptionThreshold', parseInt(e.target.value) || 0)}
                className="input w-full"
              />
            </div>
          </div>
        </div>

        {/* Notificações */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="h-5 w-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-dark-50">Notificações</h3>
          </div>
          
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.notifications.highConsumption}
                onChange={(e) => handleSettingChange('notifications.highConsumption', e.target.checked)}
                className="mr-3 rounded border-dark-600 bg-dark-700 text-primary-500 focus:ring-primary-500 focus:ring-offset-dark-800"
              />
              <span className="text-dark-200">Alertar sobre consumo alto</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.notifications.goalExceeded}
                onChange={(e) => handleSettingChange('notifications.goalExceeded', e.target.checked)}
                className="mr-3 rounded border-dark-600 bg-dark-700 text-primary-500 focus:ring-primary-500 focus:ring-offset-dark-800"
              />
              <span className="text-dark-200">Alertar quando meta mensal for ultrapassada</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.notifications.dailyReport}
                onChange={(e) => handleSettingChange('notifications.dailyReport', e.target.checked)}
                className="mr-3 rounded border-dark-600 bg-dark-700 text-primary-500 focus:ring-primary-500 focus:ring-offset-dark-800"
              />
              <span className="text-dark-200">Relatório diário de consumo</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}