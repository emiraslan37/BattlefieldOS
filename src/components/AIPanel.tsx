import React, { useState } from 'react';
import { AI_ACTIONS } from '../data/mockData';
import type { Drone, Target, ThreatEvent } from '../data/mockData';

const riskColor = (risk: string) => {
  switch (risk) {
    case 'HIGH':   return '#ff2d55';
    case 'MEDIUM': return '#ffcc00';
    case 'LOW':    return '#00ff88';
    default:       return '#00d4ff';
  }
};

const CHART_DATA = [65, 80, 45, 92, 38, 72, 88, 55, 78, 91, 48, 70];
const LINE_DATA  = [30, 45, 42, 68, 55, 72, 65, 80, 73, 90, 84, 95];

interface AIPanelProps {
  drones: Drone[];
  targets: Target[];
  events: ThreatEvent[];
}

const RadialThreat: React.FC<{ score: number }> = ({ score }) => {
  const r = 38;
  const circumference = 2 * Math.PI * r;
  const dash = (score / 100) * circumference;
  const color = score > 75 ? '#ff2d55' : score > 50 ? '#ff6432' : '#ffcc00';

  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="threat-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={`${color}88`} />
        </linearGradient>
      </defs>
      {[30, 34, 38, 42].map(rr => (
        <circle key={rr} cx="50" cy="50" r={rr} fill="none" stroke="rgba(0,212,255,0.05)" strokeWidth="0.8" />
      ))}
      <circle cx="50" cy="50" r={r} fill="none" stroke={`${color}18`} strokeWidth="7" />
      <circle
        cx="50" cy="50" r={r} fill="none"
        stroke="url(#threat-grad)" strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference}`}
        transform="rotate(-90 50 50)"
        style={{ filter: `drop-shadow(0 0 4px ${color}88)`, transition: 'stroke-dasharray 0.5s ease' }}
      />
      <text x="50" y="46" textAnchor="middle" fill={color} fontSize="20" fontFamily="Orbitron,sans-serif" fontWeight="700">{score}</text>
      <text x="50" y="57" textAnchor="middle" fill={`${color}88`} fontSize="6.5" fontFamily="Share Tech Mono">THREAT SCORE</text>
      {Array.from({length:12}).map((_,i) => {
        const angle = (i/12)*360-90;
        const rad = angle*Math.PI/180;
        return <line key={i}
          x1={50+44*Math.cos(rad)} y1={50+44*Math.sin(rad)}
          x2={50+48*Math.cos(rad)} y2={50+48*Math.sin(rad)}
          stroke="rgba(0,212,255,0.2)" strokeWidth="0.5"/>;
      })}
    </svg>
  );
};

const AIPanel: React.FC<AIPanelProps> = ({ drones, targets }) => {
  const [selectedAction, setSelectedAction] = useState<number>(1);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Compute threat score from live targets
  const threatScore = Math.min(100, Math.round(
    targets.reduce((acc, t) => {
      return acc + (t.threat === 'CRITICAL' ? 30 : t.threat === 'HIGH' ? 20 : t.threat === 'MEDIUM' ? 10 : 3);
    }, 0) + drones.filter(d => d.battery < 30).length * 5
  ));

  const activeCount = drones.filter(d => d.status === 'ACTIVE' || d.status === 'IN MISSION').length;

  const handleAction = (id: number) => {
    setProcessingId(id);
    setTimeout(() => { setSelectedAction(id); setProcessingId(null); }, 800);
  };

  return (
    <div
      className="panel-glass grid-overlay-sm"
      style={{
        width: '230px', flexShrink: 0,
        display: 'flex', flexDirection: 'column',
        borderLeft: '1px solid rgba(0,212,255,0.15)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '7px 12px',
        borderBottom: '1px solid rgba(0,212,255,0.15)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="font-orbitron" style={{ fontSize: '9px', color: '#00d4ff', letterSpacing: '2px' }}>AI DECISION ENGINE</div>
            <div className="font-mono-tactical" style={{ fontSize: '7px', color: 'rgba(200,230,240,0.3)' }}>GPT-TACTICAL v7.2</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
            <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
              <div className="animate-pulse-blue" style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#00d4ff' }} />
              <span className="font-mono-tactical" style={{ fontSize: '7px', color: '#00d4ff' }}>ONLINE</span>
            </div>
            <span className="font-mono-tactical" style={{ fontSize: '6px', color: 'rgba(200,230,240,0.3)' }}>CONF: 98.4%</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Threat radial */}
        <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(0,212,255,0.1)' }}>
          <div className="font-mono-tactical" style={{ fontSize: '7px', color: 'rgba(200,230,240,0.4)', letterSpacing: '2px', marginBottom: '4px' }}>
            ▸ THREAT ASSESSMENT
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <RadialThreat score={threatScore} />
          </div>
          {/* Live sub-metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginTop: '4px' }}>
            {[
              { label: 'HOSTILE', value: targets.filter(t => t.threat === 'CRITICAL' || t.threat === 'HIGH').length, color: '#ff2d55' },
              { label: 'UNKNOWN', value: targets.filter(t => t.threat === 'MEDIUM').length, color: '#ffcc00' },
              { label: 'ONLINE', value: activeCount, color: '#00d4ff' },
              { label: 'LOW BAT', value: drones.filter(d => d.battery < 40).length, color: '#ff6432' },
            ].map(m => (
              <div key={m.label} style={{
                background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(0,212,255,0.1)',
                padding: '4px 6px', borderRadius: '1px',
              }}>
                <div className="font-mono-tactical" style={{ fontSize: '6px', color: 'rgba(200,230,240,0.4)' }}>{m.label}</div>
                <div className="font-mono-tactical" style={{ fontSize: '14px', color: m.color, textShadow: `0 0 6px ${m.color}` }}>{m.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended actions */}
        <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(0,212,255,0.1)' }}>
          <div className="font-mono-tactical" style={{ fontSize: '7px', color: 'rgba(200,230,240,0.4)', letterSpacing: '2px', marginBottom: '6px' }}>
            ▸ RECOMMENDED ACTIONS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {AI_ACTIONS.map(action => (
              <div
                key={action.id}
                onClick={() => handleAction(action.id)}
                className="tactical-hover"
                style={{
                  padding: '7px 8px',
                  border: `1px solid ${action.recommended || selectedAction === action.id ? 'rgba(0,212,255,0.4)' : 'rgba(0,212,255,0.1)'}`,
                  borderRadius: '2px', cursor: 'pointer',
                  background: selectedAction === action.id ? 'rgba(0,212,255,0.07)' : action.recommended ? 'rgba(0,212,255,0.04)' : 'rgba(0,0,0,0.2)',
                  position: 'relative', transition: 'all 0.2s ease',
                }}
              >
                {action.recommended && (
                  <div style={{
                    position: 'absolute', top: '-6px', right: '6px',
                    background: '#00d4ff', padding: '1px 5px',
                    fontSize: '6px', fontFamily: 'Share Tech Mono,monospace',
                    color: '#000', fontWeight: 700, letterSpacing: '1px',
                  }}>★ RECOMMENDED</div>
                )}
                <div className="font-mono-tactical" style={{ fontSize: '8px', color: '#c8e6f0', marginBottom: '4px', lineHeight: 1.3 }}>
                  {processingId === action.id ? '⟳ PROCESSING...' : action.action}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1, marginRight: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span className="font-mono-tactical" style={{ fontSize: '6px', color: 'rgba(200,230,240,0.4)' }}>SUCCESS</span>
                      <span className="font-mono-tactical" style={{ fontSize: '6px', color: '#00ff88' }}>{action.successRate}%</span>
                    </div>
                    <div style={{ height: '3px', background: 'rgba(0,255,136,0.1)', borderRadius: '1px', overflow: 'hidden' }}>
                      <div style={{ width: `${action.successRate}%`, height: '100%', background: 'linear-gradient(90deg,#00ff88,rgba(0,255,136,0.5))', transition: 'width 0.5s' }} />
                    </div>
                  </div>
                  <div style={{
                    padding: '2px 4px',
                    border: `1px solid ${riskColor(action.risk)}44`,
                    background: `${riskColor(action.risk)}14`,
                    fontSize: '6px', fontFamily: 'Share Tech Mono,monospace',
                    color: riskColor(action.risk), whiteSpace: 'nowrap',
                  }}>{action.risk}</div>
                </div>
                <div className="font-mono-tactical" style={{ fontSize: '6px', color: 'rgba(200,230,240,0.3)', marginTop: '3px' }}>
                  ETA: {action.eta} · CONF: {action.confidence}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity bar chart */}
        <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(0,212,255,0.1)' }}>
          <div className="font-mono-tactical" style={{ fontSize: '7px', color: 'rgba(200,230,240,0.4)', letterSpacing: '2px', marginBottom: '6px' }}>
            ▸ ACTIVITY (24H)
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '36px' }}>
            {CHART_DATA.map((val, i) => (
              <div key={i} style={{
                flex: 1, height: `${val}%`,
                background: val > 80 ? 'linear-gradient(180deg,#ff2d55,rgba(255,45,85,0.4))'
                  : val > 60 ? 'linear-gradient(180deg,#ffcc00,rgba(255,204,0,0.3))'
                  : 'linear-gradient(180deg,#00d4ff,rgba(0,212,255,0.3))',
                borderRadius: '1px 1px 0 0',
                boxShadow: val > 80 ? '0 0 4px rgba(255,45,85,0.4)' : '0 0 3px rgba(0,212,255,0.2)',
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
            {['00:00', '12:00', 'NOW'].map(l => (
              <span key={l} className="font-mono-tactical" style={{ fontSize: '6px', color: 'rgba(200,230,240,0.3)' }}>{l}</span>
            ))}
          </div>

          {/* Threat trend line */}
          <div className="font-mono-tactical" style={{ fontSize: '7px', color: 'rgba(200,230,240,0.4)', letterSpacing: '2px', marginTop: '8px', marginBottom: '3px' }}>
            ▸ THREAT TREND
          </div>
          <svg width="100%" height="28" viewBox="0 0 206 28" preserveAspectRatio="none">
            <defs>
              <linearGradient id="line-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,45,85,0.3)" />
                <stop offset="100%" stopColor="rgba(255,45,85,0)" />
              </linearGradient>
            </defs>
            <polyline
              points={LINE_DATA.map((v, i) => `${(i/(LINE_DATA.length-1))*206},${28-(v/100)*26}`).join(' ')}
              fill="none" stroke="#ff2d55" strokeWidth="1.5"
              style={{ filter: 'drop-shadow(0 0 3px rgba(255,45,85,0.6))' }}
            />
            <polygon
              points={['0,28', ...LINE_DATA.map((v,i) => `${(i/(LINE_DATA.length-1))*206},${28-(v/100)*26}`), '206,28'].join(' ')}
              fill="url(#line-area)"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default AIPanel;
