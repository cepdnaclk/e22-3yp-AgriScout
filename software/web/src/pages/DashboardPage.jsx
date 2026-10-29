import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useSocket } from '../context/SocketContext';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import InspectionDetailModal from '../components/InspectionDetailModal';
import { Sprout, ClipboardList, AlertTriangle, Bot, ArrowUpRight, Radio, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalPlants: 0,
    totalInspections: 0,
    activeAlerts: 0,
    healthyCount: 0,
    warningCount: 0,
    criticalCount: 0
  });
  const [recentInspections, setRecentInspections] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [robots, setRobots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInspection, setSelectedInspection] = useState(null);

  const { recentEvents, lastInspection, lastAlert, lastRobotStatus } = useSocket();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [plantsRes, inspectionsRes, alertsRes, robotsRes] = await Promise.all([
        api.get('/plants?limit=100'),
        api.get('/inspections?limit=6'),
        api.get('/alerts?acknowledged=false&limit=5'),
        api.get('/robots')
      ]);

      const plants = plantsRes.data?.data || [];
      const inspections = inspectionsRes.data?.data || [];
      const alerts = alertsRes.data?.data || [];
      const rList = robotsRes.data?.data || [];

      setStats({
        totalPlants: plantsRes.data?.total || plants.length,
        totalInspections: inspectionsRes.data?.total || inspections.length,
        activeAlerts: alertsRes.data?.unacknowledgedCount || alerts.length,
        healthyCount: plants.filter(p => p.healthStatus === 'healthy').length,
        warningCount: plants.filter(p => p.healthStatus === 'warning').length,
        criticalCount: plants.filter(p => p.healthStatus === 'critical').length
      });

      setRecentInspections(inspections);
      setActiveAlerts(alerts);
      setRobots(rList);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Update live when Socket.IO events arrive
  useEffect(() => {
    if (lastInspection) {
      setRecentInspections((prev) => [lastInspection, ...prev.slice(0, 5)]);
      setStats((prev) => ({ ...prev, totalInspections: prev.totalInspections + 1 }));
    }
  }, [lastInspection]);

  useEffect(() => {
    if (lastAlert) {
      setActiveAlerts((prev) => [lastAlert, ...prev.slice(0, 4)]);
      setStats((prev) => ({ ...prev, activeAlerts: prev.activeAlerts + 1 }));
    }
  }, [lastAlert]);

  const primaryRobot = robots[0] || {
    robotId: 'ROBOT-ALPHA-01',
    connectionStatus: lastRobotStatus?.connectionStatus || 'online',
    batteryLevel: lastRobotStatus?.batteryLevel || 94
  };

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Greenhouse Command Center</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Real-time multi-spectral sensor monitoring, NPK nutrient gauges, and autonomous robot telemetry
          </p>
        </div>
        <button onClick={fetchDashboardData} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <MetricCard
          title="Monitored Plants"
          value={stats.totalPlants}
          subtext={`${stats.healthyCount} healthy, ${stats.criticalCount} critical`}
          icon={Sprout}
          color="emerald"
        />
        <MetricCard
          title="Total Inspections"
          value={stats.totalInspections}
          subtext="Captured via Raspberry Pi 5"
          icon={ClipboardList}
          color="cyan"
        />
        <MetricCard
          title="Active System Alerts"
          value={stats.activeAlerts}
          subtext={stats.activeAlerts === 0 ? 'All parameters optimal' : 'Requires agronomist attention'}
          icon={AlertTriangle}
          color={stats.activeAlerts > 0 ? 'rose' : 'emerald'}
        />
        <MetricCard
          title="Robot Status"
          value={primaryRobot.connectionStatus.toUpperCase()}
          subtext={`Rover: ${primaryRobot.robotId} (${primaryRobot.batteryLevel || 92}% batt)`}
          icon={Bot}
          color={primaryRobot.connectionStatus === 'online' ? 'emerald' : 'amber'}
        />
      </div>

      {/* Real-time Ticker & Active Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Active Alerts List */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} color="var(--amber-400)" />
              Urgent Greenhouse Alerts
            </h3>
            <Link to="/alerts" style={{ fontSize: '0.75rem', color: 'var(--emerald-400)', textDecoration: 'none' }}>
              View All ({stats.activeAlerts}) &rarr;
            </Link>
          </div>

          {activeAlerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
              No active alerts. All soil nutrient levels and leaf classifications are within optimal tolerances.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {activeAlerts.map((alert) => (
                <div
                  key={alert.alertId || alert._id}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    background: alert.severity === 'critical' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                    border: `1px solid ${alert.severity === 'critical' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <StatusBadge status={alert.severity} type="severity" />
                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{alert.plantId || alert.greenhouseId}</span>
                    </div>
                    <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', margin: 0 }}>
                      {alert.message}
                    </p>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                    {new Date(alert.createdAt || Date.now()).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real-time Socket.IO Telemetry Log */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Radio size={18} color="var(--cyan-400)" />
              Real-Time WebSocket Feed
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Auto-updating</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto' }}>
            {recentEvents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                Listening for robot heartbeats, leaf scans, and automated alert emissions...
              </div>
            ) : (
              recentEvents.map((ev) => (
                <div
                  key={ev.id}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    background: 'rgba(15, 23, 42, 0.5)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--emerald-400)', fontWeight: 600 }}>[{ev.type}]</span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {ev.payload?.inspectionId || ev.payload?.alertId || ev.payload?.robotId || 'Telemetry event'}
                    </span>
                  </div>
                  <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{ev.receivedAt}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Inspections Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem' }}>Recent Plant Inspections</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Inspections captured autonomously by Raspberry Pi 5 camera & Modbus NPK probe
            </p>
          </div>
          <Link to="/inspections" className="btn btn-outline btn-sm">
            View All Inspections <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Inspection ID</th>
                <th>Plant ID</th>
                <th>Greenhouse</th>
                <th>Nitrogen (N)</th>
                <th>Phosphorus (P)</th>
                <th>Potassium (K)</th>
                <th>AI Disease Prediction</th>
                <th>Confidence</th>
                <th>Timestamp</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentInspections.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                    No inspection records found. Use the Raspberry Pi client or demo seed data to populate.
                  </td>
                </tr>
              ) : (
                recentInspections.map((insp) => (
                  <tr key={insp.inspectionId}>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--emerald-400)' }}>
                      {insp.inspectionId}
                    </td>
                    <td><strong>{insp.plantId}</strong></td>
                    <td>{insp.greenhouseId}</td>
                    <td style={{ color: '#34d399' }}>
                      {insp.npkValues?.nitrogen !== null ? `${insp.npkValues.nitrogen} mg/kg` : 'N/A'}
                    </td>
                    <td style={{ color: '#22d3ee' }}>
                      {insp.npkValues?.phosphorus !== null ? `${insp.npkValues.phosphorus} mg/kg` : 'N/A'}
                    </td>
                    <td style={{ color: '#fbbf24' }}>
                      {insp.npkValues?.potassium !== null ? `${insp.npkValues.potassium} mg/kg` : 'N/A'}
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 500,
                          color: insp.aiPrediction?.disease === 'Healthy' ? '#34d399' : '#f87171'
                        }}
                      >
                        {insp.aiPrediction?.disease || 'Unknown'}
                      </span>
                    </td>
                    <td>
                      {insp.aiPrediction?.confidence !== undefined
                        ? `${(insp.aiPrediction.confidence * 100).toFixed(1)}%`
                        : 'N/A'}
                    </td>
                    <td style={{ fontSize: '0.775rem', color: 'var(--text-dim)' }}>
                      {new Date(insp.timestamp).toLocaleString()}
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedInspection(insp)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.725rem' }}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selectedInspection && (
        <InspectionDetailModal
          inspection={selectedInspection}
          onClose={() => setSelectedInspection(null)}
        />
      )}
    </div>
  );
};

export default DashboardPage;
