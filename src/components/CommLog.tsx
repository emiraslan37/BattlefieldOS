import React, { useRef, useEffect } from 'react';
import type { CommEntry, ThreatEvent } from '../data/mockData';

interface CommLogProps {
  comms: CommEntry[];
  events: ThreatEvent[];
}

const levelColor = (l: string) => {
  switch (l) {
    case 'CRITICAL': return '#ff2d55';
    case 'HIGH':     return '#ff6432';
    case 'MEDIUM':   return '#ffcc00';
    default:         return '#00ff88';
  }
};

const CommLog: React.FC<CommLogProps> = ({ comms, events }) => {
  const commsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (commsRef.current) {
      commsRef.current.scrollTop = 0;
    }
  }, [comms.length]);

  return (
    <div style={{
      width: '240px',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      borderLeft: '1px solid rgba(0,212,255,0.15)',
      background: 'rgba(5,10,15,0.92)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '7px 12px',
        borderBottom: '1px solid rgba(0,212,255,0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
      }}>
        <div>
          <div className="font-orbitron" style={{ fontSize: '9px', color: '#00d4ff', letterSpacing: '2px' }}>
            COMM LOG
          </div>
          <div className="font-mono-tactical" style={{ fontSize: '7px', color: 'rgba(200,230,240,0.3)' }}>
            ENCRYPTED · AES-256
          </div>
        </div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <div className="animate-blink" style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 4px #00ff88' }} />
          <span className="font-mono-tactical" style={{ fontSize: '7px', color: '#00ff88' }}>LIVE</span>
        </div>
      </div>

      {/* Comm messages */}
      <div
        ref={commsRef}
        style={{ flex: '0 0 45%', overflowY: 'auto', padding: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}
      >
        {comms.map((c, i) => (
          <div
            key={c.id}
            style={{
              padding: '5px 7px',
              border: '1px solid rgba(0,212,255,0.08)',
              borderRadius: '1px',
              background: i === 0 ? 'rgba(0,212,255,0.04)' : 'transparent',
              transition: 'background 0.3s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <span className="font-mono-tactical" style={{ fontSize: '7px', color: '#00d4ff' }}>{c.from}</span>
                <span style={{ color: 'rgba(200,230,240,0.3)', fontSize: '7px' }}>→</span>
                <span className="font-mono-tactical" style={{ fontSize: '7px', color: 'rgba(200,230,240,0.6)' }}>{c.to}</span>
              </div>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                {c.encrypted && (
                  <span style={{ fontSize: '7px', color: '#ffcc00', opacity: 0.6 }}>🔒</span>
                )}
                <span className="font-mono-tactical" style={{ fontSize: '6px', color: 'rgba(200,230,240,0.3)' }}>{c.time}</span>
              </div>
            </div>
            <div className="font-mono-tactical" style={{ fontSize: '8px', color: '#c8e6f0', lineHeight: 1.4 }}>
              {c.msg}
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{
        padding: '5px 12px 4px',
        borderTop: '1px solid rgba(0,212,255,0.1)',
        borderBottom: '1px solid rgba(0,212,255,0.1)',
        background: 'rgba(0,0,0,0.2)',
        flexShrink: 0,
      }}>
        <div className="font-mono-tactical" style={{ fontSize: '7px', color: 'rgba(200,230,240,0.35)', letterSpacing: '2px' }}>
          ▸ THREAT EVENT LOG
        </div>
      </div>

      {/* Threat events */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {events.map((evt, i) => {
          const color = levelColor(evt.level);
          return (
            <div
              key={evt.id}
              style={{
                padding: '4px 6px',
                borderLeft: `2px solid ${color}`,
                background: i === 0 ? `${color}08` : 'transparent',
                borderRadius: '0 2px 2px 0',
                transition: 'background 0.3s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
                <span className="font-mono-tactical" style={{ fontSize: '6px', color }}>
                  {evt.level}
                </span>
                <span className="font-mono-tactical" style={{ fontSize: '6px', color: 'rgba(200,230,240,0.3)' }}>
                  {evt.time} · {evt.grid}
                </span>
              </div>
              <div className="font-mono-tactical" style={{ fontSize: '7.5px', color: i === 0 ? '#e0f4ff' : '#c8e6f0', lineHeight: 1.3 }}>
                {evt.msg}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CommLog;
