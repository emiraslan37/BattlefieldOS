﻿// Waypoints define patrol loops per drone [lat, lng][]
export type LatLng = [number, number];

export type DroneStatus = 'ACTIVE' | 'STANDBY' | 'IN MISSION' | 'RTB' | 'LOST SIGNAL';
export type ThreatLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Drone {
  id: string;
  status: DroneStatus;
  battery: number;
  signal: number;
  speed: number;       // knots
  altitude: number;    // feet
  heading: number;     // degrees
  mission: string;
  flightTime: number;  // seconds elapsed
  lat: number;
  lng: number;
  waypoints: LatLng[];
  waypointIndex: number;
  payload: string;
  type: string;
  fuel: number;        // 0-100
}

export interface IsrFeed {
  id: string;
  label: string;
  imageUrl: string;
  detections: { label: string; confidence: number; x: number; y: number; w: number; h: number }[];
  timestamp: string;
  status: 'LIVE' | 'OFFLINE';
  threatLevel: ThreatLevel;
}

export interface AiAction {
  id: number;
  action: string;
  successRate: number;
  risk: RiskLevel;
  recommended: boolean;
  eta: string;
  confidence: number;
}

export interface ThreatEvent {
  id: string;
  time: string;
  msg: string;
  level: ThreatLevel;
  grid: string;
}

export interface CommEntry {
  id: string;
  time: string;
  from: string;
  to: string;
  msg: string;
  encrypted: boolean;
}

export interface Target {
  id: string;
  lat: number;
  lng: number;
  threat: ThreatLevel;
  type: string;
  confidence: number;
  speed: number;       // km/h ground speed
  heading: number;
  firstSeen: string;
}

// ─────────────────────────────────────────────────────────
// DRONES — patrol loops in real coordinates (Jordan/Syria border area)
// ─────────────────────────────────────────────────────────
export const INITIAL_DRONES: Drone[] = [
  {
    id: 'ALPHA-01',
    type: 'MQ-9 REAPER',
    payload: 'SAR + EO/IR',
    status: 'ACTIVE',
    battery: 87,
    fuel: 82,
    signal: 94,
    speed: 142,
    altitude: 18500,
    heading: 47,
    mission: 'BORDER SCAN',
    flightTime: 8073,
    lat: 32.51,
    lng: 37.82,
    waypointIndex: 0,
    waypoints: [
      [32.51, 37.82],
      [32.56, 37.91],
      [32.61, 37.87],
      [32.58, 37.74],
      [32.50, 37.70],
      [32.44, 37.78],
    ],
  },
  {
    id: 'BRAVO-07',
    type: 'RQ-4 GLOBAL HAWK',
    payload: 'MP-RTIP RADAR',
    status: 'IN MISSION',
    battery: 62,
    fuel: 58,
    signal: 78,
    speed: 310,
    altitude: 55000,
    heading: 120,
    mission: 'HIGH ALT ISR',
    flightTime: 14832,
    lat: 32.63,
    lng: 38.05,
    waypointIndex: 0,
    waypoints: [
      [32.63, 38.05],
      [32.72, 38.22],
      [32.68, 38.40],
      [32.55, 38.35],
      [32.50, 38.18],
      [32.58, 38.00],
    ],
  },
  {
    id: 'DELTA-03',
    type: 'RQ-7 SHADOW',
    payload: 'EO/IR IMINT',
    status: 'STANDBY',
    battery: 100,
    fuel: 100,
    signal: 100,
    speed: 0,
    altitude: 0,
    heading: 0,
    mission: 'ON DECK',
    flightTime: 0,
    lat: 32.42,
    lng: 37.68,
    waypointIndex: 0,
    waypoints: [
      [32.42, 37.68],
    ],
  },
  {
    id: 'ECHO-11',
    type: 'MQ-1C GRAY EAGLE',
    payload: 'LYNX SAR + HELLFIRE',
    status: 'ACTIVE',
    battery: 45,
    fuel: 41,
    signal: 61,
    speed: 87,
    altitude: 10200,
    heading: 290,
    mission: 'TARGET TRACK',
    flightTime: 19268,
    lat: 32.48,
    lng: 37.95,
    waypointIndex: 0,
    waypoints: [
      [32.48, 37.95],
      [32.52, 38.01],
      [32.55, 37.98],
      [32.53, 37.90],
      [32.47, 37.88],
    ],
  },
];

