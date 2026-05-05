import React from 'react';
import type { Drone } from '../data/mockData';
import type { SimActions } from '../hooks/useSimulation';

const statusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE':      return '#00ff88';
    case 'IN MISSION':  return '#00d4ff';
    case 'STANDBY':     return '#ffcc00';
    case 'RTB':         return '#ff6432';
    case 'LOST SIGNAL': return '#ff2d55';
    default:            return '#888';
  }
};

const BatteryBar: React.FC<{ value: number }> = ({ value }) => {
  const color = value > 60 ? '#00ff88' : value > 30 ? '#ffcc00' : '#ff2d55';
  const segments = 10;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
      <div style={{ display: 'flex', gap: '1px' }}>
        {Array.from({ length: segments }).map((_, i) => (
          <div key={i} style={{
            width: '5px', height: '8px',
            background: i < Math.round((value / 100) * segments) ? color : 'rgba(255,255,255,0.05)',
            borderRadius: '1px',
            boxShadow: i < Math.round((value / 100) * segments) ? `0 0 3px ${color}66` : 'none',
            transition: 'background 0.4s',
          }} />
        ))}
        <div style={{ width: '2px', height: '5px', background: 'rgba(255,255,255,0.15)', borderRadius: '0 1px 1px 0', marginTop: '1.5px' }} />
      </div>
      <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: '8px', color, minWidth: '26px' }}>
        {value.toFixed(0)}%
      </span>
    </div>
  );
};

const SignalBars: React.FC<{ value: number }> = ({ value }) => {
  const bars = 5;
  const active = Math.round((value / 100) * bars);
  const color = value > 60 ? '#00d4ff' : value > 30 ? '#ffcc00' : '#ff2d55';
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1px', height: '12px' }}>
      {Array.from({ length: bars }).map((_, i) => (
        <div key={i} style={{
          width: '4px', height: `${4 + i * 2}px`,
          background: i < active ? color : 'rgba(255,255,255,0.07)',
          borderRadius: '1px',
          boxShadow: i < active ? `0 0 3px ${color}55` : 'none',
          transition: 'background 0.4s',
        }} />
      ))}
    </div>
  );
};

