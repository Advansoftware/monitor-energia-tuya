'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';

interface ModalContextType {
  showAlert: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  showConfirm: (message: string, description?: string) => Promise<boolean>;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider = ({ children }: ModalProviderProps) => {
  const [modal, setModal] = useState<{
    type: 'alert' | 'confirm';
    message: string;
    description?: string;
    alertType?: 'success' | 'error' | 'warning' | 'info';
    onConfirm?: () => void;
    onCancel?: () => void;
  } | null>(null);

  const showAlert = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setModal({
      type: 'alert',
      message,
      alertType: type,
    });
  };

  const showConfirm = (message: string, description?: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setModal({
        type: 'confirm',
        message,
        description,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
  };

  const closeModal = () => {
    setModal(null);
  };

  const handleConfirm = () => {
    if (modal?.onConfirm) {
      modal.onConfirm();
    }
    closeModal();
  };

  const handleCancel = () => {
    if (modal?.onCancel) {
      modal.onCancel();
    }
    closeModal();
  };

  const getIcon = () => {
    if (modal?.type === 'alert') {
      switch (modal.alertType) {
        case 'success':
          return <CheckCircle className="h-8 w-8 text-green-400" />;
        case 'error':
          return <AlertCircle className="h-8 w-8 text-red-400" />;
        case 'warning':
          return <AlertTriangle className="h-8 w-8 text-yellow-400" />;
        default:
          return <Info className="h-8 w-8 text-blue-400" />;
      }
    }
    return <AlertTriangle className="h-8 w-8 text-yellow-400" />;
  };

  const getColors = () => {
    if (modal?.type === 'alert') {
      switch (modal.alertType) {
        case 'success':
          return 'border-green-500/30 bg-green-900/20';
        case 'error':
          return 'border-red-500/30 bg-red-900/20';
        case 'warning':
          return 'border-yellow-500/30 bg-yellow-900/20';
        default:
          return 'border-blue-500/30 bg-blue-900/20';
      }
    }
    return 'border-yellow-500/30 bg-yellow-900/20';
  };

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm, closeModal }}>
      {children}
      
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`card max-w-md w-full border ${getColors()} animate-slide-up`}>
            <div className="flex items-start space-x-4">
              {getIcon()}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-dark-50 mb-2">
                  {modal.type === 'alert' ? 'Aviso' : 'Confirmação'}
                </h3>
                <p className="text-dark-200 text-sm leading-relaxed">
                  {modal.message}
                </p>
                {modal.description && (
                  <p className="text-dark-300 text-xs mt-1">
                    {modal.description}
                  </p>
                )}
              </div>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-dark-700 rounded transition-colors"
              >
                <X className="h-4 w-4 text-dark-400" />
              </button>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              {modal.type === 'confirm' ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="btn-primary"
                  >
                    Confirmar
                  </button>
                </>
              ) : (
                <button
                  onClick={closeModal}
                  className="btn-primary"
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};