// ─────────────────────────────────────────────────────────
// TARGETS
// ─────────────────────────────────────────────────────────
export const INITIAL_TARGETS: Target[] = [
  {
    id: 'TGT-4421',
    lat: 32.575,
    lng: 37.96,
    threat: 'CRITICAL',
    type: 'ARMED VEHICLE',
    confidence: 94,
    speed: 42,
    heading: 220,
    firstSeen: '05:58:14Z',
  },
  {
    id: 'TGT-4422',
    lat: 32.535,
    lng: 38.10,
    threat: 'HIGH',
    type: 'PERSONNEL GROUP',
    confidence: 81,
    speed: 8,
    heading: 310,
    firstSeen: '06:02:33Z',
  },
  {
    id: 'TGT-4423',
    lat: 32.62,
    lng: 37.80,
    threat: 'MEDIUM',
    type: 'UNKNOWN VEHICLE',
    confidence: 67,
    speed: 0,
    heading: 0,
    firstSeen: '06:11:07Z',
  },
];

// ─────────────────────────────────────────────────────────
// ISR FEEDS
// ─────────────────────────────────────────────────────────
export const ISR_FEEDS: IsrFeed[] = [
  {
    id: 'CAM-A',
    label: 'SECTOR ALPHA',
    imageUrl: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=300&q=60',
    detections: [
      { label: 'VEHICLE', confidence: 94, x: 20, y: 30, w: 35, h: 25 },
      { label: 'PERSONNEL', confidence: 87, x: 65, y: 55, w: 20, h: 30 },
    ],
    timestamp: '06:14:22Z',
    status: 'LIVE',
    threatLevel: 'HIGH',
  },
  {
    id: 'CAM-B',
    label: 'SECTOR BRAVO',
    imageUrl: 'https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?w=300&q=60',
    detections: [
      { label: 'TARGET DETECTED', confidence: 92, x: 40, y: 20, w: 30, h: 40 },
    ],
    timestamp: '06:14:19Z',
    status: 'LIVE',
    threatLevel: 'CRITICAL',
  },
  {
    id: 'CAM-C',
    label: 'CHECKPOINT 7',
    imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=300&q=60',
    detections: [],
    timestamp: '06:14:21Z',
    status: 'LIVE',
    threatLevel: 'LOW',
  },
  {
    id: 'CAM-D',
    label: 'NORTH PERIMETER',
    imageUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=300&q=60',
    detections: [
      { label: 'UNKNOWN OBJECT', confidence: 71, x: 55, y: 40, w: 25, h: 20 },
    ],
    timestamp: '06:14:20Z',
    status: 'LIVE',
    threatLevel: 'MEDIUM',
  },
];

// ─────────────────────────────────────────────────────────
// AI ACTIONS
// ─────────────────────────────────────────────────────────
export const AI_ACTIONS: AiAction[] = [
  {
    id: 1,
    action: 'REDIRECT ALPHA-01 TO GRID 7-ALPHA',
    successRate: 97,
    risk: 'LOW',
    recommended: true,
    eta: '00:04:12',
    confidence: 98,
  },
  {
    id: 2,
    action: 'ENGAGE ELECTRONIC COUNTERMEASURE',
    successRate: 89,
    risk: 'MEDIUM',
    recommended: false,
    eta: '00:01:30',
    confidence: 84,
  },
  {
    id: 3,
    action: 'ESTABLISH COMM RELAY NODE',
    successRate: 99,
    risk: 'LOW',
    recommended: false,
    eta: '00:06:45',
    confidence: 99,
  },
  {
    id: 4,
    action: 'SCRAMBLE ECHO-11 INTERCEPT',
    successRate: 74,
    risk: 'HIGH',
    recommended: false,
    eta: '00:02:05',
    confidence: 71,
  },
];

