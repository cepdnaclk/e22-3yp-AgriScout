import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import { Home, Plus, MapPin, Sprout, AlertTriangle, ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const GreenhousesPage = () => {
  const [greenhouses, setGreenhouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    greenhouseId: '',
    name: '',
    location: '',
    description: '',
    status: 'active'
  });
  const [error, setError] = useState('');
  const { isOperator } = useAuth();

  const fetchGreenhouses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/greenhouses');
      setGreenhouses(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch greenhouses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGreenhouses();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/greenhouses', formData);
      if (res.data?.success) {
        setIsModalOpen(false);
        setFormData({ greenhouseId: '', name: '', location: '', description: '', status: 'active' });
        fetchGreenhouses();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create greenhouse');
    }
  };

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Greenhouses Facility Overview</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Agricultural zones, automated sensor grid mappings, and sector monitoring
          </p>
        </div>
        {isOperator && (
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <Plus size={16} /> Add Greenhouse Zone
          </button>
        )}
      </div>

      {/* Grid of Greenhouses */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {greenhouses.map((gh) => (
          <div key={gh.greenhouseId} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--emerald-400)' }}>
                  {gh.greenhouseId}
                </span>
                <h3 style={{ fontSize: '1.2rem', marginTop: '0.25rem' }}>{gh.name}</h3>
              </div>
              <StatusBadge status={gh.status} type="health" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <MapPin size={15} color="var(--text-dim)" />
              <span>{gh.location || 'Main Agricultural Campus'}</span>
            </div>

            {gh.description && (
              <p style={{ fontSize: '0.825rem', color: 'var(--text-dim)', margin: 0 }}>
                {gh.description}
              </p>
            )}

            <div style={{ display: 'flex', gap: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', marginTop: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sprout size={16} color="var(--emerald-400)" />
                <span style={{ fontSize: '0.85rem' }}><strong>{gh.plantCount || 0}</strong> Plants</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={16} color={gh.activeAlertCount > 0 ? 'var(--amber-400)' : 'var(--text-dim)'} />
                <span style={{ fontSize: '0.85rem' }}><strong>{gh.activeAlertCount || 0}</strong> Alerts</span>
              </div>
            </div>

            <Link
              to={`/greenhouses/${gh.greenhouseId}`}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center' }}
            >
              View Greenhouse Details <ArrowRight size={14} />
            </Link>
          </div>
        ))}
      </div>

      {/* Add Modal */}
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
              <h2 style={{ fontSize: '1.3rem' }}>Register New Greenhouse</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {error && (
              <div style={{ padding: '0.65rem', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', fontSize: '0.825rem', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Greenhouse ID (e.g. GH-EAST-03)</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="GH-EAST-03"
                  value={formData.greenhouseId}
                  onChange={(e) => setFormData({ ...formData, greenhouseId: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Zone Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="East High-Density Tomato Bay"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Location / Wing</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Sector C - East Wing"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description & Crop Specs</label>
                <textarea
                  rows="3"
                  className="form-textarea"
                  placeholder="Hydroponic drip irrigation, trellis system..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Greenhouse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GreenhousesPage;
