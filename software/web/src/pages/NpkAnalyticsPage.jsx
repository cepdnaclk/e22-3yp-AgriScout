import React, { useEffect, useState } from 'react';
import api from '../api/client';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { Activity, Droplet, Thermometer, Info, RefreshCw } from 'lucide-react';

const NpkAnalyticsPage = () => {
  const [inspections, setInspections] = useState([]);
  const [greenhouses, setGreenhouses] = useState([]);
  const [selectedGreenhouse, setSelectedGreenhouse] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [inspRes, ghRes] = await Promise.all([
        api.get('/inspections?limit=50'),
        api.get('/greenhouses')
      ]);
      setInspections(inspRes.data?.data || []);
      setGreenhouses(ghRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load NPK analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = selectedGreenhouse
    ? inspections.filter((i) => i.greenhouseId === selectedGreenhouse)
    : inspections;

  // Chart data: chronological inspections with valid NPK
  const chartData = [...filtered]
    .filter((i) => i.npkValues && (i.npkValues.nitrogen !== null || i.npkValues.phosphorus !== null))
    .slice(0, 20)
    .reverse()
    .map((i) => ({
      name: i.plantId,
      time: new Date(i.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      nitrogen: i.npkValues?.nitrogen || 0,
      phosphorus: i.npkValues?.phosphorus || 0,
      potassium: i.npkValues?.potassium || 0,
      soilTemp: i.soilTemperature,
      soilMoisture: i.soilMoisture
    }));

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>NPK Soil Nutrient Analytics</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Real-time optical/electrochemical nutrient profiling via RS-485 Modbus soil sensor
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <select
            className="form-select"
            style={{ width: '180px' }}
            value={selectedGreenhouse}
            onChange={(e) => setSelectedGreenhouse(e.target.value)}
          >
            <option value="">All Greenhouses</option>
            {greenhouses.map((gh) => (
              <option key={gh.greenhouseId} value={gh.greenhouseId}>
                {gh.greenhouseId}
              </option>
            ))}
          </select>
          <button onClick={fetchData} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Target Threshold Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
        <div className="glass-card" style={{ borderLeft: '4px solid #34d399' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nitrogen (N) - Vegetative Vigor</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#34d399', margin: '0.25rem 0' }}>
            100 – 200 mg/kg
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Critical Threshold: &lt; 50 mg/kg | Warning: &lt; 80 mg/kg
          </span>
        </div>

        <div className="glass-card" style={{ borderLeft: '4px solid #22d3ee' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Phosphorus (P) - Root Architecture</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#22d3ee', margin: '0.25rem 0' }}>
            40 – 90 mg/kg
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Critical Threshold: &lt; 20 mg/kg | Warning: &lt; 35 mg/kg
          </span>
        </div>

        <div className="glass-card" style={{ borderLeft: '4px solid #fbbf24' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Potassium (K) - Osmotic & Fruit Quality</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fbbf24', margin: '0.25rem 0' }}>
            150 – 300 mg/kg
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Critical Threshold: &lt; 80 mg/kg | Warning: &lt; 120 mg/kg
          </span>
        </div>
      </div>

      {/* Grouped Bar Chart of NPK by Plant */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>Nutrient Concentration per Plant Scan</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Recent soil probe readings across monitored plants (mg/kg)
        </p>

        {chartData.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)' }}>
            No NPK sensor measurements recorded yet.
          </div>
        ) : (
          <div style={{ width: '100%', height: '350px' }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} angle={-25} textAnchor="end" />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} unit=" mg/kg" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f1713', borderColor: 'rgba(52,211,153,0.3)', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '0.85rem' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="nitrogen" name="Nitrogen (N)" fill="#34d399" radius={[4, 4, 0, 0]} />
                <Bar dataKey="phosphorus" name="Phosphorus (P)" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                <Bar dataKey="potassium" name="Potassium (K)" fill="#fbbf24" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Environmental Readings Line Chart */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>Soil Micro-Climate Correlates</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Soil Temperature (°C) and Moisture Saturation (%) logged simultaneously with nutrient probing
        </p>

        {chartData.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>
            No environmental telemetry logged yet.
          </div>
        ) : (
          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f1713', borderColor: 'rgba(52,211,153,0.3)', borderRadius: '8px' }}
                />
                <Legend />
                <Line type="monotone" dataKey="soilTemp" name="Soil Temp (°C)" stroke="#f87171" strokeWidth={2} />
                <Line type="monotone" dataKey="soilMoisture" name="Soil Moisture (%)" stroke="#38bdf8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default NpkAnalyticsPage;
