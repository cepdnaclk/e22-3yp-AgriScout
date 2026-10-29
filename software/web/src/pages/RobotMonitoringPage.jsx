import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import { Bot, BatteryCharging, AlertCircle, Plus, Copy, Check, RefreshCw, X, ShieldAlert } from 'lucide-react';

const RobotMonitoringPage = () => {
  const [robots, setRobots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRobotForm, setNewRobotForm] = useState({ robotId: '', name: '', greenhouseId: '' });
  const [generatedKey, setGeneratedKey] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const { lastRobotStatus } = useSocket();
  const { isAdmin } = useAuth();

  const fetchRobots = async () => {
    try {
      setLoading(true);
      const res = await api.get('/robots');
      setRobots(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load robots', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRobots();
  }, []);

  // Live telemetry updates
  useEffect(() => {
    if (lastRobotStatus) {
      setRobots((prev) =>
        prev.map((r) =>
          r.robotId === lastRobotStatus.robotId ? { ...r, ...lastRobotStatus } : r
        )
      );
    }
  }, [lastRobotStatus]);

  const handleRegisterRobot = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/robots/register', newRobotForm);
      if (res.data?.success) {
        setGeneratedKey(res.data.apiKey);
        fetchRobots();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register robot');
    }
  };

  const handleCopyKey = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Autonomous Robot Fleet</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Real-time Raspberry Pi 5 telemetry, battery status, current waypoint, and hardware diagnostic errors
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchRobots} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} /> Refresh
          </button>
          {isAdmin && (
            <button onClick={() => { setIsModalOpen(true); setGeneratedKey(null); }} className="btn btn-primary btn-sm">
              <Plus size={14} /> Register New Robot
            </button>
          )}
        </div>
      </div>

      {/* Fleet Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {robots.map((robot) => {
          const isOnline = robot.connectionStatus === 'online' || robot.connectionStatus === 'inspecting';
          const battery = robot.batteryLevel ?? 0;
          const batteryColor = battery > 50 ? '#34d399' : battery > 20 ? '#fbbf24' : '#f87171';

          return (
            <div key={robot.robotId} className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: isOnline ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isOnline ? 'var(--emerald-400)' : 'var(--text-dim)'
                    }}
                  >
                    <Bot size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem' }}>{robot.name}</h3>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--emerald-400)' }}>
                      ID: {robot.robotId}
                    </span>
                  </div>
                </div>

                <StatusBadge status={robot.connectionStatus} type="robot" />
              </div>

              {/* Battery & Waypoint Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>
                    Battery Level
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <BatteryCharging size={18} color={batteryColor} />
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: batteryColor }}>
                      {robot.batteryLevel !== null ? `${robot.batteryLevel}%` : 'N/A'}
                    </span>
                  </div>
                </div>

                <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>
                    Current Plant Waypoint
                  </span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                    {robot.currentPlantId || 'Idle / Docked'}
                  </span>
                </div>
              </div>

              {/* Error Status Indicator if any */}
              {robot.errorStatus?.hasError && (
                <div
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <AlertCircle size={16} />
                  <span>Error: {robot.errorStatus.errorMessage}</span>
                </div>
              )}

              {/* Telemetry Footer */}
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                <div>Assigned Zone: <strong style={{ color: '#fff' }}>{robot.greenhouseId}</strong></div>
                <div>Last Heartbeat: <strong style={{ color: '#fff' }}>{robot.lastSeenAt ? new Date(robot.lastSeenAt).toLocaleTimeString() : 'Never'}</strong></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Register Robot Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="glass-panel"
            style={{ width: '100%', maxWidth: '500px', padding: '2rem', backgroundColor: '#0f1713' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.3rem' }}>Register Raspberry Pi Robot</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {error && (
              <div style={{ padding: '0.65rem', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', fontSize: '0.825rem', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            {!generatedKey ? (
              <form onSubmit={handleRegisterRobot}>
                <div className="form-group">
                  <label className="form-label">Robot ID (e.g. ROBOT-BETA-02)</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="ROBOT-BETA-02"
                    value={newRobotForm.robotId}
                    onChange={(e) => setNewRobotForm({ ...newRobotForm, robotId: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Friendly Robot Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Scout Rover Beta (Pi 5)"
                    value={newRobotForm.name}
                    onChange={(e) => setNewRobotForm({ ...newRobotForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Assigned Greenhouse ID</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="GH-NORTH-01"
                    value={newRobotForm.greenhouseId}
                    onChange={(e) => setNewRobotForm({ ...newRobotForm, greenhouseId: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Generate API Credentials
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                    Robot Registered! Configure this key on the Raspberry Pi:
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <code style={{ background: '#000', padding: '0.5rem', borderRadius: '4px', flex: 1, fontSize: '0.8rem', color: '#fff', wordBreak: 'break-all' }}>
                      {generatedKey}
                    </code>
                    <button onClick={handleCopyKey} className="btn btn-secondary btn-sm">
                      {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-dim)', display: 'block', marginTop: '0.5rem' }}>
                    Store in <code>robot/.env</code> as <code>ROBOT_API_KEY</code>.
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => setIsModalOpen(false)} className="btn btn-primary">
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RobotMonitoringPage;
