import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Drone, Target } from '../data/mockData';
import type { SimActions } from '../hooks/useSimulation';

interface MapPanelProps {
  drones: Drone[];
  targets: Target[];
  selectedDroneId: string | null;
  onSelectDrone: (id: string | null) => void;
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

const threatColor = (t: string) => {
  switch (t) {
    case 'CRITICAL': return '#ff2d55';
    case 'HIGH':     return '#ff6432';
    case 'MEDIUM':   return '#ffcc00';
    default:         return '#00ff88';
  }
};

// Create SVG drone icon
function droneIcon(color: string, selected: boolean) {
  const size = selected ? 36 : 28;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 36 36">
      ${selected ? `<circle cx="18" cy="18" r="17" fill="${color}18" stroke="${color}" stroke-width="1" stroke-dasharray="3,2"/>` : ''}
      <line x1="6" y1="18" x2="12" y2="12" stroke="${color}" stroke-width="1.8"/>
      <line x1="30" y1="18" x2="24" y2="12" stroke="${color}" stroke-width="1.8"/>
      <line x1="6" y1="18" x2="12" y2="24" stroke="${color}" stroke-width="1.8"/>
      <line x1="30" y1="18" x2="24" y2="24" stroke="${color}" stroke-width="1.8"/>
      <ellipse cx="18" cy="18" rx="5" ry="3" fill="${color}44" stroke="${color}" stroke-width="1.2"/>
      <circle cx="6" cy="18" r="3.5" fill="none" stroke="${color}88" stroke-width="1"/>
      <circle cx="30" cy="18" r="3.5" fill="none" stroke="${color}88" stroke-width="1"/>
      <circle cx="18" cy="18" r="1.5" fill="${color}"/>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Create target icon
function targetIcon(color: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="14" fill="none" stroke="${color}66" stroke-width="1" stroke-dasharray="2,2"/>
      <circle cx="16" cy="16" r="8" fill="none" stroke="${color}" stroke-width="1.2"/>
      <circle cx="16" cy="16" r="3" fill="${color}"/>
      <line x1="2" y1="16" x2="8" y2="16" stroke="${color}" stroke-width="1"/>
      <line x1="24" y1="16" x2="30" y2="16" stroke="${color}" stroke-width="1"/>
      <line x1="16" y1="2" x2="16" y2="8" stroke="${color}" stroke-width="1"/>
      <line x1="16" y1="24" x2="16" y2="30" stroke="${color}" stroke-width="1"/>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: 'animate-pulse-red',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

const MapPanel: React.FC<MapPanelProps> = ({ drones, targets, selectedDroneId, onSelectDrone, actions }) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const droneMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const targetMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const dronePathsRef = useRef<Map<string, L.Polyline>>(new Map());
  const waypointLinesRef = useRef<Map<string, L.Polyline>>(new Map());

  // ── Init map once ──────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [32.55, 37.95],
      zoom: 10,
      zoomControl: false,
      attributionControl: false,
    });

