'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, Calculator } from 'lucide-react';
import { useModal } from './ModalProvider';

interface AnalyticsProps {
  devices: any[];
}

export default function Analytics({ devices }: AnalyticsProps) {
  const [kwhPrice, setKwhPrice] = useState(0.65);
  const [monthlyPredictions, setMonthlyPredictions] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState({
    consumption: 0,
    cost: 0,
    prediction: 0,
  });
  const { showAlert } = useModal();

  useEffect(() => {
    fetchSettings();
    calculateMonthlyStats();
  }, [devices]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      if (data.success) {
        setKwhPrice(data.settings.kwhPrice);
      }
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
    }
  };

  const calculateMonthlyStats = () => {
    if (devices.length === 0) return;

    // Calcular consumo atual baseado na potência dos dispositivos
    const totalPower = devices.reduce((sum, device) => sum + device.power, 0);
    
    // Estimar consumo mensal (assumindo uso médio de 12h/dia)
    const dailyConsumption = (totalPower * 12) / 1000; // kWh por dia
    const monthlyConsumption = dailyConsumption * 30; // kWh por mês
    const monthlyCost = monthlyConsumption * kwhPrice;

    setCurrentMonth({
      consumption: monthlyConsumption,
      cost: monthlyCost,
      prediction: monthlyCost,
    });
  };

  const savePrediction = async () => {
    try {
      for (const device of devices) {
        const deviceConsumption = (device.power * 12 * 30) / 1000; // kWh mensal estimado
        
        await fetch('/api/predictions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deviceId: device.deviceId,
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1,
            predictedConsumption: deviceConsumption,
            kwhPrice,
          }),
        });
      }
      
      showAlert('Previsões salvas com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao salvar previsões:', error);
      showAlert('Erro ao salvar previsões', 'error');
    }
  };

  const updateKwhPrice = async (newPrice: number) => {
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kwhPrice: newPrice }),
      });
      
      setKwhPrice(newPrice);
      calculateMonthlyStats();
    } catch (error) {
      console.error('Erro ao atualizar preço kWh:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuração de Preço */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <DollarSign className="h-5 w-5 text-green-400" />
          <span>Configurações de Custo</span>
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">
              Preço do kWh (R$)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                step="0.01"
                value={kwhPrice}
                onChange={(e) => updateKwhPrice(parseFloat(e.target.value))}
                className="input-field flex-1"
                placeholder="0.65"
              />
              <span className="text-sm text-dark-400">R$/kWh</span>
            </div>
          </div>
        </div>
      </div>

      {/* Previsão Mensal */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-blue-400" />
          <span>Previsão do Mês Atual</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-dark-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-400">Consumo Previsto</p>
                <p className="text-xl font-bold text-blue-400">
                  {(currentMonth.consumption || 0).toFixed(1)} kWh
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-dark-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-400">Custo Previsto</p>
                <p className="text-xl font-bold text-green-400">
                  R$ {(currentMonth.cost || 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-dark-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-400">Economia Estimada</p>
                <p className="text-xl font-bold text-yellow-400">
                  R$ {((currentMonth.cost || 0) * 0.1).toFixed(2)}
                </p>
                <p className="text-xs text-dark-500">vs. mês anterior</p>
              </div>
              <Calculator className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-dark-700">
          <button
            onClick={savePrediction}
            className="btn-primary"
          >
            Salvar Previsão Atual
          </button>
        </div>
      </div>

      {/* Detalhes por Dispositivo */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Análise por Dispositivo</h3>
        
        <div className="space-y-3">
          {devices.map((device) => {
            const deviceConsumption = (device.power * 12 * 30) / 1000;
            const deviceCost = deviceConsumption * kwhPrice;
            const percentage = currentMonth.consumption > 0 ? (deviceConsumption / currentMonth.consumption) * 100 : 0;
            
            return (
              <div key={device.deviceId} className="bg-dark-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-dark-100">{device.name}</h4>
                  <span className="text-sm text-dark-400">
                    {isNaN(percentage) || !isFinite(percentage) ? '0.0' : percentage.toFixed(1)}% do total
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-dark-400">Potência:</span>
                    <p className="font-medium text-dark-100">{(device.power || 0).toFixed(1)} W</p>
                  </div>
                  <div>
                    <span className="text-dark-400">Consumo/mês:</span>
                    <p className="font-medium text-dark-100">{(deviceConsumption || 0).toFixed(1)} kWh</p>
                  </div>
                  <div>
                    <span className="text-dark-400">Custo/mês:</span>
                    <p className="font-medium text-green-400">R$ {(deviceCost || 0).toFixed(2)}</p>
                  </div>
                </div>
                
                {/* Barra de Progresso */}
                <div className="mt-3">
                  <div className="w-full bg-dark-600 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(isNaN(percentage) ? 0 : percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}