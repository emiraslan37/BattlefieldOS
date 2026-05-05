import React from 'react';
import TopBar from './components/TopBar';
import MapPanel from './components/MapPanel';
import FeedPanel from './components/FeedPanel';
import AIPanel from './components/AIPanel';
import BottomPanel from './components/BottomPanel';
import CommLog from './components/CommLog';
import AlertSystem from './components/AlertSystem';
import CommandConsole from './components/CommandConsole';
import { useSimulation } from './hooks/useSimulation';
import './index.css';

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

const App: React.FC = () => {
  const [state, actions] = useSimulation();
  const { drones, targets, events, comms, elapsedSeconds, selectedDroneId, alertQueue } = state;

  const missionTime = formatTime(elapsedSeconds);
  const selectedDrone = drones.find(d => d.id === selectedDroneId);

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: '#050a0f',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', position: 'relative',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `
          radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,212,255,0.04) 0%, transparent 60%),
          radial-gradient(ellipse 40% 40% at 90% 80%, rgba(255,45,85,0.03) 0%, transparent 50%),
          radial-gradient(ellipse 40% 40% at 10% 20%, rgba(0,212,255,0.025) 0%, transparent 50%)
        `,
      }} />

      {/* Top Bar */}
      <TopBar drones={drones} missionTime={missionTime} alertCount={alertQueue.length} />

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0, position: 'relative', zIndex: 1 }}>
        {/* ISR Feeds */}
        <FeedPanel />

        {/* Map */}
        <MapPanel
          drones={drones}
          targets={targets}
          selectedDroneId={selectedDroneId}
          onSelectDrone={actions.selectDrone}
          actions={actions}
        />

        {/* AI Panel */}
        <AIPanel drones={drones} targets={targets} events={events} />

        {/* Comm Log */}
        <CommLog comms={comms} events={events} />
      </div>

      {/* Bottom Panel */}
      <BottomPanel
        drones={drones}
        missionTime={missionTime}
        selectedDroneId={selectedDroneId}
        actions={actions}
      />

      {/* Alert overlay */}
      <AlertSystem alert={alertQueue[0]} onDismiss={actions.dismissAlert} />

      {/* Command Console (shown when drone selected) */}
      {selectedDrone && (
        <CommandConsole
          drone={selectedDrone}
          onClose={() => actions.selectDrone(null)}
          actions={actions}
        />
      )}
    </div>
  );
};

export default App;
