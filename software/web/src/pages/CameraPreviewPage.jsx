import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { Camera, RefreshCw, Cpu, Image as ImageIcon, Info, Eye } from 'lucide-react';
import InspectionDetailModal from '../components/InspectionDetailModal';

const CameraPreviewPage = () => {
  const [inspectionsWithImages, setInspectionsWithImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedInspection, setSelectedInspection] = useState(null);

  const fetchCaptures = async () => {
    try {
      setLoading(true);
      const res = await api.get('/inspections?limit=12');
      const data = res.data?.data || [];
      // Prioritize inspections with images
      setInspectionsWithImages(data);
    } catch (err) {
      console.error('Failed to load camera captures', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaptures();
  }, []);

  // Periodic polling for new captures
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchCaptures, 15000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const activeCapture = inspectionsWithImages[0];

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Raspberry Pi Camera Feed</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            High-resolution leaf imagery captured via Picamera2 on Raspberry Pi 5
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh (15s)
          </label>
          <button onClick={fetchCaptures} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} /> Refresh Feed
          </button>
        </div>
      </div>

      {/* Engineering Notice */}
      <div
        style={{
          padding: '0.85rem 1.25rem',
          borderRadius: '8px',
          background: 'rgba(6, 182, 212, 0.08)',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          color: 'var(--cyan-400)',
          fontSize: '0.825rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}
      >
        <Info size={18} />
        <div>
          <strong>Operational Notice: Image-Based Monitoring</strong> — For power conservation and network reliability on the mobile autonomous rover, camera images are captured during each plant inspection sequence rather than constant high-bandwidth video streaming.
        </div>
      </div>

      {/* Featured Primary Camera View */}
      {activeCapture && (
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Camera size={20} color="var(--emerald-400)" />
              Latest Captured View: Plant {activeCapture.plantId}
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              Captured: {new Date(activeCapture.timestamp).toLocaleString()}
            </span>
          </div>

          <div style={{ width: '100%', height: '420px', borderRadius: '12px', overflow: 'hidden', background: '#070b09', border: '1px solid var(--border-subtle)', position: 'relative' }}>
            {activeCapture.leafImageUrl ? (
              <img
                src={activeCapture.leafImageUrl}
                alt="Active camera feed capture"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', gap: '0.75rem' }}>
                <Camera size={48} color="rgba(52, 211, 153, 0.4)" />
                <span style={{ fontSize: '0.9rem' }}>Awaiting Next Autonomous Camera Shutter Event</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Robot: {activeCapture.robotId} | Waypoint: {activeCapture.plantId}
                </span>
              </div>
            )}

            {/* Shutter Overlay info */}
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(8px)',
                padding: '0.5rem 0.85rem',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.1)',
                fontSize: '0.75rem',
                display: 'flex',
                gap: '1rem'
              }}
            >
              <span>Rover: <strong>{activeCapture.robotId}</strong></span>
              <span>Classification: <strong style={{ color: activeCapture.aiPrediction?.disease === 'Healthy' ? '#34d399' : '#f87171' }}>{activeCapture.aiPrediction?.disease || 'Unknown'}</strong></span>
              <span>Resolution: <strong>1920 x 1080 (Picamera2)</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* Historical Captures Grid */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Recent Inspection Captures</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {inspectionsWithImages.slice(1).map((insp) => (
            <div
              key={insp.inspectionId}
              className="glass-card"
              style={{ padding: '0.75rem', cursor: 'pointer' }}
              onClick={() => setSelectedInspection(insp)}
            >
              <div style={{ width: '100%', height: '130px', borderRadius: '6px', overflow: 'hidden', background: '#0a0f0d', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {insp.leafImageUrl ? (
                  <img src={insp.leafImageUrl} alt={insp.plantId} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <ImageIcon size={24} color="var(--text-dim)" />
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ fontWeight: 600 }}>{insp.plantId}</span>
                <span style={{ color: 'var(--text-dim)' }}>{new Date(insp.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))}
        </div>
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

export default CameraPreviewPage;
