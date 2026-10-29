import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { Sprout, MapPin, AlertTriangle, ArrowLeft, Plus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const GreenhouseDetailPage = () => {
  const { id } = useParams();
  const [greenhouse, setGreenhouse] = useState(null);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPlantModalOpen, setIsPlantModalOpen] = useState(false);
  const [plantForm, setPlantForm] = useState({
    plantId: '',
    species: 'Solanum lycopersicum (Tomato)',
    rowNumber: 1,
    positionNumber: 1,
    notes: ''
  });
  const [error, setError] = useState('');
  const { isOperator } = useAuth();

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const [ghRes, plantsRes] = await Promise.all([
        api.get(`/greenhouses/${id}`),
        api.get(`/plants?greenhouseId=${id}`)
      ]);
      setGreenhouse(ghRes.data?.data || null);
      setPlants(plantsRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load greenhouse details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleAddPlant = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/plants', {
        ...plantForm,
        greenhouseId: id,
        rowNumber: Number(plantForm.rowNumber),
        positionNumber: Number(plantForm.positionNumber)
      });
      if (res.data?.success) {
        setIsPlantModalOpen(false);
        setPlantForm({
          plantId: '',
          species: 'Solanum lycopersicum (Tomato)',
          rowNumber: 1,
          positionNumber: 1,
          notes: ''
        });
        fetchDetails();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add plant');
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading greenhouse telemetry...</div>;
  }

  if (!greenhouse) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Greenhouse '{id}' Not Found</h2>
        <Link to="/greenhouses" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          Back to Greenhouses
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Link to="/greenhouses" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem' }}>
        <ArrowLeft size={16} /> Back to Greenhouses
      </Link>

      {/* Header Info */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--emerald-400)' }}>
              ZONE ID: {greenhouse.greenhouseId}
            </span>
            <h1 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>{greenhouse.name}</h1>
          </div>
          <StatusBadge status={greenhouse.status} type="health" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
          <MapPin size={16} />
          <span>{greenhouse.location || 'Unassigned Wing'}</span>
        </div>

        {greenhouse.description && (
          <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>{greenhouse.description}</p>
        )}
      </div>

      {/* Plants Grid */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem' }}>Registered Plants in Zone ({plants.length})</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Individual plants inspected by the autonomous robot
            </p>
          </div>
          {isOperator && (
            <button onClick={() => setIsPlantModalOpen(true)} className="btn btn-primary btn-sm">
              <Plus size={14} /> Add Plant to Zone
            </button>
          )}
        </div>

        {plants.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>
            No plants registered in this zone yet.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {plants.map((plant) => (
              <Link
                key={plant.plantId}
                to={`/plants/${plant.plantId}`}
                className="glass-card"
                style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--emerald-400)', fontSize: '0.85rem' }}>
                    {plant.plantId}
                  </span>
                  <StatusBadge status={plant.healthStatus} type="health" />
                </div>

                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>
                  {plant.species}
                </div>

                <div style={{ fontSize: '0.775rem', color: 'var(--text-dim)' }}>
                  Row {plant.rowNumber}, Position {plant.positionNumber}
                </div>

                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.4rem' }}>
                  Last Inspected: {plant.lastInspectedAt ? new Date(plant.lastInspectedAt).toLocaleDateString() : 'Pending'}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Add Plant Modal */}
      {isPlantModalOpen && (
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
          onClick={() => setIsPlantModalOpen(false)}
        >
          <div
            className="glass-panel"
            style={{ width: '100%', maxWidth: '480px', padding: '1.75rem', backgroundColor: '#0f1713' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.3rem' }}>Register Plant to {greenhouse.greenhouseId}</h2>
              <button onClick={() => setIsPlantModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {error && (
              <div style={{ padding: '0.65rem', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', fontSize: '0.825rem', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleAddPlant}>
              <div className="form-group">
                <label className="form-label">Plant ID (e.g. PLANT-N1-R03-P01)</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="PLANT-N1-R03-P01"
                  value={plantForm.plantId}
                  onChange={(e) => setPlantForm({ ...plantForm, plantId: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Botanical Species / Cultivar</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Solanum lycopersicum (Tomato)"
                  value={plantForm.species}
                  onChange={(e) => setPlantForm({ ...plantForm, species: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Row Number</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="form-input"
                    value={plantForm.rowNumber}
                    onChange={(e) => setPlantForm({ ...plantForm, rowNumber: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Position Number</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="form-input"
                    value={plantForm.positionNumber}
                    onChange={(e) => setPlantForm({ ...plantForm, positionNumber: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setIsPlantModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Register Plant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GreenhouseDetailPage;
