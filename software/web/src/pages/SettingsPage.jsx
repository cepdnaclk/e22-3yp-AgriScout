import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings, Shield, Sliders, Database, Save, Check } from 'lucide-react';

const SettingsPage = () => {
  const { user, isAdmin } = useAuth();
  const [saved, setSaved] = useState(false);
  const [configValues, setConfigValues] = useState({
    nitrogenCritical: 50,
    nitrogenWarning: 80,
    phosphorusCritical: 20,
    phosphorusWarning: 35,
    potassiumCritical: 80,
    potassiumWarning: 120,
    aiConfidenceThreshold: 65,
    robotHeartbeatTimeout: 60
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>System & Agronomic Configuration</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Threshold calibration, offline sync limits, and hardware telemetry parameters
        </p>
      </div>

      {saved && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Check size={16} /> Configuration updated successfully.
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* NPK Threshold Settings */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sliders size={18} color="var(--emerald-400)" />
            Nutrient Alert Thresholds (mg/kg)
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Configure when the automated alert engine flags nutrient deficiencies
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Nitrogen Critical Min (mg/kg)</label>
              <input
                type="number"
                className="form-input"
                value={configValues.nitrogenCritical}
                onChange={(e) => setConfigValues({ ...configValues, nitrogenCritical: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nitrogen Warning Min (mg/kg)</label>
              <input
                type="number"
                className="form-input"
                value={configValues.nitrogenWarning}
                onChange={(e) => setConfigValues({ ...configValues, nitrogenWarning: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phosphorus Critical Min (mg/kg)</label>
              <input
                type="number"
                className="form-input"
                value={configValues.phosphorusCritical}
                onChange={(e) => setConfigValues({ ...configValues, phosphorusCritical: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phosphorus Warning Min (mg/kg)</label>
              <input
                type="number"
                className="form-input"
                value={configValues.phosphorusWarning}
                onChange={(e) => setConfigValues({ ...configValues, phosphorusWarning: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Potassium Critical Min (mg/kg)</label>
              <input
                type="number"
                className="form-input"
                value={configValues.potassiumCritical}
                onChange={(e) => setConfigValues({ ...configValues, potassiumCritical: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Potassium Warning Min (mg/kg)</label>
              <input
                type="number"
                className="form-input"
                value={configValues.potassiumWarning}
                onChange={(e) => setConfigValues({ ...configValues, potassiumWarning: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>

        {/* AI Model & Robot Telemetry Tuning */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={18} color="var(--cyan-400)" />
            AI & Robot Operational Rules
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Tuning confidence filters and heartbeat timeout windows
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">
                AI Disease Confidence Threshold ({configValues.aiConfidenceThreshold}%)
              </label>
              <input
                type="range"
                min="50"
                max="95"
                step="1"
                value={configValues.aiConfidenceThreshold}
                onChange={(e) => setConfigValues({ ...configValues, aiConfidenceThreshold: Number(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--emerald-500)', marginTop: '0.5rem' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem', display: 'block' }}>
                Inferences below this threshold are marked "uncertain"
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Robot Offline Heartbeat Timeout (seconds)</label>
              <input
                type="number"
                className="form-input"
                value={configValues.robotHeartbeatTimeout}
                onChange={(e) => setConfigValues({ ...configValues, robotHeartbeatTimeout: Number(e.target.value) })}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem', display: 'block' }}>
                Default: 60 seconds before rover is flagged offline
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.5rem' }}>
            <Save size={16} /> Save Configuration Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
