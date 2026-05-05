import React from 'react';
import type { Drone } from '../data/mockData';
import type { SimActions } from '../hooks/useSimulation';

interface CommandConsoleProps {
  drone: Drone;
  onClose: () => void;
  actions: SimActions;
}

const statusColor = (s: string) => {
  switch (s) {
    case 'ACTIVE':      return '#00ff88';
    case 'IN MISSION':  return '#00d4ff';
    case 'STANDBY':     return '#ffcc00';
    case 'RTB':         return '#ff6432';
    case 'LOST SIGNAL': return '#ff2d55';
    default:            return '#888';
  }
};

function formatFlightTime(s: number) {
  const h = Math.floor(s / 3600).toString().padStart(2, '0');
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${h}:${m}:${sec}`;
}

const BatteryGauge: React.FC<{ value: number; label: string }> = ({ value, label }) => {
  const color = value > 60 ? '#00ff88' : value > 30 ? '#ffcc00' : '#ff2d55';
  const segments = 20;
  const active = Math.round((value / 100) * segments);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
        <span className="font-mono-tactical" style={{ fontSize: '7px', color: 'rgba(200,230,240,0.4)', letterSpacing: '1px' }}>{label}</span>
        <span className="font-mono-tactical" style={{ fontSize: '7px', color }}>{value.toFixed(0)}%</span>
      </div>
      <div style={{ display: 'flex', gap: '1px', height: '6px' }}>
        {Array.from({ length: segments }).map((_, i) => (
          <div key={i} style={{
            flex: 1,
            background: i < active ? color : 'rgba(255,255,255,0.05)',
            borderRadius: '1px',
            boxShadow: i < active ? `0 0 2px ${color}66` : 'none',
          }} />
        ))}
      </div>
    </div>
  );
};

const CommandConsole: React.FC<CommandConsoleProps> = ({ drone, onClose, actions }) => {
  const sc = statusColor(drone.status);

  return (
    <div style={{
      position: 'fixed',
      bottom: '145px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '520px',
      zIndex: 1000,
      animation: 'slide-up 0.3s ease',
    }}>
      <div style={{
        background: 'rgba(3, 8, 14, 0.97)',
        border: `1px solid ${sc}66`,
        borderTop: `2px solid ${sc}`,
        boxShadow: `0 0 30px ${sc}22, 0 -4px 20px rgba(0,0,0,0.9)`,
        backdropFilter: 'blur(20px)',
      }}>
        {/* Header */}
        <div style={{
          padding: '8px 16px',
          borderBottom: '1px solid rgba(0,212,255,0.12)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: `${sc}0a`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Drone icon */}
            <svg width="24" height="24" viewBox="0 0 24 24">
              <line x1="5" y1="12" x2="9" y2="9" stroke={sc} strokeWidth="1.5"/>
              <line x1="19" y1="12" x2="15" y2="9" stroke={sc} strokeWidth="1.5"/>
              <line x1="5" y1="12" x2="9" y2="15" stroke={sc} strokeWidth="1.5"/>
              <line x1="19" y1="12" x2="15" y2="15" stroke={sc} strokeWidth="1.5"/>
              <ellipse cx="12" cy="12" rx="3.5" ry="2" fill={`${sc}22`} stroke={sc} strokeWidth="1"/>
              <circle cx="5" cy="12" r="2.5" fill="none" stroke={`${sc}55`} strokeWidth="0.8"/>
              <circle cx="19" cy="12" r="2.5" fill="none" stroke={`${sc}55`} strokeWidth="0.8"/>
            </svg>
            <div>
              <div className="font-orbitron" style={{ fontSize: '12px', color: sc, letterSpacing: '2px' }}>{drone.id}</div>
              <div className="font-mono-tactical" style={{ fontSize: '8px', color: 'rgba(200,230,240,0.4)' }}>{drone.type}</div>
            </div>
            <div style={{
              padding: '2px 8px',
              border: `1px solid ${sc}44`,
              background: `${sc}14`,
              borderRadius: '1px',
              display: 'flex', alignItems: 'center', gap: '5px',
            }}>
              <div className="animate-blink" style={{ width: '5px', height: '5px', borderRadius: '50%', background: sc }} />
              <span className="font-mono-tactical" style={{ fontSize: '8px', color: sc, letterSpacing: '1px' }}>{drone.status}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className="font-mono-tactical" style={{ fontSize: '8px', color: 'rgba(200,230,240,0.3)' }}>
              FLIGHT: {formatFlightTime(drone.flightTime)}
            </span>
            <button onClick={onClose} style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(0,212,255,0.2)',
              color: 'rgba(200,230,240,0.6)',
              cursor: 'pointer',
              padding: '2px 8px',
              fontSize: '10px',
              fontFamily: 'Share Tech Mono',
              borderRadius: '1px',
            }}>✕ CLOSE</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
          {/* Left: Telemetry */}
          <div style={{ padding: '12px 16px', borderRight: '1px solid rgba(0,212,255,0.1)' }}>
            <div className="font-mono-tactical" style={{ fontSize: '7px', color: 'rgba(200,230,240,0.35)', letterSpacing: '2px', marginBottom: '10px' }}>
              ▸ LIVE TELEMETRY
            </div>

            {/* Gauges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              <BatteryGauge value={drone.battery} label="BATTERY" />
              <BatteryGauge value={drone.fuel} label="FUEL" />
              <BatteryGauge value={drone.signal} label="SIGNAL" />
            </div>

            {/* Grid metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {[
                { label: 'SPEED', value: drone.speed > 0 ? `${drone.speed.toFixed(0)} KT` : '—' },
                { label: 'ALTITUDE', value: drone.altitude > 0 ? `${drone.altitude.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} FT` : 'GND' },
                { label: 'HEADING', value: drone.altitude > 0 ? `${drone.heading.toFixed(0)}°` : '—' },
                { label: 'PAYLOAD', value: drone.payload },
                { label: 'LAT', value: drone.lat.toFixed(4) },
                { label: 'LNG', value: drone.lng.toFixed(4) },
              ].map(m => (
                <div key={m.label} style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(0,212,255,0.08)',
                  padding: '4px 6px',
                  borderRadius: '1px',
                }}>
                  <div className="font-mono-tactical" style={{ fontSize: '6px', color: 'rgba(200,230,240,0.35)' }}>{m.label}</div>
                  <div className="font-mono-tactical" style={{ fontSize: '9px', color: '#c8e6f0' }}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Command */}
          <div style={{ padding: '12px 16px' }}>
            <div className="font-mono-tactical" style={{ fontSize: '7px', color: 'rgba(200,230,240,0.35)', letterSpacing: '2px', marginBottom: '10px' }}>
              ▸ ISSUE COMMAND
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { cmd: 'ORBIT' as const, label: 'ORBIT CURRENT POSITION', desc: 'Hold position and loiter', color: '#00d4ff', icon: '⊙' },
                { cmd: 'RESUME' as const, label: 'RESUME MISSION', desc: 'Continue waypoint patrol', color: '#00ff88', icon: '▶' },
                { cmd: 'RTB' as const, label: 'RETURN TO BASE', desc: 'RTB immediately', color: '#ff6432', icon: '⌂' },
                { cmd: 'STANDBY' as const, label: 'GROUND STANDBY', desc: 'Hold on ground', color: '#ffcc00', icon: '⏸' },
              ].map(({ cmd, label, desc, color, icon }) => (
                <button
                  key={cmd}
                  onClick={() => actions.commandDrone(drone.id, cmd)}
                  style={{
                    background: drone.status === cmd ? `${color}18` : 'rgba(0,0,0,0.3)',
                    border: `1px solid ${drone.status === cmd ? color : 'rgba(0,212,255,0.15)'}`,
                    borderLeft: `3px solid ${color}`,
                    cursor: 'pointer',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    borderRadius: '1px',
                    boxShadow: drone.status === cmd ? `0 0 8px ${color}22` : 'none',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = `${color}12`;
                    (e.currentTarget as HTMLElement).style.borderColor = color;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = drone.status === cmd ? `${color}18` : 'rgba(0,0,0,0.3)';
                    (e.currentTarget as HTMLElement).style.borderColor = drone.status === cmd ? color : 'rgba(0,212,255,0.15)';
                  }}
                >
                  <span style={{ color, fontSize: '14px', width: '16px', textAlign: 'center' }}>{icon}</span>
                  <div>
                    <div className="font-mono-tactical" style={{ fontSize: '9px', color: '#c8e6f0', letterSpacing: '1px' }}>{label}</div>
                    <div className="font-mono-tactical" style={{ fontSize: '7px', color: 'rgba(200,230,240,0.35)' }}>{desc}</div>
                  </div>
                  {drone.status === cmd && (
                    <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: color, boxShadow: `0 0 4px ${color}` }} className="animate-blink" />
                  )}
                </button>
              ))}
            </div>

            {/* Waypoints */}
            <div style={{ marginTop: '10px' }}>
              <div className="font-mono-tactical" style={{ fontSize: '7px', color: 'rgba(200,230,240,0.35)', letterSpacing: '2px', marginBottom: '4px' }}>
                ▸ WAYPOINTS ({drone.waypoints.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxHeight: '60px', overflowY: 'auto' }}>
                {drone.waypoints.map((wp, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{
                      width: '14px', height: '14px',
                      borderRadius: '50%',
                      border: `1px solid ${i === drone.waypointIndex ? '#00d4ff' : 'rgba(0,212,255,0.2)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '6px',
                      fontFamily: 'Share Tech Mono',
                      color: i === drone.waypointIndex ? '#00d4ff' : 'rgba(0,212,255,0.3)',
                      flexShrink: 0,
                    }}>{i + 1}</span>
                    <span className="font-mono-tactical" style={{ fontSize: '7px', color: i === drone.waypointIndex ? '#c8e6f0' : 'rgba(200,230,240,0.3)' }}>
                      {wp[0].toFixed(4)}, {wp[1].toFixed(4)}
                    </span>
                    {i === drone.waypointIndex && <span style={{ marginLeft: 'auto', fontSize: '7px', color: '#00d4ff' }}>← NEXT</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateX(-50%) translateY(20px); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default CommandConsole;
