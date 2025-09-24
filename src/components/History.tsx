'use client';

import { useState, useEffect } from 'react';
import { Calendar, Download, RefreshCw, TrendingUp, BarChart2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useModal } from './ModalProvider';
import { Device, EnergyReading, MonthlyStats } from '@/types';

interface HistoryProps {
  devices: Device[];
}

export default function History({ devices }: HistoryProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedDevice, setSelectedDevice] = useState('all');
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastCollection, setLastCollection] = useState<Date | null>(null);
  const { showAlert } = useModal();

  useEffect(() => {
    fetchHistoricalData();
    fetchMonthlyStats();
  }, [selectedPeriod, selectedDevice]);

  const fetchHistoricalData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        period: selectedPeriod,
        ...(selectedDevice !== 'all' && { deviceId: selectedDevice }),
      });
      
      const response = await fetch(`/api/readings?${params}`);
      const data = await response.json();
      
      if (data.success) {
        // Processar dados para o gráfico
        const processedData = processReadingsForChart(data.readings);
        setHistoricalData(processedData);
      }
    } catch (error) {
      console.error('Erro ao buscar dados históricos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyStats = async () => {
    try {
      const params = new URLSearchParams({
        ...(selectedDevice !== 'all' && { deviceId: selectedDevice }),
      });
      
      const response = await fetch(`/api/predictions?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setMonthlyStats(data.predictions);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas mensais:', error);
    }
  };

  const processReadingsForChart = (readings: EnergyReading[]) => {
    // Agrupar leituras por hora/dia dependendo do período
    const groupBy = selectedPeriod === '24h' ? 'hour' : 'day';
    const grouped = new Map();

    readings.forEach(reading => {
      const date = new Date(reading.timestamp);
      let key;
      
      if (groupBy === 'hour') {
        key = format(date, 'HH:00', { locale: ptBR });
      } else {
        key = format(date, 'dd/MM', { locale: ptBR });
      }

      if (!grouped.has(key)) {
        grouped.set(key, {
          time: key,
          totalPower: 0,
          totalEnergy: 0,
          count: 0,
        });
      }

      const entry = grouped.get(key);
      entry.totalPower += reading.power;
      entry.totalEnergy += reading.totalEnergy;
      entry.count += 1;
    });

    // Converter para array e calcular médias
    return Array.from(grouped.values()).map(entry => ({
      ...entry,
      avgPower: entry.totalPower / entry.count,
      avgEnergy: entry.totalEnergy / entry.count,
    })).sort((a, b) => a.time.localeCompare(b.time));
  };

  const collectData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/collect', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        setLastCollection(new Date());
        fetchHistoricalData();
        showAlert(`${data.collected} leituras coletadas com sucesso!`, 'success');
      } else {
        showAlert(data.error || 'Erro ao coletar dados', 'error');
      }
    } catch (error) {
      console.error('Erro ao coletar dados:', error);
      showAlert('Erro ao coletar dados', 'error');
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    if (historicalData.length === 0) {
      showAlert('Nenhum dado para exportar', 'warning');
      return;
    }

    // Criar conteúdo CSV
    const csvContent = [
      ['Período', 'Potência Média (W)', 'Energia Total (kWh)', 'Dispositivo'],
      ...historicalData.map(item => [
        item.time,
        item.avgPower.toFixed(2),
        item.avgEnergy.toFixed(3),
        selectedDevice === 'all' ? 'Todos os dispositivos' : devices.find(d => d.deviceId === selectedDevice)?.name || 'Desconhecido'
      ])
    ].map(row => row.join(',')).join('\n');

    // Criar e baixar o arquivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `energia_historico_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showAlert('Dados exportados com sucesso!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <h2 className="text-xl font-bold text-dark-50">Histórico e Relatórios</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={collectData}
            disabled={loading}
            className="btn-secondary flex items-center space-x-2"
            title="Coletar dados atuais dos dispositivos"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Coletar Dados</span>
          </button>
          <button
            onClick={exportData}
            className="btn-primary flex items-center space-x-2"
            disabled={historicalData.length === 0}
          >
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Período
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="input-field w-full"
            >
              <option value="24h">Últimas 24 horas</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Dispositivo
            </label>
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="input-field w-full"
            >
              <option value="all">Todos os dispositivos</option>
              {devices.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Historical Chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Consumo Histórico</h3>
          {lastCollection && (
            <span className="text-sm text-dark-400">
              Última coleta: {format(lastCollection, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
            </span>
          )}
        </div>
        
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5 animate-spin text-primary-500" />
              <span className="text-dark-400">Carregando dados...</span>
            </div>
          </div>
        ) : historicalData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-dark-400">
            <div className="text-center">
              <BarChart2 className="h-12 w-12 mx-auto mb-2 text-dark-500" />
              <p>Nenhum dado histórico disponível</p>
              <p className="text-sm">Clique em "Coletar Dados" para começar</p>
            </div>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="time" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  label={{ value: 'Potência (W)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                  }}
                  labelStyle={{ color: '#e5e7eb' }}
                />
                <Line
                  type="monotone"
                  dataKey="avgPower"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Monthly Statistics */}
      {monthlyStats.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-400" />
            <span>Estatísticas Mensais</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {monthlyStats.slice(0, 6).map((stat, index) => (
              <div key={index} className="bg-dark-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-dark-100">
                    {stat.month.toString().padStart(2, '0')}/{stat.year}
                  </h4>
                  <TrendingUp className="h-4 w-4 text-green-400" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-dark-400">Previsto:</span>
                    <p className="font-medium text-blue-400">
                      {stat.predictedConsumption.toFixed(1)} kWh
                    </p>
                    <p className="font-medium text-green-400">
                      R$ {stat.predictedCost.toFixed(2)}
                    </p>
                  </div>
                  {stat.actualConsumption && (
                    <div>
                      <span className="text-dark-400">Real:</span>
                      <p className="font-medium text-blue-400">
                        {stat.actualConsumption.toFixed(1)} kWh
                      </p>
                      <p className="font-medium text-green-400">
                        R$ {stat.actualCost?.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}