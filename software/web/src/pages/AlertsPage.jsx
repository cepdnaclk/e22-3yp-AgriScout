import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import { AlertTriangle, Check, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [severityFilter, setSeverityFilter] = useState('');
  const [ackFilter, setAckFilter] = useState('false'); // default unacknowledged
  const [loading, setLoading] = useState(true);
  const { lastAlert } = useSocket();
  const { isOperator } = useAuth();

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (severityFilter) params.append('severity', severityFilter);
      if (ackFilter) params.append('acknowledged', ackFilter);

      const res = await api.get(`/alerts?${params.toString()}`);
      setAlerts(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load alerts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [severityFilter, ackFilter]);

  useEffect(() => {
    if (lastAlert) {
      setAlerts((prev) => [lastAlert, ...prev]);
    }
  }, [lastAlert]);

  const handleAcknowledge = async (alertId) => {
    try {
      const res = await api.patch(`/alerts/${alertId}/acknowledge`);
      if (res.data?.success) {
        setAlerts((prev) =>
          prev.map((a) => (a.alertId === alertId || a._id === alertId ? res.data.data : a))
        );
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to acknowledge alert');
    }
  };

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>System Alerts & Safeguards</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Real-time automated incident triggers, disease flags, and soil deficiency notifications
          </p>
        </div>
        <button onClick={fetchAlerts} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} /> Refresh Alerts
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setAckFilter('false')}
            className={`btn btn-sm ${ackFilter === 'false' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Active & Pending ({alerts.filter((a) => !a.acknowledged).length})
          </button>
          <button
            onClick={() => setAckFilter('true')}
            className={`btn btn-sm ${ackFilter === 'true' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Acknowledged
          </button>
          <button
            onClick={() => setAckFilter('')}
            className={`btn btn-sm ${ackFilter === '' ? 'btn-primary' : 'btn-secondary'}`}
          >
            All Logs
          </button>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Severity:</span>
          <select
            className="form-select"
            style={{ width: '150px' }}
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {alerts.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)' }}>
            <CheckCircle size={36} color="var(--emerald-400)" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>No Alerts in This Category</h3>
            <p style={{ fontSize: '0.85rem' }}>All environmental and crop telemetry is operating within nominal thresholds.</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const isCritical = alert.severity === 'critical';
            return (
              <div
                key={alert.alertId || alert._id}
                className="glass-panel"
                style={{
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  borderLeft: `4px solid ${isCritical ? '#f87171' : alert.severity === 'warning' ? '#fbbf24' : '#38bdf8'}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div
                    style={{
                      padding: '0.65rem',
                      borderRadius: '8px',
                      background: isCritical ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: isCritical ? '#f87171' : '#fbbf24'
                    }}
                  >
                    <AlertTriangle size={20} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
                      <StatusBadge status={alert.severity} type="severity" />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--emerald-400)' }}>
                        {alert.alertId}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        Zone: <strong>{alert.greenhouseId}</strong> {alert.plantId && `| Plant: ${alert.plantId}`}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.925rem', color: '#ffffff', margin: 0, fontWeight: 500 }}>
                      {alert.message}
                    </p>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.35rem' }}>
                      Triggered at: {new Date(alert.createdAt).toLocaleString()}
                      {alert.acknowledged && (
                        <span style={{ marginLeft: '1rem', color: 'var(--emerald-400)' }}>
                          &bull; Acknowledged by {alert.acknowledgedBy?.name || 'Operator'} on {new Date(alert.acknowledgedAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  {!alert.acknowledged ? (
                    isOperator && (
                      <button
                        onClick={() => handleAcknowledge(alert.alertId || alert._id)}
                        className="btn btn-outline btn-sm"
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        <Check size={14} /> Acknowledge Alert
                      </button>
                    )
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <CheckCircle size={14} color="var(--emerald-400)" /> Resolved
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AlertsPage;