    // Dark satellite tiles (Esri World Imagery)
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 18, attribution: '' }
    ).addTo(map);

    // Overlay: dark tint to make it feel tactical
    L.tileLayer(
      'https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.png',
      { maxZoom: 18, opacity: 0.08, subdomains: 'abcd' }
    ).addTo(map);

    // Click on map to add waypoint for selected drone
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (selectedDroneId) {
        actions.addWaypoint(selectedDroneId, [e.latlng.lat, e.latlng.lng]);
      }
    });

    mapRef.current = map;

    // Military-style attribution override
    const attr = document.createElement('div');
    attr.style.cssText = `
      position:absolute; bottom:4px; right:4px; z-index:1000;
      font-family:Share Tech Mono,monospace; font-size:7px;
      color:rgba(0,212,255,0.3); pointer-events:none;
    `;
    attr.textContent = 'ESRI WORLD IMAGERY · CLASSIFIED · OP SANDSTORM';
    mapContainerRef.current.appendChild(attr);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Update selected drone reference (for click handler) ─
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.off('click');
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (selectedDroneId) {
        actions.addWaypoint(selectedDroneId, [e.latlng.lat, e.latlng.lng]);
      }
    });
  }, [selectedDroneId, actions]);

  // ── Update drone markers + paths ───────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    drones.forEach(drone => {
      const color = statusColor(drone.status);
      const isSelected = drone.id === selectedDroneId;
      const icon = droneIcon(color, isSelected);

      if (droneMarkersRef.current.has(drone.id)) {
        const marker = droneMarkersRef.current.get(drone.id)!;
        marker.setLatLng([drone.lat, drone.lng]);
        marker.setIcon(icon);
      } else {
        const marker = L.marker([drone.lat, drone.lng], { icon, zIndexOffset: 200 })
          .addTo(map)
          .on('click', () => onSelectDrone(drone.id === selectedDroneId ? null : drone.id));

        // Custom tooltip
        marker.bindTooltip(`
          <div style="font-family:Share Tech Mono,monospace;font-size:9px;color:#c8e6f0;background:rgba(3,8,14,0.95);border:1px solid ${color}55;padding:6px 8px;border-left:2px solid ${color};min-width:140px;">
            <div style="color:${color};font-size:10px;margin-bottom:4px;">${drone.id}</div>
            <div>${drone.type}</div>
            <div style="color:rgba(200,230,240,0.5)">ALT ${drone.altitude.toFixed(0)} FT · ${drone.speed.toFixed(0)} KT</div>
            <div style="color:rgba(200,230,240,0.5)">BAT ${drone.battery.toFixed(0)}% · SIG ${drone.signal.toFixed(0)}%</div>
            <div style="color:${color};margin-top:2px;">${drone.status}</div>
          </div>
        `, {
          permanent: false,
          direction: 'top',
          offset: [0, -14],
          className: 'tactical-tooltip',
          opacity: 1,
        });

        droneMarkersRef.current.set(drone.id, marker);
      }

      // Waypoint route line
      if (drone.status !== 'STANDBY') {
        const points: L.LatLngTuple[] = [[drone.lat, drone.lng], ...drone.waypoints.map(wp => wp as L.LatLngTuple)];
        if (waypointLinesRef.current.has(drone.id)) {
          waypointLinesRef.current.get(drone.id)!.setLatLngs(points);
        } else {
          const line = L.polyline(points, {
            color: isSelected ? color : `${color}44`,
            weight: isSelected ? 1.5 : 0.8,
            dashArray: '6, 4',
            opacity: 0.7,
          }).addTo(map);
          waypointLinesRef.current.set(drone.id, line);
        }
        // Update color based on selection
        const line = waypointLinesRef.current.get(drone.id)!;
        line.setStyle({
          color: isSelected ? color : `${color}55`,
          weight: isSelected ? 2 : 0.8,
        });
      }

      // Historical trail
      if (!dronePathsRef.current.has(drone.id)) {
        const trail = L.polyline([[drone.lat, drone.lng]], {
          color: color,
          weight: 1,
          opacity: 0.3,
        }).addTo(map);
        dronePathsRef.current.set(drone.id, trail);
      } else {
        const trail = dronePathsRef.current.get(drone.id)!;
        const lls = trail.getLatLngs() as L.LatLng[];
        if (lls.length > 80) lls.shift();
        lls.push(L.latLng(drone.lat, drone.lng));
        trail.setLatLngs(lls);
      }
    });
  }, [drones, selectedDroneId, onSelectDrone]);

  // ── Update target markers ──────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    targets.forEach(target => {
      const color = threatColor(target.threat);
      const icon = targetIcon(color);

      if (targetMarkersRef.current.has(target.id)) {
        targetMarkersRef.current.get(target.id)!.setLatLng([target.lat, target.lng]);
      } else {
        const marker = L.marker([target.lat, target.lng], { icon, zIndexOffset: 100 })
          .addTo(map)
          .bindTooltip(`
            <div style="font-family:Share Tech Mono,monospace;font-size:9px;color:#c8e6f0;background:rgba(20,3,8,0.95);border:1px solid ${color}55;padding:6px 8px;border-left:2px solid ${color};min-width:140px;">
              <div style="color:${color};font-size:10px;margin-bottom:4px;">⚠ ${target.id}</div>
              <div>${target.type}</div>
              <div style="color:rgba(200,230,240,0.5)">CONF ${target.confidence}% · HDG ${target.heading}°</div>
              <div style="color:rgba(200,230,240,0.5)">SPD ${target.speed} KM/H</div>
              <div style="color:${color};margin-top:2px;">${target.threat} THREAT</div>
            </div>
          `, {
            permanent: false,
            direction: 'top',
            offset: [0, -14],
            className: 'tactical-tooltip',
            opacity: 1,
          });
        targetMarkersRef.current.set(target.id, marker);
      }
    });
  }, [targets]);

  return (
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minWidth: 0 }}>
      {/* Leaflet map */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Tactical overlays */}
      {/* Top-left corner info */}
      <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 500, pointerEvents: 'none' }}>
        <div style={{
          background: 'rgba(3,8,14,0.85)',
          border: '1px solid rgba(0,212,255,0.25)',
          backdropFilter: 'blur(8px)',
          padding: '6px 10px',
        }}>
          <div className="font-mono-tactical" style={{ fontSize: '8px', color: 'rgba(0,212,255,0.5)', lineHeight: 1.8 }}>
            <div>MGRS: 37SCB 45200 34800</div>
            <div>DATUM: WGS84 · UTM ZONE 37S</div>
            <div style={{ color: 'rgba(0,212,255,0.35)' }}>OP AREA: 180 KM²</div>
          </div>
        </div>
      </div>

      {/* Top-center label */}
      <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', zIndex: 500, pointerEvents: 'none' }}>
        <div style={{
          background: 'rgba(3,8,14,0.7)',
          border: '1px solid rgba(0,212,255,0.2)',
          padding: '4px 16px',
          backdropFilter: 'blur(8px)',
        }}>
          <span className="font-mono-tactical" style={{ fontSize: '8px', color: 'rgba(0,212,255,0.5)', letterSpacing: '3px' }}>
            TACTICAL OPERATIONS MAP · REAL-TIME
          </span>
        </div>
      </div>

      {/* Mode tabs */}
      <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 500, display: 'flex', gap: '4px' }}>
        {['SAR', 'IR', 'OPT', 'EO'].map((mode, i) => (
          <div key={mode} style={{
            padding: '3px 8px',
            border: `1px solid ${i === 2 ? 'rgba(0,212,255,0.6)' : 'rgba(0,212,255,0.2)'}`,
            background: i === 2 ? 'rgba(0,212,255,0.12)' : 'rgba(3,8,14,0.7)',
            backdropFilter: 'blur(8px)',
            fontSize: '8px',
            fontFamily: 'Share Tech Mono, monospace',
            color: i === 2 ? '#00d4ff' : 'rgba(0,212,255,0.4)',
            cursor: 'pointer',
          }}>{mode}</div>
        ))}
      </div>

      {/* Selected drone hint */}
      {selectedDroneId && (
        <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: 500 }}>
          <div style={{
            background: 'rgba(3,8,14,0.9)',
            border: '1px solid rgba(0,212,255,0.4)',
            padding: '4px 14px',
            backdropFilter: 'blur(8px)',
          }}>
            <span className="font-mono-tactical" style={{ fontSize: '8px', color: '#00d4ff', letterSpacing: '2px' }}>
              ✦ CLICK MAP TO ADD WAYPOINT FOR {selectedDroneId}
            </span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{ position: 'absolute', bottom: '16px', left: '10px', zIndex: 500 }}>
        <div style={{
          background: 'rgba(3,8,14,0.85)',
          border: '1px solid rgba(0,212,255,0.15)',
          backdropFilter: 'blur(8px)',
          padding: '6px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '3px',
        }}>
          {[
            { color: '#00ff88', label: 'ACTIVE' },
            { color: '#00d4ff', label: 'IN MISSION' },
            { color: '#ffcc00', label: 'STANDBY' },
            { color: '#ff6432', label: 'RTB' },
            { color: '#ff2d55', label: 'THREAT' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.color, boxShadow: `0 0 4px ${item.color}` }} />
              <span className="font-mono-tactical" style={{ fontSize: '7px', color: 'rgba(200,230,240,0.5)' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Leaflet tooltip styles */}
      <style>{`
        .leaflet-tooltip { background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
        .leaflet-tooltip-top:before { display: none !important; }
        .tactical-tooltip { background: transparent !important; }
        .leaflet-container { background: #050a0f !important; cursor: ${selectedDroneId ? 'crosshair' : 'grab'} !important; }
        .leaflet-tile { filter: brightness(0.7) saturate(0.5) hue-rotate(180deg) contrast(1.1); }
      `}</style>
    </div>
  );
};

export default MapPanel;
