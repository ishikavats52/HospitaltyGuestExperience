import React, { useState, useEffect } from 'react';
import { Layers, Plus, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';
import api from '../../services/api.js';

export const CataloguePage = () => {
  const [catalogue, setCatalogue] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('CONCIERGE');
  const [description, setDescription] = useState('');
  const [isFreeByDefault, setIsFreeByDefault] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchCatalogue = async () => {
    try {
      setLoading(true);
      const res = await api.get('/service-catalogue');
      setCatalogue(res.data || []);
    } catch (err) {
      console.error('Failed to load catalogue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogue();
  }, []);

  const handleCreateService = async (e) => {
    e.preventDefault();
    if (!name || !code) return;
    setSaving(true);
    try {
      await api.post('/service-catalogue', {
        name,
        code: code.toUpperCase().replace(/\s+/g, '_'),
        category,
        description,
        isFreeByDefault,
        eligiblePlans: isFreeByDefault ? ['FREE', 'BASIC', 'PREMIUM'] : ['BASIC', 'PREMIUM'],
      });
      showToast(`Master service "${name}" created and added to central catalogue!`);
      setName('');
      setCode('');
      setDescription('');
      await fetchCatalogue();
    } catch (err) {
      alert(err.message || 'Failed to create service');
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
          Central SaaS Services
        </div>
        <h1 className="title-gold page-title" style={{ fontSize: '2.1rem', margin: '4px 0', letterSpacing: '-0.02em' }}>
          Master Service Catalogue
        </h1>
        <p className="page-subtitle" style={{ margin: 0 }}>
          Manage canonical SaaS service definitions available across the platform and geolocation matrix.
        </p>
      </div>

      {/* Add New Master Service Form */}
      <div className="glass-panel animate-fade-in" style={{ padding: 'clamp(16px, 3vw, 24px)', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} color="var(--gold-primary)" /> Define New Global Master Service
        </h3>

        <form onSubmit={handleCreateService} className="grid-form-4">
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Service Name
            </label>
            <input
              type="text"
              className="input-control"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!code) setCode(e.target.value.toUpperCase().replace(/\s+/g, '_'));
              }}
              placeholder="e.g. Sunrise Yoga Class"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Service Code
            </label>
            <input
              type="text"
              className="input-control"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="SUNRISE_YOGA"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Category
            </label>
            <select className="input-control" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="HOUSEKEEPING">Housekeeping</option>
              <option value="DINING">Dining & Room Service</option>
              <option value="TRANSPORT">Transport & Transfers</option>
              <option value="WELLNESS_SPA">Wellness & Spa</option>
              <option value="CONCIERGE">Concierge & Experiences</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Free Subscription Tier
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '10px 0' }}>
              <input
                type="checkbox"
                checked={isFreeByDefault}
                onChange={(e) => setIsFreeByDefault(e.target.checked)}
                style={{ accentColor: 'var(--gold-primary)' }}
              />
              <span style={{ fontSize: '0.86rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                Free Tier Eligible
              </span>
            </label>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Service Description
            </label>
            <input
              type="text"
              className="input-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of guest amenity..."
            />
          </div>

          <button type="submit" disabled={saving} className="btn btn-gold" style={{ height: '46px', gridColumn: '1 / -1' }}>
            <Layers size={16} /> {saving ? 'Adding...' : 'Add to Master Catalogue'}
          </button>
        </form>
      </div>

      {/* Catalogue Table */}
      <div className="glass-panel animate-fade-in" style={{ padding: 'clamp(16px, 3vw, 24px)', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
          Registered SaaS Services ({catalogue.length})
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
            Loading catalogue items...
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Service Name</th>
                  <th>Service Code</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Free Plan Default</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {catalogue.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {s.name}
                      </span>
                    </td>
                    <td>
                      <code style={{ fontSize: '0.78rem', background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>
                        {s.code}
                      </code>
                    </td>
                    <td>
                      <span className="badge badge-gold">
                        {s.category}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '320px' }}>
                      {s.description}
                    </td>
                    <td>
                      <span className={`badge ${s.isFreeByDefault ? 'badge-free' : 'badge-gold'}`}>
                        {s.isFreeByDefault ? 'Free Subscription' : 'Paid Add-on'}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-free">
                        Active
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
