import { useEffect, useRef, useState, useCallback } from 'react';
import type {
  Drone, Target, ThreatEvent, CommEntry, LatLng,
} from '../data/mockData';
import {
  INITIAL_DRONES, INITIAL_TARGETS, INITIAL_EVENTS, INITIAL_COMMS,
  RANDOM_EVENTS, RANDOM_COMMS,
} from '../data/mockData';

// Lerp between two lat/lng positions
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// Calculate bearing from pointA to pointB
function bearingTo(a: LatLng, b: LatLng): number {
  const dLng = b[1] - a[1];
  const y = Math.sin((dLng * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180);
  const x =
    Math.cos((a[0] * Math.PI) / 180) * Math.sin((b[1] * Math.PI) / 180) -
    Math.sin((a[0] * Math.PI) / 180) *
      Math.cos((b[1] * Math.PI) / 180) *
      Math.cos((dLng * Math.PI) / 180);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

// Distance in degrees between two positions
function dist(a: LatLng, b: LatLng) {
  return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
}

function jitter(val: number, range: number, min: number, max: number) {
  return Math.min(max, Math.max(min, val + (Math.random() - 0.5) * range));
}

function nowZ() {
  const d = new Date();
  return `${d.getUTCHours().toString().padStart(2,'0')}:${d.getUTCMinutes().toString().padStart(2,'0')}:${d.getUTCSeconds().toString().padStart(2,'0')}Z`;
}

let evtCounter = 10;
let commCounter = 10;

export interface SimState {
  drones: Drone[];
  targets: Target[];
  events: ThreatEvent[];
  comms: CommEntry[];
  elapsedSeconds: number;
  selectedDroneId: string | null;
  alertQueue: ThreatEvent[];
}

export interface SimActions {
  selectDrone: (id: string | null) => void;
  commandDrone: (id: string, cmd: 'RTB' | 'ORBIT' | 'STANDBY' | 'RESUME') => void;
  dismissAlert: () => void;
  addWaypoint: (id: string, latlng: LatLng) => void;
}

const TICK_MS = 1000; // 1 second tick
const DRONE_STEP = 0.0015; // degrees per second movement (slow crawl)

export function useSimulation(): [SimState, SimActions] {
  const [elapsedSeconds, setElapsedSeconds] = useState(16382);
  const [drones, setDrones] = useState<Drone[]>(INITIAL_DRONES.map(d => ({ ...d })));
  const [targets, setTargets] = useState<Target[]>(INITIAL_TARGETS.map(t => ({ ...t })));
  const [events, setEvents] = useState<ThreatEvent[]>([...INITIAL_EVENTS]);
  const [comms, setComms] = useState<CommEntry[]>([...INITIAL_COMMS]);
  const [selectedDroneId, setSelectedDroneId] = useState<string | null>(null);
  const [alertQueue, setAlertQueue] = useState<ThreatEvent[]>([]);

  const tickRef = useRef(0);

  // ── Main simulation tick ────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      tickRef.current += 1;
      const tick = tickRef.current;

      setElapsedSeconds(s => s + 1);

      // ── Move drones along waypoints ──
      setDrones(prev => prev.map(drone => {
        if (drone.status === 'STANDBY') return drone;

        const wps = drone.waypoints;
        if (wps.length < 2) return drone;

        const target = wps[drone.waypointIndex % wps.length];
        const current: LatLng = [drone.lat, drone.lng];
        const d = dist(current, target);

        // Speed factor: faster drones take bigger steps
        const speedFactor = drone.speed > 200 ? 2.2 : drone.speed > 100 ? 1.4 : 0.8;
        const step = DRONE_STEP * speedFactor;

        let newLat: number;
        let newLng: number;
        let newWpIdx = drone.waypointIndex;

        if (d < step * 1.5) {
          // Reached waypoint — advance to next
          newWpIdx = (drone.waypointIndex + 1) % wps.length;
          newLat = wps[newWpIdx][0];
          newLng = wps[newWpIdx][1];
        } else {
          const t = step / d;
          newLat = lerp(current[0], target[0], t);
          newLng = lerp(current[1], target[1], t);
        }

        const heading = bearingTo([drone.lat, drone.lng], target);

        // Battery and fuel drain
        const batteryDrain = 0.003;
        const fuelDrain = 0.004;

        // Signal jitter
        const newSignal = jitter(drone.signal, 2, 10, 100);

        // Speed jitter (realistic turbulence)
        const newSpeed = jitter(drone.speed, 4, 40, 400);

        // Altitude jitter
        const newAlt = drone.altitude > 0
          ? jitter(drone.altitude, 80, 500, 60000)
          : 0;

        // Status changes
        let newStatus = drone.status;
        if (drone.battery < 10 && drone.status !== 'RTB') {
          newStatus = 'RTB';
        }
        if (drone.signal < 15) {
          newStatus = 'LOST SIGNAL';
        }

        return {
          ...drone,
          lat: newLat,
          lng: newLng,
          heading,
          waypointIndex: newWpIdx,
          battery: Math.max(0, drone.battery - batteryDrain),
          fuel: Math.max(0, drone.fuel - fuelDrain),
          signal: newSignal,
          speed: newSpeed,
          altitude: newAlt,
          flightTime: drone.flightTime + 1,
          status: newStatus,
        };
      }));

      // ── Move targets ──
      setTargets(prev => prev.map(target => {
        if (target.speed === 0) return target;
        const rad = (target.heading * Math.PI) / 180;
        const mps = (target.speed / 3600) * 0.00001; // rough degree-per-second
        return {
          ...target,
          lat: target.lat + Math.cos(rad) * mps,
          lng: target.lng + Math.sin(rad) * mps,
          heading: jitter(target.heading, 8, 0, 359),
        };
      }));

      // ── Random event injection (every ~25s) ──
      if (tick % 25 === 0) {
        const template = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
        const newEvent: ThreatEvent = {
          ...template,
          id: `EVT-${String(evtCounter++).padStart(3, '0')}`,
          time: nowZ(),
        };
        setEvents(prev => [newEvent, ...prev].slice(0, 20));
        if (template.level === 'HIGH' || template.level === 'CRITICAL') {
          setAlertQueue(prev => [...prev, newEvent]);
        }
      }

      // ── Random comm injection (every ~18s) ──
      if (tick % 18 === 0) {
        const template = RANDOM_COMMS[Math.floor(Math.random() * RANDOM_COMMS.length)];
        const newComm: CommEntry = {
          ...template,
          id: `C${commCounter++}`,
          time: nowZ(),
        };
        setComms(prev => [newComm, ...prev].slice(0, 30));
      }
    }, TICK_MS);

    return () => clearInterval(interval);
  }, []);

  // ── Actions ──────────────────────────────────────────────
  const selectDrone = useCallback((id: string | null) => {
    setSelectedDroneId(id);
  }, []);

  const commandDrone = useCallback((id: string, cmd: 'RTB' | 'ORBIT' | 'STANDBY' | 'RESUME') => {
    setDrones(prev => prev.map(d => {
      if (d.id !== id) return d;
      const statusMap: Record<string, Drone['status']> = {
        RTB: 'RTB',
        ORBIT: 'ACTIVE',
        STANDBY: 'STANDBY',
        RESUME: 'IN MISSION',
      };
      const msg = `Command [${cmd}] issued to ${id}`;
      // Also log a comm entry
      setComms(prevC => [{
        id: `C${commCounter++}`,
        time: nowZ(),
        from: 'TOC',
        to: id,
        msg,
        encrypted: true,
      }, ...prevC].slice(0, 30));

      return { ...d, status: statusMap[cmd] };
    }));
  }, []);

  const dismissAlert = useCallback(() => {
    setAlertQueue(prev => prev.slice(1));
  }, []);

  const addWaypoint = useCallback((id: string, latlng: LatLng) => {
    setDrones(prev => prev.map(d => {
      if (d.id !== id) return d;
      return { ...d, waypoints: [...d.waypoints, latlng] };
    }));
  }, []);

  return [
    { drones, targets, events, comms, elapsedSeconds, selectedDroneId, alertQueue },
    { selectDrone, commandDrone, dismissAlert, addWaypoint },
  ];
}
