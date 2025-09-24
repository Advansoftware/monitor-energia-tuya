'use client';

import { useState } from 'react';
import { Search, Edit2, Trash2, Plus, Wifi, WifiOff } from 'lucide-react';
import { useModal } from './ModalProvider';
import { Device } from '@/types';
import { Button } from './ui/Button';
import PageLayout from './PageLayout';
import DeviceEditModal from './DeviceEditModal';

interface DeviceManagerProps {
  devices: Device[];
  onDevicesUpdate: () => void;
}

export default function DeviceManager({ devices, onDevicesUpdate }: DeviceManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const { showAlert, showConfirm } = useModal();

  const filteredDevices = devices.filter(device =>
    device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.deviceId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startEdit = (device: Device) => {
    setEditingDevice(device);
  };

  const saveEdit = async (deviceId: string, newName: string) => {
    if (!newName.trim()) return;

    try {
      const response = await fetch(`/api/devices/${deviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (response.ok) {
        setEditingDevice(null);
        onDevicesUpdate();
        showAlert('Dispositivo renomeado com sucesso!', 'success');
      } else {
        showAlert('Erro ao renomear dispositivo', 'error');
      }
    } catch (error) {
      console.error('Erro ao renomear dispositivo:', error);
      showAlert('Erro ao renomear dispositivo', 'error');
      throw error;
    }
  };

  const closeEditModal = () => {
    setEditingDevice(null);
  };

  const deleteDevice = async (deviceId: string, deviceName: string) => {
    const confirmed = await showConfirm(
      `Tem certeza que deseja remover o dispositivo "${deviceName}"?`, 
      'Todos os dados relacionados serão perdidos.'
    );
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/devices/${deviceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onDevicesUpdate();
      } else {
        showAlert('Erro ao remover dispositivo', 'error');
      }
    } catch (error) {
      console.error('Erro ao remover dispositivo:', error);
      showAlert('Erro ao remover dispositivo', 'error');
    }
  };

  const discoverDevices = async () => {
    setIsDiscovering(true);
    try {
      const response = await fetch('/api/devices/discover', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        showAlert(`${data.newDevices} novos dispositivos descobertos!`, 'success');
        onDevicesUpdate();
      } else {
        showAlert(data.error || 'Erro ao descobrir dispositivos', 'error');
      }
    } catch (error) {
      console.error('Erro ao descobrir dispositivos:', error);
      showAlert('Erro ao descobrir dispositivos', 'error');
    } finally {
      setIsDiscovering(false);
    }
  };

  return (
    <PageLayout
      title="Gerenciar Dispositivos"
      titleIcon={<Search className="h-6 w-6 text-primary" />}
      actions={
        <Button
          onClick={discoverDevices}
          disabled={isDiscovering}
          loading={isDiscovering}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>{isDiscovering ? 'Descobrindo...' : 'Descobrir Novos'}</span>
        </Button>
      }
    >

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dark-400" />
        <input
          type="text"
          placeholder="Buscar dispositivos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10 w-full"
        />
      </div>

      {/* Devices List */}
      <div className="space-y-3">
        {filteredDevices.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-dark-400">
              {searchTerm ? 'Nenhum dispositivo encontrado para a busca' : 'Nenhum dispositivo disponível'}
            </p>
          </div>
        ) : (
          filteredDevices.map((device) => (
            <div key={device.deviceId} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  {/* Status Icon */}
                  <div className={`p-2 rounded-lg ${
                    device.online ? 'bg-green-600/20' : 'bg-red-600/20'
                  }`}>
                    {device.online ? (
                      <Wifi className="h-5 w-5 text-green-400" />
                    ) : (
                      <WifiOff className="h-5 w-5 text-red-400" />
                    )}
                  </div>

                  {/* Device Info */}
                  <div className="flex-1">
                    <div>
                      <h3 className="font-semibold text-dark-50">{device.name}</h3>
                      <p className="text-sm text-dark-400">ID: {device.deviceId}</p>
                      <p className="text-sm text-dark-400">Categoria: {device.category}</p>
                    </div>
                  </div>

                  {/* Device Stats */}
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-dark-100">
                      {device.power.toFixed(1)} W
                    </p>
                    <p className="text-xs text-dark-400">
                      {device.totalEnergy.toFixed(2)} kWh total
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => startEdit(device)}
                    className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                    title="Editar dispositivo"
                  >
                    <Edit2 className="h-4 w-4 text-dark-400 hover:text-dark-100" />
                  </button>
                  <button
                    onClick={() => deleteDevice(device.deviceId, device.name)}
                    className="p-2 hover:bg-red-600/20 rounded-lg transition-colors"
                    title="Remover dispositivo"
                  >
                    <Trash2 className="h-4 w-4 text-red-400 hover:text-red-300" />
                  </button>
                </div>
              </div>

              {/* Mobile Stats */}
              <div className="block sm:hidden mt-3 pt-3 border-t border-dark-700">
                <div className="flex justify-between text-sm">
                  <span className="text-dark-400">Potência: {device.power.toFixed(1)} W</span>
                  <span className="text-dark-400">Total: {device.totalEnergy.toFixed(2)} kWh</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {devices.length > 0 && (
        <div className="card bg-dark-700">
          <h3 className="font-semibold text-dark-100 mb-3">Resumo</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-dark-400">Total de Dispositivos:</span>
              <p className="font-medium text-dark-100">{devices.length}</p>
            </div>
            <div>
              <span className="text-dark-400">Online:</span>
              <p className="font-medium text-green-400">
                {devices.filter(d => d.online).length}
              </p>
            </div>
            <div>
              <span className="text-dark-400">Offline:</span>
              <p className="font-medium text-red-400">
                {devices.filter(d => !d.online).length}
              </p>
            </div>
            <div>
              <span className="text-dark-400">Potência Total:</span>
              <p className="font-medium text-yellow-400">
                {devices.reduce((sum, d) => sum + d.power, 0).toFixed(1)} W
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Device Edit Modal */}
      <DeviceEditModal
        device={editingDevice}
        isOpen={!!editingDevice}
        onClose={closeEditModal}
        onSave={saveEdit}
      />
    </PageLayout>
  );
}