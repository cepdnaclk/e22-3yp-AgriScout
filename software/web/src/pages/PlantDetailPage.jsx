import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import InspectionDetailModal from '../components/InspectionDetailModal';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { ArrowLeft, Sprout, AlertTriangle, Activity, Calendar } from 'lucide-react';

const PlantDetailPage = () => {
  const { plantId } = useParams();
  const [plant, setPlant] = useState(null);
  const [history, setHistory] = useState([]);
  const [npkTimeline, setNpkTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInspection, setSelectedInspection] = useState(null);

  const fetchPlantData = async () => {
    try {
      setLoading(true);
      const [plantRes, historyRes] = await Promise.all([
        api.get(`/plants/${plantId}`),
        api.get(`/plants/${plantId}/history`)
      ]);
      setPlant(plantRes.data?.data || null);
      setHistory(historyRes.data?.inspections || []);

      // Format data for Recharts
      const timelineData = (historyRes.data?.npkTimeline || []).map((item) => ({
        time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fullDate: new Date(item.timestamp).toLocaleDateString(),
        nitrogen: item.nitrogen,
        phosphorus: item.phosphorus,
        potassium: item.potassium,
        disease: item.disease
      }));
      setNpkTimeline(timelineData);
    } catch (err) {
      console.error('Failed to fetch plant history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlantData();
  }, [plantId]);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading plant history and analytics...</div>;
  }

  if (!plant) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Plant '{plantId}' Not Found</h2>
        <Link to="/plants" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          Back to Plant Directory
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Link to="/plants" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem' }}>
        <ArrowLeft size={16} /> Back to Plant Directory
      </Link>

      {/* Overview Card */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--emerald-400)' }}>
              ZONE: {plant.greenhouseId} | ROW {plant.rowNumber}, POS {plant.positionNumber}
            </span>
            <h1 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>{plant.plantId}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>{plant.species}</p>
          </div>
          <StatusBadge status={plant.healthStatus} type="health" />
        </div>

        <div style={{ display: 'flex', gap: '2rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', fontSize: '0.85rem' }}>
          <div>
            <span style={{ color: 'var(--text-dim)', display: 'block' }}>Total Recorded Inspections</span>
            <strong style={{ fontSize: '1.2rem', color: '#fff' }}>{history.length}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-dim)', display: 'block' }}>Last Robot Inspection</span>
            <strong style={{ fontSize: '1.2rem', color: '#fff' }}>
              {plant.lastInspectedAt ? new Date(plant.lastInspectedAt).toLocaleString() : 'Never'}
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-dim)', display: 'block' }}>Active Health Alerts</span>
            <strong style={{ fontSize: '1.2rem', color: plant.activeAlerts?.length > 0 ? '#f87171' : '#34d399' }}>
              {plant.activeAlerts?.length || 0}
            </strong>
          </div>
        </div>
      </div>

      {/* NPK History Chart */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} color="var(--emerald-400)" />
            NPK Soil Nutrient History Trend
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Temporal variations in Nitrogen (N), Phosphorus (P), and Potassium (K) measured via Modbus RS-485 probe
          </p>
        </div>

        {npkTimeline.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)' }}>
            No soil nutrient inspection history available for this plant yet.
          </div>
        ) : (
          <div style={{ width: '100%', height: '320px' }}>
            <ResponsiveContainer>
              <LineChart data={npkTimeline} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} unit=" mg/kg" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f1713', borderColor: 'rgba(52,211,153,0.3)', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '0.85rem' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Line type="monotone" dataKey="nitrogen" name="Nitrogen (N)" stroke="#34d399" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="phosphorus" name="Phosphorus (P)" stroke="#22d3ee" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="potassium" name="Potassium (K)" stroke="#fbbf24" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Historical Inspections Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Chronological Inspection Log</h3>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Inspection ID</th>
                <th>Timestamp</th>
                <th>Nitrogen</th>
                <th>Phosphorus</th>
                <th>Potassium</th>
                <th>AI Classification</th>
                <th>Confidence</th>
                <th>Status</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                    No inspections recorded for this plant yet.
                  </td>
                </tr>
              ) : (
                history.map((insp) => (
                  <tr key={insp.inspectionId}>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--emerald-400)' }}>{insp.inspectionId}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{new Date(insp.timestamp).toLocaleString()}</td>
                    <td style={{ color: '#34d399' }}>{insp.npkValues?.nitrogen !== null ? `${insp.npkValues.nitrogen} mg/kg` : 'N/A'}</td>
                    <td style={{ color: '#22d3ee' }}>{insp.npkValues?.phosphorus !== null ? `${insp.npkValues.phosphorus} mg/kg` : 'N/A'}</td>
                    <td style={{ color: '#fbbf24' }}>{insp.npkValues?.potassium !== null ? `${insp.npkValues.potassium} mg/kg` : 'N/A'}</td>
                    <td>
                      <span style={{ color: insp.aiPrediction?.disease === 'Healthy' ? '#34d399' : '#f87171', fontWeight: 500 }}>
                        {insp.aiPrediction?.disease || 'Unknown'}
                      </span>
                    </td>
                    <td>{insp.aiPrediction?.confidence ? `${(insp.aiPrediction.confidence * 100).toFixed(1)}%` : 'N/A'}</td>
                    <td><StatusBadge status={insp.inspectionStatus} type="health" /></td>
                    <td>
                      <button onClick={() => setSelectedInspection(insp)} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.5rem' }}>
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

      {selectedInspection && (
        <InspectionDetailModal inspection={selectedInspection} onClose={() => setSelectedInspection(null)} />
      )}
    </div>
  );
};

export default PlantDetailPage;
