import React, { useEffect, useState } from 'react';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import InspectionDetailModal from '../components/InspectionDetailModal';
import { ScanEye, Cpu, CheckCircle2, AlertOctagon, Filter, RefreshCw } from 'lucide-react';

const DiseaseDetectionPage = () => {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // 'all', 'diseased', 'healthy'
  const [selectedInspection, setSelectedInspection] = useState(null);

  const fetchClassifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/inspections?limit=30');
      setInspections(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load disease detections', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassifications();
  }, []);

  const filtered = inspections.filter((insp) => {
    const disease = insp.aiPrediction?.disease || 'Unknown';
    if (filterType === 'diseased') {
      return disease !== 'Healthy' && disease !== 'Unknown';
    }
    if (filterType === 'healthy') {
      return disease === 'Healthy';
    }
    return true;
  });

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>AI Leaf Disease Diagnostics</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Computer vision inferences generated from Raspberry Pi camera leaf captures
          </p>
        </div>
        <button onClick={fetchClassifications} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} /> Refresh Feed
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => setFilterType('all')}
          className={`btn btn-sm ${filterType === 'all' ? 'btn-primary' : 'btn-secondary'}`}
        >
          All Scans ({inspections.length})
        </button>
        <button
          onClick={() => setFilterType('diseased')}
          className={`btn btn-sm ${filterType === 'diseased' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Abnormal / Diseased Only
        </button>
        <button
          onClick={() => setFilterType('healthy')}
          className={`btn btn-sm ${filterType === 'healthy' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Healthy Scans Only
        </button>
      </div>

      {/* Visual Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {filtered.length === 0 ? (
          <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-dim)' }}>
            No leaf disease detection records matching this filter.
          </div>
        ) : (
          filtered.map((insp) => {
            const ai = insp.aiPrediction || {};
            const isHealthy = ai.disease === 'Healthy';
            const confidencePct = ((ai.confidence || 0) * 100).toFixed(1);

            return (
              <div
                key={insp.inspectionId}
                className="glass-panel"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  cursor: 'pointer',
                  border: isHealthy ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.3)'
                }}
                onClick={() => setSelectedInspection(insp)}
              >
                {/* Image or placeholder */}
                <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '8px', overflow: 'hidden', background: '#0a0f0d' }}>
                  {insp.leafImageUrl ? (
                    <img
                      src={insp.leafImageUrl}
                      alt={ai.disease}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', gap: '0.5rem' }}>
                      <Cpu size={32} />
                      <span style={{ fontSize: '0.75rem' }}>Leaf Image Reference</span>
                    </div>
                  )}

                  <div
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'rgba(0, 0, 0, 0.75)',
                      backdropFilter: 'blur(4px)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      color: isHealthy ? '#34d399' : '#f87171',
                      fontWeight: 600
                    }}
                  >
                    {confidencePct}% Conf
                  </div>
                </div>

                {/* Prediction Details */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--emerald-400)' }}>
                      {insp.plantId}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                      {new Date(insp.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', color: isHealthy ? '#34d399' : '#f87171', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {isHealthy ? <CheckCircle2 size={16} /> : <AlertOctagon size={16} />}
                    {ai.disease || 'Unknown Condition'}
                  </h3>
                </div>

                {/* Confidence Bar */}
                <div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${ai.confidence ? ai.confidence * 100 : 0}%`,
                        height: '100%',
                        background: isHealthy ? '#10b981' : 'linear-gradient(90deg, #f59e0b, #ef4444)',
                        borderRadius: '3px'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  <span>Zone: <strong>{insp.greenhouseId}</strong></span>
                  <span>Model: <strong>{ai.modelVersion || 'v1.0'}</strong></span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedInspection && (
        <InspectionDetailModal
          inspection={selectedInspection}
          onClose={() => setSelectedInspection(null)}
        />
      )}
    </div>
  );
};

export default DiseaseDetectionPage;
