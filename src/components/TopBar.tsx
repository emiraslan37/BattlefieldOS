import React, { useEffect, useState } from 'react';
import type { Drone } from '../data/mockData';

interface TopBarProps {
  drones: Drone[];
  missionTime: string;
  alertCount: number;
}

const TopBar: React.FC<TopBarProps> = ({ drones, missionTime, alertCount }) => {
  const [clock, setClock] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = now.getUTCHours().toString().padStart(2, '0');
      const m = now.getUTCMinutes().toString().padStart(2, '0');
      const s = now.getUTCSeconds().toString().padStart(2, '0');
      setClock(`${h}:${m}:${s}Z`);
    };
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, []);

  const activeCount = drones.filter(d => d.status === 'ACTIVE' || d.status === 'IN MISSION').length;
  const avgBattery = drones.length > 0
    ? Math.round(drones.reduce((a, d) => a + d.battery, 0) / drones.length)
    : 0;

  return (
    <div
      className="panel-glass grid-overlay scanlines animate-flicker"
      style={{
        height: '52px',
        borderBottom: '1px solid rgba(0,212,255,0.25)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        position: 'relative',
        zIndex: 50,
        flexShrink: 0,
      }}
    >
      {/* Left: Branding */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '0 0 auto' }}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" stroke="#00d4ff" strokeWidth="1.5" fill="none" opacity="0.8"/>
          <polygon points="14,6 22,10 22,18 14,22 6,18 6,10" stroke="#00d4ff" strokeWidth="0.8" fill="rgba(0,212,255,0.05)"/>
          <circle cx="14" cy="14" r="3" fill="#00d4ff" opacity="0.9"/>
        </svg>

        <div>
          <div className="font-orbitron text-neon-blue" style={{ fontSize: '13px', letterSpacing: '3px', lineHeight: 1 }}>
            BATTLEFIELD OS
          </div>
          <div className="font-mono-tactical" style={{ fontSize: '8px', color: 'rgba(0,212,255,0.5)', letterSpacing: '2px' }}>
            v4.7.2 · TACTICAL COMMAND · TS//SCI
          </div>
        </div>

        <div style={{ width: '1px', height: '30px', background: 'rgba(0,212,255,0.2)' }} />

        <div>
          <div className="font-mono-tactical" style={{ fontSize: '7px', color: 'rgba(0,212,255,0.5)', letterSpacing: '2px' }}>ACTIVE MISSION</div>
          <div className="font-orbitron" style={{ fontSize: '10px', color: '#e0f4ff', letterSpacing: '2px' }}>
            BORDER SURVEILLANCE · OP SANDSTORM
          </div>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'rgba(0,255,136,0.08)',
          border: '1px solid rgba(0,255,136,0.3)',
          borderRadius: '2px', padding: '3px 10px',
        }}>
          <div className="animate-blink" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 6px #00ff88' }} />
          <span className="font-mono-tactical text-neon-green" style={{ fontSize: '10px', letterSpacing: '2px' }}>ACTIVE</span>
        </div>
      </div>

      {/* Center: Live metrics */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '32px', alignItems: 'center' }}>
        {[
          { label: 'ASSETS ONLINE', value: `${activeCount} / ${drones.length}`, color: '#00d4ff' },
          { label: 'AVG BATTERY', value: `${avgBattery}%`, color: avgBattery > 60 ? '#00ff88' : avgBattery > 30 ? '#ffcc00' : '#ff2d55' },
          { label: 'MISSION ELAPSED', value: missionTime, color: '#00d4ff' },
          { label: 'ALERTS', value: alertCount.toString(), color: alertCount > 0 ? '#ff2d55' : '#00ff88' },
        ].map(item => (
          <div key={item.label} style={{ textAlign: 'center' }}>
            <div className="font-mono-tactical" style={{ fontSize: '7px', color: 'rgba(200,230,240,0.4)', letterSpacing: '2px' }}>{item.label}</div>
            <div className="font-mono-tactical" style={{ fontSize: '14px', color: item.color, textShadow: `0 0 8px ${item.color}` }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Right: System status */}
      <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Signal bars */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '16px' }}>
          {[3, 6, 9, 12, 14].map((h, i) => (
            <div key={i} style={{ width: '3px', height: `${h}px`, background: i < 4 ? '#00d4ff' : 'rgba(0,212,255,0.2)', borderRadius: '1px' }} />
          ))}
        </div>

        <div style={{ width: '1px', height: '30px', background: 'rgba(0,212,255,0.2)' }} />

        <div style={{ textAlign: 'right' }}>
          <div className="font-mono-tactical" style={{ fontSize: '7px', color: 'rgba(200,230,240,0.4)', letterSpacing: '2px' }}>ZULU TIME</div>
          <div className="font-mono-tactical text-neon-blue" style={{ fontSize: '13px' }}>{clock}</div>
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {['SYS', 'NET', 'ENC'].map(icon => (
            <div key={icon} style={{
              padding: '2px 6px', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '2px',
              fontSize: '7px', fontFamily: 'Share Tech Mono,monospace', color: 'rgba(0,212,255,0.6)', letterSpacing: '1px',
            }}>{icon} ✓</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
