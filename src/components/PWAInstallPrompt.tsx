'use client';

import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isMinimal, setIsMinimal] = useState(true);

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after a delay to not interfere with page load
      setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-prompt-dismissed');
        const lastShown = localStorage.getItem('pwa-prompt-last-shown');
        const now = Date.now();
        
        // Show again after 3 days if dismissed
        if (!dismissed || (lastShown && now - parseInt(lastShown) > 3 * 24 * 60 * 60 * 1000)) {
          setShowPrompt(true);
        }
      }, 2000);
    };

    window.addEventListener('beforeinstallprompt', handler as EventListener);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      setShowPrompt(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener);
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
    localStorage.setItem('pwa-prompt-last-shown', Date.now().toString());
  };

  if (!showPrompt) return null;

  // Minimal version - just an icon button
  if (isMinimal) {
    return (
      <button
        onClick={() => setIsMinimal(false)}
        className="touch-target p-2 rounded-lg hover:bg-accent/50 transition-colors"
        title="Instalar como app"
      >
        <Download className="h-4 w-4 text-muted-foreground" />
      </button>
    );
  }

  // Expanded version
  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up md:bottom-4 md:left-auto md:right-4 md:w-80">
      <div className="mobile-card border border-border/50 shadow-xl">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Instalar App
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Acesso rápido e experiência nativa.
            </p>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleInstall}
                className="btn-primary btn-sm flex items-center space-x-1"
              >
                <Download className="h-3 w-3" />
                <span>Instalar</span>
              </button>
              
              <button
                onClick={handleDismiss}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Dispensar
              </button>
            </div>
          </div>
          
          <button
            onClick={() => setIsMinimal(true)}
            className="flex-shrink-0 p-1 hover:bg-accent/50 rounded transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}