import React, { useEffect, useState } from 'react';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import InspectionDetailModal from '../components/InspectionDetailModal';
import { Search, Calendar, ChevronLeft, ChevronRight, Eye, RefreshCw } from 'lucide-react';

const InspectionsPage = () => {
  const [inspections, setInspections] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    greenhouseId: '',
    plantId: '',
    disease: '',
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(true);
  const [selectedInspection, setSelectedInspection] = useState(null);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: '15'
      });
      if (filters.greenhouseId) params.append('greenhouseId', filters.greenhouseId);
      if (filters.plantId) params.append('plantId', filters.plantId);
      if (filters.disease) params.append('disease', filters.disease);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const res = await api.get(`/inspections?${params.toString()}`);
      setInspections(res.data?.data || []);
      setTotal(res.data?.total || 0);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      console.error('Failed to load inspections', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, [page, filters]);

  const handleFilterChange = (key, val) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Inspection Log Archive</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Complete audit trail of all plant inspections recorded by autonomous greenhouse robots
          </p>
        </div>
        <button onClick={fetchInspections} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
        <input
          type="text"
          className="form-input"
          style={{ width: '150px' }}
          placeholder="Greenhouse ID..."
          value={filters.greenhouseId}
          onChange={(e) => handleFilterChange('greenhouseId', e.target.value)}
        />

        <input
          type="text"
          className="form-input"
          style={{ width: '150px' }}
          placeholder="Plant ID..."
          value={filters.plantId}
          onChange={(e) => handleFilterChange('plantId', e.target.value)}
        />

        <input
          type="text"
          className="form-input"
          style={{ width: '160px' }}
          placeholder="Disease Name..."
          value={filters.disease}
          onChange={(e) => handleFilterChange('disease', e.target.value)}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>From:</span>
          <input
            type="date"
            className="form-input"
            style={{ width: '140px' }}
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>To:</span>
          <input
            type="date"
            className="form-input"
            style={{ width: '140px' }}
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
          />
        </div>

        {(filters.greenhouseId || filters.plantId || filters.disease || filters.startDate || filters.endDate) && (
          <button
            onClick={() => {
              setPage(1);
              setFilters({ greenhouseId: '', plantId: '', disease: '', startDate: '', endDate: '' });
            }}
            className="btn btn-secondary btn-sm"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Inspection ID</th>
              <th>Plant ID</th>
              <th>Greenhouse</th>
              <th>N (mg/kg)</th>
              <th>P (mg/kg)</th>
              <th>K (mg/kg)</th>
              <th>AI Disease</th>
              <th>Confidence</th>
              <th>Timestamp</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {inspections.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-dim)' }}>
                  No inspections found matching criteria.
                </td>
              </tr>
            ) : (
              inspections.map((insp) => (
                <tr key={insp.inspectionId}>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--emerald-400)' }}>
                    {insp.inspectionId}
                  </td>
                  <td><strong>{insp.plantId}</strong></td>
                  <td>{insp.greenhouseId}</td>
                  <td style={{ color: '#34d399' }}>{insp.npkValues?.nitrogen !== null ? insp.npkValues.nitrogen : '—'}</td>
                  <td style={{ color: '#22d3ee' }}>{insp.npkValues?.phosphorus !== null ? insp.npkValues.phosphorus : '—'}</td>
                  <td style={{ color: '#fbbf24' }}>{insp.npkValues?.potassium !== null ? insp.npkValues.potassium : '—'}</td>
                  <td>
                    <span style={{ color: insp.aiPrediction?.disease === 'Healthy' ? '#34d399' : '#f87171', fontWeight: 500 }}>
                      {insp.aiPrediction?.disease || 'Unknown'}
                    </span>
                  </td>
                  <td>{insp.aiPrediction?.confidence !== undefined ? `${(insp.aiPrediction.confidence * 100).toFixed(1)}%` : '—'}</td>
                  <td style={{ fontSize: '0.775rem', color: 'var(--text-dim)' }}>
                    {new Date(insp.timestamp).toLocaleString()}
                  </td>
                  <td>
                    <button
                      onClick={() => setSelectedInspection(insp)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.25rem 0.5rem' }}
                    >
                      <Eye size={12} /> View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({total} total records)
        </span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="btn btn-secondary btn-sm"
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="btn btn-secondary btn-sm"
          >
            Next <ChevronRight size={16} />
          </button>
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

export default InspectionsPage;
