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
        <div style={{ fontSize: '0.8rem', color: 'var(--gold-light)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          SaaS Core Governance
        </div>
        <h1 className="title-gold" style={{ fontSize: '1.8rem' }}>
          Geolocation Service Availability Matrix
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Centrally control which guest services are available in specific cities/locations, and designate Free Subscription entitlements.
        </p>
      </div>

      {/* Rule Creator */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} color="var(--gold-light)" /> Configure Location Availability Rule
        </h3>

        <form onSubmit={handleCreateRule} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
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
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
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
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Free Subscription Tier
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '10px 0' }}>
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
              />
              <span style={{ fontSize: '0.85rem', color: '#fff' }}>Include in Free Tier</span>
            </label>
          </div>

          <button type="submit" disabled={saving} className="btn btn-gold" style={{ height: '45px' }}>
            <Globe size={16} /> {saving ? 'Saving...' : 'Deploy Rule'}
          </button>
        </form>
      </div>

      {/* Rules Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>
          Active Location & Subscription Rules
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            Loading availability matrix...
          </div>
        ) : (
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
                  <td style={{ fontWeight: 600, color: '#fff' }}>
                    {rule.serviceId?.name || 'Master Service'}
                  </td>
                  <td>
                    <span className="badge badge-gold">{rule.serviceId?.category}</span>
                  </td>
                  <td style={{ color: 'var(--gold-light)' }}>
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
                    <div style={{ display: 'flex', gap: '4px' }}>
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
        )}
      </div>
    </div>
  );
};
