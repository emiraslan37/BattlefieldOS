import React, { useState } from 'react';
import { ISR_FEEDS } from '../data/mockData';

const threatColor = (level: string) => {
  switch (level) {
    case 'CRITICAL': return '#ff2d55';
    case 'HIGH':     return '#ff6432';
    case 'MEDIUM':   return '#ffcc00';
    default:         return '#00ff88';
  }
};

const FeedPanel: React.FC = () => {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div
      className="panel-glass grid-overlay-sm"
      style={{
        width: '210px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid rgba(0,212,255,0.15)',
        overflow: 'hidden',
      }}
    >
      {/* Panel header */}
      <div style={{
        padding: '7px 12px',
        borderBottom: '1px solid rgba(0,212,255,0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
      }}>
        <div>
          <div className="font-orbitron" style={{ fontSize: '9px', color: '#00d4ff', letterSpacing: '2px' }}>ISR FEEDS</div>
          <div className="font-mono-tactical" style={{ fontSize: '7px', color: 'rgba(200,230,240,0.3)', letterSpacing: '1px' }}>
            INTEL SURVEILLANCE RECON
          </div>
        </div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <div className="animate-blink" style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#ff2d55', boxShadow: '0 0 4px #ff2d55' }} />
          <span className="font-mono-tactical text-neon-red" style={{ fontSize: '8px' }}>REC</span>
        </div>
      </div>

      {/* Feed cards */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {ISR_FEEDS.map((feed) => (
          <div
            key={feed.id}
            className="corner-brackets tactical-hover"
            onClick={() => setActiveId(activeId === feed.id ? null : feed.id)}
            style={{
              border: `1px solid ${activeId === feed.id ? threatColor(feed.threatLevel) : 'rgba(0,212,255,0.15)'}`,
              borderRadius: '2px',
              cursor: 'pointer',
              background: activeId === feed.id ? 'rgba(0,212,255,0.04)' : 'rgba(0,0,0,0.2)',
              transition: 'all 0.2s ease',
              boxShadow: activeId === feed.id ? `0 0 12px ${threatColor(feed.threatLevel)}22` : 'none',
            }}
          >
            {/* Feed image */}
            <div style={{ position: 'relative', height: '85px', overflow: 'hidden', background: '#000' }}>
              <img
                src={feed.imageUrl}
                alt={feed.label}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  filter: 'brightness(0.5) saturate(0.3) sepia(0.2)',
                }}
              />
              {/* Night-vision overlay */}
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,30,10,0.45)', mixBlendMode: 'multiply' }} />
              {/* Scanlines */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.2) 3px,rgba(0,0,0,0.2) 4px)',
              }} />

              {/* Detection boxes */}
              {feed.detections.map((det, i) => {
                const dc = det.confidence > 90 ? '#ff2d55' : '#ffcc00';
                return (
                  <div key={i} style={{
                    position: 'absolute', left: `${det.x}%`, top: `${det.y}%`,
                    width: `${det.w}%`, height: `${det.h}%`,
                    border: `1px solid ${dc}`,
                    boxShadow: `0 0 4px ${dc}66`,
                  }}>
                    {/* Corner marks */}
                    {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h]) => (
                      <div key={`${v}${h}`} style={{
                        position:'absolute', [v]: 0, [h]: 0, width: '4px', height: '4px',
                        [`border${v.charAt(0).toUpperCase()+v.slice(1)}Width`]: '1px',
                        [`border${h.charAt(0).toUpperCase()+h.slice(1)}Width`]: '1px',
                        borderColor: dc, borderStyle: 'solid',
                      }} />
                    ))}
                    <div style={{
                      position:'absolute', top: '-12px', left: 0, whiteSpace:'nowrap',
                      background: `${dc}cc`, padding: '1px 3px',
                      fontSize: '5.5px', fontFamily: 'Share Tech Mono,monospace', color: '#000', fontWeight: 700,
                    }}>{det.label}</div>
                  </div>
                );
              })}

              {/* LIVE badge */}
              <div style={{
                position:'absolute', top:'4px', right:'4px',
                display:'flex', alignItems:'center', gap:'3px',
                background:'rgba(0,0,0,0.7)', border:'1px solid rgba(255,45,85,0.4)',
                padding:'1px 4px', borderRadius:'1px',
              }}>
                <div className="animate-blink" style={{ width:'4px', height:'4px', borderRadius:'50%', background:'#ff2d55' }} />
                <span className="font-mono-tactical" style={{ fontSize:'7px', color:'#ff2d55' }}>LIVE</span>
              </div>

              {/* Confidence */}
              {feed.detections.length > 0 && (
                <div style={{
                  position:'absolute', bottom:'4px', left:'4px',
                  background:'rgba(0,0,0,0.8)', border:'1px solid rgba(255,204,0,0.3)',
                  padding:'1px 4px',
                }}>
                  <span className="font-mono-tactical" style={{ fontSize:'7px', color:'#ffcc00' }}>
                    CONF: {feed.detections[0].confidence}%
                  </span>
                </div>
              )}
            </div>

            {/* Metadata */}
            <div style={{ padding:'5px 8px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2px' }}>
                <span className="font-orbitron" style={{ fontSize:'8px', color:'#c8e6f0', letterSpacing:'1px' }}>{feed.label}</span>
                <span style={{
                  fontSize:'7px', fontFamily:'Share Tech Mono,monospace',
                  color: threatColor(feed.threatLevel),
                  background:`${threatColor(feed.threatLevel)}18`,
                  padding:'1px 4px', border:`1px solid ${threatColor(feed.threatLevel)}44`,
                }}>{feed.threatLevel}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span className="font-mono-tactical" style={{ fontSize:'7px', color:'rgba(200,230,240,0.3)' }}>{feed.id}</span>
                <span className="font-mono-tactical" style={{ fontSize:'7px', color:'rgba(200,230,240,0.3)' }}>{feed.timestamp}</span>
              </div>
              <div className="font-mono-tactical" style={{ fontSize:'7px', color:'rgba(200,230,240,0.4)', marginTop:'2px' }}>
                {feed.detections.length > 0
                  ? `▶ ${feed.detections.length} DETECTION${feed.detections.length > 1 ? 'S' : ''}`
                  : '▷ CLEAR'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        padding:'6px 12px', borderTop:'1px solid rgba(0,212,255,0.15)',
        flexShrink: 0, display:'flex', justifyContent:'space-between',
      }}>
        <div className="font-mono-tactical" style={{ fontSize:'7px', color:'rgba(200,230,240,0.4)' }}>
          <div>FEEDS: 4/4</div>
          <div>BW: 847 MB/S</div>
        </div>
        <div className="font-mono-tactical" style={{ fontSize:'7px', textAlign:'right' }}>
          <div style={{ color:'rgba(255,45,85,0.7)' }}>DETECT: 4</div>
          <div style={{ color:'#ffcc00' }}>FLAG: 2</div>
        </div>
      </div>
    </div>
  );
};

export default FeedPanel;
