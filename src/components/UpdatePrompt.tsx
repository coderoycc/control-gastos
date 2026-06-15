import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export function UpdatePrompt() {
  const [visible, setVisible] = useState(false);

  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW({
    onRegisterError(error) {
      console.error('[PWA] Error al registrar el Service Worker:', error);
    },
  });

  useEffect(() => {
    if (!needRefresh) return;
    setVisible(true);
    updateServiceWorker(true);
    const timer = setTimeout(() => setVisible(false), 3500);
    return () => clearTimeout(timer);
  }, [needRefresh, updateServiceWorker]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        height: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        background: '#4f46e5',
        color: '#fff',
        fontSize: '0.72rem',
        fontWeight: 500,
        fontFamily: 'inherit',
        letterSpacing: '0.01em',
        boxShadow: '0 1px 8px rgba(79,70,229,0.4)',
        animation: 'slideDown 0.25s ease',
      }}
    >
      <span style={{ opacity: 0.85 }}>✦</span>
      <span>Actualizando aplicación…</span>
      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
