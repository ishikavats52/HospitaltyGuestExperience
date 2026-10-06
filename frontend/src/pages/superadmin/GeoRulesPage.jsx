import React, { useState, useEffect } from 'react';
import { Globe, Plus, Check, X, ShieldAlert } from 'lucide-react';
import api from '../../services/api.js';

export const GeoRulesPage = () => {
  const [rules, setRules] = useState([]);
  const [catalogue, setCatalogue] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state for creating new rule
  const [selectedService, setSelectedService] = useState('');
  const [city, setCity] = useState('Delhi');
  const [isFree, setIsFree] = useState(false);
  const [allowedPlans, setAllowedPlans] = useState(['BASIC', 'PREMIUM']);
  const [saving, setSaving] = useState(false);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const [rulesRes, catRes] = await Promise.all([
        api.get('/service-availability'),
        api.get('/service-catalogue'),
      ]);
      setRules(rulesRes.data);
      setCatalogue(catRes.data);
      if (catRes.data.length > 0) setSelectedService(catRes.data[0]._id);
    } catch (err) {
      console.error('Failed to load rules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleCreateRule = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/service-availability', {
        serviceId: selectedService,
        country: 'India',
        city,
        enabled: true,
        isFree,
        allowedPlans: isFree ? ['FREE', 'BASIC', 'PREMIUM'] : allowedPlans,
      });
      await fetchRules();
    } catch (err) {
      alert(err.message || 'Failed to save rule');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div style={{ fontSize: '0.72rem', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>
          SaaS Core Governance
        </div>
        <h1 className="title-gold page-title" style={{ fontSize: '2.1rem', margin: '4px 0' }}>
          Geolocation Service Availability Matrix
        </h1>
        <p className="page-subtitle">
          Centrally control which guest services are available in specific cities/locations, and designate Free Subscription entitlements.
        </p>
      </div>

      {/* Rule Creator */}
      <div className="glass-panel animate-fade-in" style={{ padding: 'clamp(16px, 3vw, 24px)', backgroundColor: '#FFFFFF' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} color="var(--gold-primary)" /> Configure Location Availability Rule
        </h3>

        <form onSubmit={handleCreateRule} className="grid-form-4">
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Service
            </label>
            <select
              className="input-control"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
            >
              {catalogue.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Target City
            </label>
            <select className="input-control" value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="Delhi">Delhi</option>
              <option value="Agra">Agra</option>
              <option value="Jaipur">Jaipur</option>
              <option value="Mumbai">Mumbai</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Free Subscription Tier
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '10px 0' }}>
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
              />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>Include in Free Tier</span>
            </label>
          </div>

          <button type="submit" disabled={saving} className="btn btn-gold" style={{ height: '46px', width: '100%' }}>
            <Globe size={16} /> {saving ? 'Saving...' : 'Deploy Rule'}
          </button>
        </form>
      </div>

      {/* Rules Table */}
      <div className="glass-panel animate-fade-in" style={{ padding: 'clamp(16px, 3vw, 24px)', backgroundColor: '#FFFFFF' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
          Active Location & Subscription Rules
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            Loading availability matrix...
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Service Name</th>
                  <th>Category</th>
                  <th>City / Territory</th>
                  <th>Free Tier Entitled</th>
                  <th>Permitted Subscription Plans</th>
                  <th>Rule Status</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule._id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {rule.serviceId?.name || 'Master Service'}
                    </td>
                    <td>
                      <span className="badge badge-gold">{rule.serviceId?.category}</span>
                    </td>
                    <td style={{ color: 'var(--gold-primary)', fontWeight: 600 }}>
                      {rule.city || 'Global Default'}
                    </td>
                    <td>
                      {rule.isFree ? (
                        <span className="badge badge-free">Free Tier</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Paid Only</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {rule.allowedPlans?.map((p) => (
                          <span key={p} className="badge badge-blue" style={{ fontSize: '0.7rem' }}>
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      {rule.enabled ? (
                        <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Check size={14} /> Active
                        </span>
                      ) : (
                        <span style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <X size={14} /> Disabled
                        </span>
                      )}
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
