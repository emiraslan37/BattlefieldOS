import React, { useEffect } from 'react';
import type { ThreatEvent } from '../data/mockData';

interface AlertSystemProps {
  alert: ThreatEvent | undefined;
  onDismiss: () => void;
}

const levelColor = (l: string) => {
  switch (l) {
    case 'CRITICAL': return '#ff2d55';
    case 'HIGH':     return '#ff6432';
    case 'MEDIUM':   return '#ffcc00';
    default:         return '#00ff88';
  }
};

const AlertSystem: React.FC<AlertSystemProps> = ({ alert, onDismiss }) => {
  // Auto-dismiss after 6 seconds
  useEffect(() => {
    if (!alert) return;
    const t = setTimeout(onDismiss, 6000);
    return () => clearTimeout(t);
  }, [alert, onDismiss]);

  if (!alert) return null;

  const color = levelColor(alert.level);

  return (
    <div
      style={{
        position: 'fixed',
        top: '64px',
        right: '16px',
        zIndex: 9999,
        width: '320px',
        animation: 'slide-in-right 0.3s ease',
      }}
    >
      <div
        style={{
          background: `rgba(5, 10, 15, 0.96)`,
          border: `1px solid ${color}`,
          borderLeft: `4px solid ${color}`,
          boxShadow: `0 0 20px ${color}44, 0 4px 20px rgba(0,0,0,0.8)`,
          backdropFilter: 'blur(16px)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        {/* Alert header */}
        <div style={{
          padding: '8px 12px',
          background: `${color}18`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${color}44`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="animate-blink" style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: color, boxShadow: `0 0 6px ${color}`,
            }} />
            <span className="font-orbitron" style={{ fontSize: '10px', color, letterSpacing: '2px' }}>
              ⚠ {alert.level} ALERT
            </span>
          </div>
          <button
            onClick={onDismiss}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(200,230,240,0.5)', fontSize: '14px', lineHeight: 1,
            }}
          >✕</button>
        </div>

        {/* Alert body */}
        <div style={{ padding: '10px 12px' }}>
          <div className="font-mono-tactical" style={{ fontSize: '11px', color: '#e0f4ff', lineHeight: 1.5, marginBottom: '8px' }}>
            {alert.msg}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="font-mono-tactical" style={{ fontSize: '8px', color: 'rgba(200,230,240,0.4)' }}>
              ID: {alert.id} · GRID: {alert.grid}
            </div>
            <div className="font-mono-tactical" style={{ fontSize: '8px', color: 'rgba(200,230,240,0.4)' }}>
              {alert.time}
            </div>
          </div>
        </div>

        {/* Progress bar (auto-dismiss indicator) */}
        <div style={{ height: '2px', background: `${color}22` }}>
          <div style={{
            height: '100%',
            background: color,
            animation: 'alert-drain 6s linear forwards',
            boxShadow: `0 0 4px ${color}`,
          }} />
        </div>
      </div>

      <style>{`
        @keyframes alert-drain {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes slide-in-right {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AlertSystem;
