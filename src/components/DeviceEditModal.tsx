'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Wifi, WifiOff } from 'lucide-react';
import { Device } from '@/types';
import { Button } from './ui/Button';

interface DeviceEditModalProps {
  device: Device | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (deviceId: string, newName: string) => Promise<void>;
}

export default function DeviceEditModal({ device, isOpen, onClose, onSave }: DeviceEditModalProps) {
  const [newName, setNewName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (device) {
      setNewName(device.name);
    }
  }, [device]);

  const handleSave = async () => {
    if (!device || !newName.trim()) return;

    setIsLoading(true);
    try {
      await onSave(device.deviceId, newName.trim());
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!device) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-dark-800 border border-dark-600 p-6 shadow-2xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-lg font-semibold text-dark-50 flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${
                      device.online ? 'bg-green-600/20' : 'bg-red-600/20'
                    }`}>
                      {device.online ? (
                        <Wifi className="h-4 w-4 text-green-400" />
                      ) : (
                        <WifiOff className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                    <span>Editar Dispositivo</span>
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    disabled={isLoading}
                    className="p-1 hover:bg-dark-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <X className="h-5 w-5 text-dark-400" />
                  </button>
                </div>

                {/* Device Info */}
                <div className="space-y-4 mb-6">
                  <div className="bg-dark-700 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-dark-400">Status:</span>
                        <p className={`font-medium ${device.online ? 'text-green-400' : 'text-red-400'}`}>
                          {device.online ? 'Online' : 'Offline'}
                        </p>
                      </div>
                      <div>
                        <span className="text-dark-400">Potência:</span>
                        <p className="font-medium text-yellow-400">{device.power.toFixed(1)} W</p>
                      </div>
                      <div>
                        <span className="text-dark-400">ID do Dispositivo:</span>
                        <p className="font-medium text-dark-100 text-xs break-all">{device.deviceId}</p>
                      </div>
                      <div>
                        <span className="text-dark-400">Categoria:</span>
                        <p className="font-medium text-dark-100">{device.category}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-dark-600">
                      <span className="text-dark-400">Energia Total:</span>
                      <p className="font-medium text-blue-400">{device.totalEnergy.toFixed(2)} kWh</p>
                    </div>
                  </div>

                  {/* Name Input */}
                  <div>
                    <label htmlFor="deviceName" className="block text-sm font-medium text-dark-200 mb-2">
                      Nome do Dispositivo
                    </label>
                    <input
                      id="deviceName"
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !isLoading) {
                          handleSave();
                        }
                      }}
                      className="input-field w-full"
                      placeholder="Digite o nome do dispositivo"
                      disabled={isLoading}
                      autoFocus
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-3">
                  <Button
                    onClick={handleClose}
                    variant="secondary"
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    loading={isLoading}
                    disabled={!newName.trim() || newName === device.name}
                  >
                    Salvar Alterações
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}