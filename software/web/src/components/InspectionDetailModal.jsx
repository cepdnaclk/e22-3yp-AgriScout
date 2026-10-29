import React from 'react';
import { X, CheckCircle, AlertTriangle, Cpu, Droplet, Thermometer, ShieldCheck } from 'lucide-react';
import StatusBadge from './StatusBadge';

const InspectionDetailModal = ({ inspection, onClose }) => {
  if (!inspection) return null;

  const npk = inspection.npkValues || {};
  const ai = inspection.aiPrediction || {};

  return (
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
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '750px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#0f1713',
          padding: '1.75rem',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: 'none',
            color: 'var(--text-muted)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h2 style={{ fontSize: '1.4rem' }}>Inspection Details</h2>
            <StatusBadge status={inspection.inspectionStatus} type="health" />
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            ID: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--emerald-400)' }}>{inspection.inspectionId}</span> |{' '}
            {new Date(inspection.timestamp).toLocaleString()}
          </span>
        </div>

        {/* Grid layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          {/* Leaf Image Section */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Captured Leaf Image
            </span>

            {inspection.leafImageUrl ? (
              <img
                src={inspection.leafImageUrl}
                alt={`Leaf ${inspection.plantId}`}
                style={{
                  width: '100%',
                  height: '220px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)'
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '220px',
                  borderRadius: '8px',
                  background: 'rgba(20, 30, 25, 0.6)',
                  border: '1px dashed var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-dim)',
                  gap: '0.5rem'
                }}
              >
                <Cpu size={32} />
                <span style={{ fontSize: '0.8rem' }}>No leaf image uploaded</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              <span>Plant: <strong style={{ color: '#fff' }}>{inspection.plantId}</strong></span>
              <span>Greenhouse: <strong style={{ color: '#fff' }}>{inspection.greenhouseId}</strong></span>
              <span>Robot: <strong style={{ color: '#fff' }}>{inspection.robotId}</strong></span>
            </div>
          </div>

          {/* AI Disease Analysis */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              AI Leaf Disease Classification
            </span>

            <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Predicted Condition:</span>
                <span
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: ai.disease === 'Healthy' ? '#34d399' : '#f87171'
                  }}
                >
                  {ai.disease || 'Unknown'}
                </span>
              </div>

              {/* Confidence meter */}
              <div style={{ marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                  <span>Confidence Score</span>
                  <span style={{ fontWeight: 600 }}>{((ai.confidence || 0) * 100).toFixed(1)}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${(ai.confidence || 0) * 100}%`,
                      height: '100%',
                      background: ai.disease === 'Healthy' ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #f59e0b, #ef4444)',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <div>Model: {ai.modelVersion || 'None'}</div>
                <div>Inference Status: <span style={{ textTransform: 'uppercase', color: '#fff' }}>{ai.status || 'not_configured'}</span></div>
              </div>
            </div>

            {/* Offline queue info */}
            <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.4)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <div>Offline Queued: <strong style={{ color: '#fff' }}>{inspection.uploadMetadata?.isOfflineQueued ? 'Yes (Synced after reconnect)' : 'No (Direct upload)'}</strong></div>
              <div>Retries: {inspection.uploadMetadata?.retryCount || 0}</div>
            </div>
          </div>
        </div>

        {/* NPK Sensor Values */}
        <div className="glass-card" style={{ marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.75rem' }}>
            Soil Nutrient Analysis (RS-485 Modbus Sensor)
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
            <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Nitrogen (N)</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#34d399' }}>
                {npk.nitrogen !== null ? `${npk.nitrogen} mg/kg` : 'N/A'}
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', display: 'block' }}>Target: 80-250 mg/kg</span>
            </div>

            <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Phosphorus (P)</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22d3ee' }}>
                {npk.phosphorus !== null ? `${npk.phosphorus} mg/kg` : 'N/A'}
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', display: 'block' }}>Target: 35-120 mg/kg</span>
            </div>

            <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Potassium (K)</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fbbf24' }}>
                {npk.potassium !== null ? `${npk.potassium} mg/kg` : 'N/A'}
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', display: 'block' }}>Target: 120-350 mg/kg</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InspectionDetailModal;