function formatFlightTime(s: number) {
  const h = Math.floor(s / 3600).toString().padStart(2, '0');
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${h}:${m}:${sec}`;
}

interface BottomPanelProps {
  drones: Drone[];
  missionTime: string;
  selectedDroneId: string | null;
  actions: SimActions;
}

const BottomPanel: React.FC<BottomPanelProps> = ({ drones, missionTime, selectedDroneId, actions }) => {
  return (
    <div
      className="panel-glass grid-overlay"
      style={{
        height: '130px',
        flexShrink: 0,
        borderTop: '1px solid rgba(0,212,255,0.2)',
        display: 'flex',
        overflow: 'hidden',
      }}
    >
      {/* Section: Mission timer */}
      <div style={{
        width: '170px', flexShrink: 0,
        padding: '10px 14px',
        borderRight: '1px solid rgba(0,212,255,0.12)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}>
        <div className="font-mono-tactical" style={{ fontSize: '7px', color: 'rgba(200,230,240,0.4)', letterSpacing: '2px', marginBottom: '4px' }}>
          MISSION ELAPSED
        </div>
        <div className="font-orbitron" style={{
          fontSize: '26px', color: '#00d4ff',
          textShadow: '0 0 12px rgba(0,212,255,0.6)',
          lineHeight: 1, letterSpacing: '2px',
        }}>
          {missionTime}
        </div>
        <div className="font-mono-tactical" style={{ fontSize: '7px', color: 'rgba(200,230,240,0.3)', marginTop: '5px' }}>
          START: 01:06:22Z · OP SANDSTORM
        </div>
        <div style={{ display: 'flex', gap: '4px', marginTop: '5px', flexWrap: 'wrap' }}>
          {['PHASE 2', 'GRID B', 'AUTH L4'].map(tag => (
            <div key={tag} style={{
              padding: '1px 5px', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '1px',
              fontSize: '6px', fontFamily: 'Share Tech Mono,monospace', color: 'rgba(0,212,255,0.5)',
            }}>{tag}</div>
          ))}
        </div>
      </div>

      {/* Drone cards */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minWidth: 0 }}>
        {drones.map((drone, idx) => {
          const sc = statusColor(drone.status);
          const isSelected = drone.id === selectedDroneId;
          return (
            <div
              key={drone.id}
              onClick={() => actions.selectDrone(isSelected ? null : drone.id)}
              className="tactical-hover"
              style={{
                flex: 1, padding: '8px 9px',
                borderRight: idx < drones.length - 1 ? '1px solid rgba(0,212,255,0.08)' : 'none',
                display: 'flex', flexDirection: 'column', gap: '3px',
                cursor: 'pointer', minWidth: 0,
                background: isSelected ? `${sc}08` : 'transparent',
                borderTop: isSelected ? `2px solid ${sc}` : '2px solid transparent',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Header row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <svg width="16" height="16" viewBox="0 0 18 18" className={drone.status !== 'STANDBY' ? 'animate-drone' : ''}>
                    <line x1="4" y1="9" x2="7" y2="7" stroke={sc} strokeWidth="1.2"/>
                    <line x1="14" y1="9" x2="11" y2="7" stroke={sc} strokeWidth="1.2"/>
                    <line x1="4" y1="9" x2="7" y2="11" stroke={sc} strokeWidth="1.2"/>
                    <line x1="14" y1="9" x2="11" y2="11" stroke={sc} strokeWidth="1.2"/>
                    <ellipse cx="9" cy="9" rx="2.5" ry="1.5" fill={`${sc}33`} stroke={sc} strokeWidth="0.8"/>
                    <circle cx="4" cy="9" r="2" fill="none" stroke={`${sc}55`} strokeWidth="0.6"/>
                    <circle cx="14" cy="9" r="2" fill="none" stroke={`${sc}55`} strokeWidth="0.6"/>
                  </svg>
                  <div>
                    <div className="font-orbitron" style={{ fontSize: '8px', color: '#c8e6f0', letterSpacing: '1px' }}>{drone.id}</div>
                    <div className="font-mono-tactical" style={{ fontSize: '6px', color: 'rgba(200,230,240,0.3)' }}>{drone.type.split(' ')[0]}</div>
                  </div>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '3px',
                  padding: '1px 4px',
                  border: `1px solid ${sc}44`,
                  background: `${sc}12`,
                  borderRadius: '1px',
                }}>
                  {(drone.status === 'ACTIVE' || drone.status === 'IN MISSION') &&
                    <div className="animate-blink" style={{ width: '3px', height: '3px', borderRadius: '50%', background: sc }} />
                  }
                  <span style={{ fontSize: '6px', fontFamily: 'Share Tech Mono,monospace', color: sc }}>{drone.status}</span>
                </div>
              </div>

              {/* Mission */}
              <div className="font-mono-tactical" style={{ fontSize: '6px', color: 'rgba(200,230,240,0.4)' }}>
                {drone.mission} · {formatFlightTime(drone.flightTime)}
              </div>

              {/* Battery */}
              <BatteryBar value={drone.battery} />

              {/* Signal */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <SignalBars value={drone.signal} />
                <span className="font-mono-tactical" style={{ fontSize: '6px', color: 'rgba(200,230,240,0.4)' }}>
                  {drone.signal.toFixed(0)}%
                </span>
              </div>

              {/* Telemetry */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {[
                  { k: 'SPD', v: drone.speed > 0 ? `${drone.speed.toFixed(0)}KT` : '—' },
                  { k: 'ALT', v: drone.altitude > 0 ? `${(drone.altitude/1000).toFixed(1)}KFT` : 'GND' },
                  { k: 'HDG', v: drone.altitude > 0 ? `${drone.heading.toFixed(0)}°` : '—' },
                ].map(t => (
                  <div key={t.k} className="font-mono-tactical" style={{ fontSize: '6px', color: 'rgba(200,230,240,0.5)' }}>
                    <span style={{ color: 'rgba(200,230,240,0.3)' }}>{t.k} </span>{t.v}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* System status */}
      <div style={{
        width: '130px', flexShrink: 0,
        padding: '10px 12px',
        borderLeft: '1px solid rgba(0,212,255,0.12)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        <div className="font-mono-tactical" style={{ fontSize: '7px', color: 'rgba(200,230,240,0.4)', letterSpacing: '2px', marginBottom: '6px' }}>
          SYS STATUS
        </div>
        {[
          { label: 'COMMS', value: 98, ok: true },
          { label: 'DATA LINK', value: 94, ok: true },
          { label: 'EW SHIELD', value: 87, ok: true },
          { label: 'GPS LOCK', value: 100, ok: true },
        ].map(sys => (
          <div key={sys.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span className="font-mono-tactical" style={{ fontSize: '6.5px', color: 'rgba(200,230,240,0.4)' }}>{sys.label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '30px', height: '3px', background: 'rgba(0,212,255,0.1)', borderRadius: '1px', overflow: 'hidden' }}>
                <div style={{
                  width: `${sys.value}%`, height: '100%',
                  background: sys.ok ? '#00ff88' : '#ff2d55',
                  boxShadow: '0 0 4px rgba(0,255,136,0.4)',
                  transition: 'width 0.5s ease',
                }} />
              </div>
              <span className="font-mono-tactical" style={{ fontSize: '6px', color: sys.ok ? '#00ff88' : '#ff2d55' }}>{sys.value}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BottomPanel;
