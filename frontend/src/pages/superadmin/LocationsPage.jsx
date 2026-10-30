import React, { useState, useEffect } from 'react';
import { MapPin, Plus, CheckCircle2, Globe, Building2 } from 'lucide-react';
import api from '../../services/api.js';

export const LocationsPage = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [type, setType] = useState('CITY');
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/locations');
      setLocations(res.data || []);
    } catch (err) {
      console.error('Failed to load locations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleCreateLocation = async (e) => {
    e.preventDefault();
    if (!name) return;
    setSaving(true);
    try {
      await api.post('/locations', { name, type });
      showToast(`Territory node "${name}" added to SaaS hierarchy!`);
      setName('');
      await fetchLocations();
    } catch (err) {
      alert(err.message || 'Failed to add location');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'var(--text-primary)',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: 'var(--radius-sm)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 9999,
            fontSize: '0.88rem',
            animation: 'fadeIn 0.25s ease',
          }}
        >
          <CheckCircle2 size={18} color="var(--success)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <div style={{ fontSize: '0.72rem', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
          SaaS Territorial Structure
        </div>
        <h1 className="title-gold page-title" style={{ fontSize: '2.1rem', margin: '4px 0', letterSpacing: '-0.02em' }}>
          Geographic Hierarchy Management
        </h1>
        <p className="page-subtitle" style={{ margin: 0 }}>
          Manage multi-level territorial nodes (Country → State → City → Local Area) governing service availability policies.
        </p>
      </div>

      {/* Add Location Form */}
      <div className="glass-panel animate-fade-in" style={{ padding: 'clamp(16px, 3vw, 24px)', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} color="var(--gold-primary)" /> Register Territorial Geographic Node
        </h3>

        <form onSubmit={handleCreateLocation} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Territory / Node Name
            </label>
            <input
              type="text"
              className="input-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Goa, Bengaluru, Taj Ganj"
              required
            />
          </div>

          <div style={{ width: '180px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Hierarchy Level
            </label>
            <select className="input-control" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="COUNTRY">Country</option>
              <option value="STATE">State</option>
              <option value="CITY">City</option>
              <option value="LOCAL_AREA">Local Area / District</option>
            </select>
          </div>

          <button type="submit" disabled={saving} className="btn btn-gold" style={{ height: '46px', padding: '0 20px' }}>
            <MapPin size={16} /> {saving ? 'Adding...' : 'Add Location'}
          </button>
        </form>
      </div>

      {/* Locations Table */}
      <div className="glass-panel animate-fade-in" style={{ padding: 'clamp(16px, 3vw, 24px)', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
          Configured Geographic Nodes ({locations.length})
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
            Loading geographic tree...
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Location Name</th>
                  <th>Level / Node Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((loc) => (
                  <tr key={loc._id}>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {loc.name}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-gold">
                        {loc.type}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-free">
                        Active Node
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
