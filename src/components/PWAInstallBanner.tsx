import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      Boolean((navigator as any).standalone)
    );
  });
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // 1. Skip if already standalone
    if (isInstalled) {
      return;
    }

    // 2. Check if user dismissed recently (within 3 days)
    const dismissedTime = localStorage.getItem('rently_pwa_dismissed');
    if (dismissedTime && Date.now() - Number(dismissedTime) < 3 * 24 * 60 * 60 * 1000) {
      return;
    }

    // 3. Capture beforeinstallprompt event (Chromium, Edge, Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. Also show banner on mobile Safari/iOS after a short delay if not standalone
    const isIos = /iPhone|iPad|iPod/.test(navigator.userAgent);
    let timer: NodeJS.Timeout | null = null;
    if (isIos && !isStandalone) {
      timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      if (timer) clearTimeout(timer);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } else {
      // iOS / browser without beforeinstallprompt
      setShowIosGuide(true);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('rently_pwa_dismissed', Date.now().toString());
  };

  if (!isVisible || isInstalled) {
    return null;
  }

  return (
    <div className="pwa-install-banner" role="dialog" aria-label="Install Rently Application">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <img
          src="/icons/icon-192.png"
          alt="Rently App Icon"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.4)',
            flexShrink: 0
          }}
        />
        <div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>Install Rently App</span>
            <span style={{
              fontSize: '0.62rem',
              background: 'rgba(16, 185, 129, 0.18)',
              color: '#34d399',
              padding: '1px 6px',
              borderRadius: '12px',
              fontWeight: 800
            }}>
              PWA
            </span>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '1px' }}>
            {showIosGuide
              ? 'Tap Share ⎋ then "Add to Home Screen" ⊞'
              : 'Instant offline launch · Live OTP badges'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
        {!showIosGuide && (
          <button
            type="button"
            className="btn-primary"
            onClick={handleInstallClick}
            style={{
              padding: '0.45rem 0.85rem',
              fontSize: '0.78rem',
              fontWeight: 700,
              gap: '0.35rem',
              borderRadius: '8px',
              whiteSpace: 'nowrap'
            }}
          >
            <Download size={14} />
            Install
          </button>
        )}
        <button
          type="button"
          onClick={handleDismiss}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: '4px',
            display: 'grid',
            placeItems: 'center',
            borderRadius: '6px'
          }}
          aria-label="Dismiss app install banner"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};