// ─────────────────────────────────────────────────────────
// INITIAL THREAT EVENTS
// ─────────────────────────────────────────────────────────
export const INITIAL_EVENTS: ThreatEvent[] = [
  { id: 'EVT-001', time: '06:12:04Z', msg: 'Unidentified vehicle detected — Sector Alpha', level: 'HIGH', grid: '4-A' },
  { id: 'EVT-002', time: '06:11:33Z', msg: 'Signal anomaly detected — Grid 4-Charlie', level: 'MEDIUM', grid: '4-C' },
  { id: 'EVT-003', time: '06:10:58Z', msg: 'Perimeter breach alert — Zone 7 North', level: 'CRITICAL', grid: '7-N' },
  { id: 'EVT-004', time: '06:09:41Z', msg: 'ECHO-11 battery low (45%) — RTB advisory', level: 'LOW', grid: 'BASE' },
  { id: 'EVT-005', time: '06:08:22Z', msg: 'New target acquired — Tracking ID TGT-4421', level: 'HIGH', grid: '6-B' },
];

// ─────────────────────────────────────────────────────────
// COMM LOG
// ─────────────────────────────────────────────────────────
export const INITIAL_COMMS: CommEntry[] = [
  { id: 'C1', time: '06:14:01Z', from: 'TOC', to: 'ALPHA-01', msg: 'Maintain current orbit. Report any movement in sector.', encrypted: true },
  { id: 'C2', time: '06:13:44Z', from: 'ALPHA-01', to: 'TOC', msg: 'WILCO. Confirming vehicle at grid 4-Alpha. Request targeting auth.', encrypted: true },
  { id: 'C3', time: '06:13:20Z', from: 'TOC', to: 'ALL', msg: 'SIGINT confirms 3-element hostile element moving NW.', encrypted: true },
  { id: 'C4', time: '06:12:55Z', from: 'ECHO-11', to: 'TOC', msg: 'Fuel state amber. Can hold for 40 minutes.', encrypted: false },
  { id: 'C5', time: '06:12:10Z', from: 'TOC', to: 'BRAVO-07', msg: 'Shift orbit north. Priority ISR grid 7-November.', encrypted: true },
  { id: 'C6', time: '06:11:50Z', from: 'BRAVO-07', to: 'TOC', msg: 'Wilco. Initiating orbit shift. On station in 4 minutes.', encrypted: true },
];

// ─────────────────────────────────────────────────────────
// RANDOM EVENT POOL (used by simulation engine)
// ─────────────────────────────────────────────────────────
export const RANDOM_EVENTS: Omit<ThreatEvent, 'id' | 'time'>[] = [
  { msg: 'New radar contact — bearing 047, range 12km', level: 'MEDIUM', grid: '3-B' },
  { msg: 'EW jamming detected on UHF band', level: 'HIGH', grid: '5-A' },
  { msg: 'Unknown aircraft entering restricted airspace', level: 'CRITICAL', grid: '2-D' },
  { msg: 'Ground movement detected — convoy size 4 vehicles', level: 'HIGH', grid: '6-C' },
  { msg: 'IED activity suspected — route Alpha 7', level: 'CRITICAL', grid: '7-A' },
  { msg: 'Signal intercept: encrypted comms in Sector Bravo', level: 'MEDIUM', grid: '4-B' },
  { msg: 'Border crossing event logged — 2 PAX northbound', level: 'LOW', grid: '1-A' },
  { msg: 'ECHO-11 signal degradation — possible interference', level: 'MEDIUM', grid: 'ECHO' },
  { msg: 'Weather window opening — cloud ceiling rising', level: 'LOW', grid: 'ALL' },
  { msg: 'Target TGT-4421 accelerating — speed now 68 km/h', level: 'HIGH', grid: '5-B' },
];

export const RANDOM_COMMS: Omit<CommEntry, 'id' | 'time'>[] = [
  { from: 'TOC', to: 'ALPHA-01', msg: 'Adjust bearing 20 degrees left. Reacquire target.', encrypted: true },
  { from: 'ALPHA-01', to: 'TOC', msg: 'Target reacquired. Weapons tight. Awaiting ROE auth.', encrypted: true },
  { from: 'ECHO-11', to: 'TOC', msg: 'Fuel critical. Initiating RTB sequence.', encrypted: false },
  { from: 'TOC', to: 'ALL', msg: 'FLASH: Hostile fire reported grid 4-Delta. Avoid.',  encrypted: true },
  { from: 'BRAVO-07', to: 'TOC', msg: 'SAR contact confirmed. Transmitting coordinates.', encrypted: true },
  { from: 'TOC', to: 'DELTA-03', msg: 'DELTA-03 scramble authorized. Launch immediately.', encrypted: true },
  { from: 'DELTA-03', to: 'TOC', msg: 'Launching now. On station in 8 mikes.', encrypted: true },
];
