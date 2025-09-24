'use client';

import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Don't show if user already dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) {
      setShowPrompt(false);
    }
  }, []);

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up">
      <div className="glass-dark border border-white/20 rounded-2xl p-4 shadow-2xl">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="bg-gradient-to-r from-primary-500 to-accent-500 p-3 rounded-xl">
              <Smartphone className="h-6 w-6 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-100 mb-1">
              Instalar App
            </h3>
            <p className="text-slate-300 text-sm mb-4">
              Adicione o Monitor de Energia à sua tela inicial para acesso rápido e experiência nativa.
            </p>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleInstall}
                className="btn-primary flex items-center space-x-2 text-sm"
              >
                <Download className="h-4 w-4" />
                <span>Instalar</span>
              </button>
              
              <button
                onClick={handleDismiss}
                className="text-slate-400 hover:text-slate-200 text-sm transition-colors"
              >
                Agora não
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
}