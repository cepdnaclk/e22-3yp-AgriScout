import React, { useEffect, useState } from 'react';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { Search, Filter, Sprout, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const PlantsPage = () => {
  const [plants, setPlants] = useState([]);
  const [greenhouses, setGreenhouses] = useState([]);
  const [search, setSearch] = useState('');
  const [healthFilter, setHealthFilter] = useState('');
  const [greenhouseFilter, setGreenhouseFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchFilters = async () => {
    try {
      const ghRes = await api.get('/greenhouses');
      setGreenhouses(ghRes.data?.data || []);
    } catch (e) {}
  };

  const fetchPlants = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (healthFilter) params.append('healthStatus', healthFilter);
      if (greenhouseFilter) params.append('greenhouseId', greenhouseFilter);

      const res = await api.get(`/plants?${params.toString()}`);
      setPlants(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch plants', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchPlants();
  }, [search, healthFilter, greenhouseFilter]);

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Plant Inventory Directory</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Detailed catalog of individual monitored greenhouse plants and health status records
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div style={{ flex: '1 1 250px', position: 'relative' }}>
          <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.4rem' }}
            placeholder="Search Plant ID or Species..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ width: '180px' }}>
          <select
            className="form-select"
            value={greenhouseFilter}
            onChange={(e) => setGreenhouseFilter(e.target.value)}
          >
            <option value="">All Greenhouses</option>
            {greenhouses.map((gh) => (
              <option key={gh.greenhouseId} value={gh.greenhouseId}>
                {gh.greenhouseId}
              </option>
            ))}
          </select>
        </div>

        <div style={{ width: '170px' }}>
          <select
            className="form-select"
            value={healthFilter}
            onChange={(e) => setHealthFilter(e.target.value)}
          >
            <option value="">All Health Statuses</option>
            <option value="healthy">Healthy</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>

        {(search || healthFilter || greenhouseFilter) && (
          <button
            onClick={() => {
              setSearch('');
              setHealthFilter('');
              setGreenhouseFilter('');
            }}
            className="btn btn-secondary btn-sm"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Plant Grid */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Plant ID</th>
              <th>Species / Cultivar</th>
              <th>Greenhouse Zone</th>
              <th>Location</th>
              <th>Health Status</th>
              <th>Last Inspected</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {plants.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                  No plant records matched your search filters.
                </td>
              </tr>
            ) : (
              plants.map((plant) => (
                <tr key={plant.plantId}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--emerald-400)' }}>
                    {plant.plantId}
                  </td>
                  <td><strong>{plant.species}</strong></td>
                  <td>{plant.greenhouseId}</td>
                  <td style={{ color: 'var(--text-dim)' }}>Row {plant.rowNumber}, Pos {plant.positionNumber}</td>
                  <td>
                    <StatusBadge status={plant.healthStatus} type="health" />
                  </td>
                  <td style={{ fontSize: '0.775rem', color: 'var(--text-dim)' }}>
                    {plant.lastInspectedAt ? new Date(plant.lastInspectedAt).toLocaleString() : 'Never'}
                  </td>
                  <td>
                    <Link to={`/plants/${plant.plantId}`} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>
                      View Details <ArrowRight size={12} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlantsPage;
