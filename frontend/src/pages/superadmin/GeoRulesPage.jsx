import React, { useState, useEffect } from 'react';
import { Globe, Plus, Check, X, Sparkles, RefreshCw, ShieldCheck, CheckCircle2, Layers } from 'lucide-react';
import api from '../../services/api.js';

export const GeoRulesPage = () => {
  const [rules, setRules] = useState([]);
  const [catalogue, setCatalogue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCity, setFilterCity] = useState('ALL');

  // Form state for creating new rule
  const [selectedService, setSelectedService] = useState('');
  const [city, setCity] = useState('Delhi');
  const [isFree, setIsFree] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bulkDeploying, setBulkDeploying] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchRules = async () => {
    try {
      setLoading(true);
      const [rulesRes, catRes] = await Promise.all([
        api.get('/service-availability'),
        api.get('/service-catalogue'),
      ]);
      setRules(rulesRes.data || []);
      setCatalogue(catRes.data || []);
      if (catRes.data?.length > 0 && !selectedService) {
        setSelectedService(catRes.data[0]._id);
      }
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
        allowedPlans: isFree ? ['FREE', 'BASIC', 'PREMIUM'] : ['BASIC', 'PREMIUM'],
      });
      showToast(`Rule updated: ${city} service availability successfully configured.`);
      await fetchRules();
    } catch (err) {
      alert(err.message || 'Failed to save rule');
    } finally {
      setSaving(false);
    }
  };

  const handleEnableAllForCity = async (targetCity = 'ALL') => {
    setBulkDeploying(true);
    try {
      await api.post('/service-availability/enable-all', {
        city: targetCity,
        country: 'India',
        isFree: true,
        allowedPlans: ['FREE', 'BASIC', 'PREMIUM'],
      });
      showToast(
        targetCity === 'ALL'
          ? 'All services enabled for ALL geolocations under Free Subscription Tier!'
          : `All services enabled for ${targetCity} with Free Subscription entitlement!`
      );
      await fetchRules();
    } catch (err) {
      alert(err.message || 'Bulk deployment failed');
    } finally {
      setBulkDeploying(false);
    }
  };

  const handleToggleRuleStatus = async (rule) => {
    try {
      await api.post('/service-availability', {
        serviceId: rule.serviceId?._id || rule.serviceId,
        city: rule.city,
        country: rule.country || 'India',
        enabled: !rule.enabled,
        isFree: rule.isFree,
        allowedPlans: rule.allowedPlans,
      });
      await fetchRules();
    } catch (err) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleToggleFreeTier = async (rule) => {
    try {
      const nextFree = !rule.isFree;
      await api.post('/service-availability', {
        serviceId: rule.serviceId?._id || rule.serviceId,
        city: rule.city,
        country: rule.country || 'India',
        enabled: rule.enabled,
        isFree: nextFree,
        allowedPlans: nextFree ? ['FREE', 'BASIC', 'PREMIUM'] : ['BASIC', 'PREMIUM'],
      });
      showToast(`Entitlement updated: Service is now ${nextFree ? 'Free Tier Entitled' : 'Paid Plan Only'}.`);
      await fetchRules();
    } catch (err) {
      alert(err.message || 'Failed to toggle tier');
    }
  };

  const filteredRules = rules.filter((r) => {
    if (filterCity === 'ALL') return true;
    return (r.city || 'Global') === filterCity;
  });

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
            SaaS Central Governance
          </div>
          <h1 className="title-gold page-title" style={{ fontSize: '2.1rem', margin: '4px 0', letterSpacing: '-0.02em' }}>
            Geolocation Service Availability Matrix
          </h1>
          <p className="page-subtitle" style={{ margin: 0 }}>
            Centrally designate which guest amenities are active across cities and entitle them for Free Subscription by Hotel Admins.
          </p>
        </div>

        {/* 1-Click All Services Free Deployment */}
        <button
          type="button"
          onClick={() => handleEnableAllForCity('ALL')}
          disabled={bulkDeploying}
          className="btn btn-gold"
          style={{ padding: '12px 20px', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: 'var(--shadow-gold)' }}
        >
          {bulkDeploying ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <Sparkles size={16} />
          )}
          <span>{bulkDeploying ? 'Deploying Rules...' : 'Enable All Services for All Geolocations (Free Tier)'}</span>
        </button>
      </div>

      {/* Rule Creator */}
      <div className="glass-panel animate-fade-in" style={{ padding: 'clamp(16px, 3vw, 24px)', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} color="var(--gold-primary)" /> Configure Location Availability Rule
        </h3>

        <form onSubmit={handleCreateRule} className="grid-form-4">
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Service Catalogue Item
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
              Target Geolocation
            </label>
            <select className="input-control" value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="Delhi">Delhi (NCR)</option>
              <option value="Agra">Agra (Uttar Pradesh)</option>
              <option value="Jaipur">Jaipur (Rajasthan)</option>
              <option value="Mumbai">Mumbai (Maharashtra)</option>
              <option value="Global">Global Default (All Territories)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Subscription Tier Entitlement
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '10px 0' }}>
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
                style={{ accentColor: 'var(--gold-primary)' }}
              />
              <span style={{ fontSize: '0.86rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                Entitle for Free Subscription
              </span>
            </label>
          </div>

          <button type="submit" disabled={saving} className="btn btn-gold" style={{ height: '46px', width: '100%' }}>
            <Globe size={16} /> {saving ? 'Saving Rule...' : 'Deploy Policy'}
          </button>
        </form>
      </div>

      {/* Rules Table with City Filter */}
      <div className="glass-panel animate-fade-in" style={{ padding: 'clamp(16px, 3vw, 24px)', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Active Location Availability Policies ({filteredRules.length})
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Rules enforce which services hotel admins can activate for guests.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Filter Territory:</span>
            <select
              className="input-control"
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              style={{ width: '150px', padding: '6px 10px', fontSize: '0.82rem' }}
            >
              <option value="ALL">All Territories</option>
              <option value="Delhi">Delhi</option>
              <option value="Agra">Agra</option>
              <option value="Jaipur">Jaipur</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Global">Global Default</option>
            </select>
          </div>
        </div>

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
                  <th>City / Geolocation</th>
                  <th>Subscription Entitlement</th>
                  <th>Allowed Plans</th>
                  <th>Status</th>
                  <th>Quick Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRules.map((rule) => (
                  <tr key={rule._id}>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {rule.serviceId?.name || 'Master Service'}
                    </td>
                    <td>
                      <span className="badge badge-gold">{rule.serviceId?.category || 'SERVICE'}</span>
                    </td>
                    <td style={{ color: 'var(--gold-primary)', fontWeight: 600 }}>
                      {rule.city || 'Global Default'}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleToggleFreeTier(rule)}
                        className={`badge ${rule.isFree ? 'badge-free' : 'badge-gold'}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                        title="Click to toggle Free vs Paid tier"
                      >
                        {rule.isFree ? 'Free Tier Entitled' : 'Paid Add-On Only'}
                      </button>
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
                        <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, fontSize: '0.82rem' }}>
                          <Check size={14} /> Active
                        </span>
                      ) : (
                        <span style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, fontSize: '0.82rem' }}>
                          <X size={14} /> Disabled
                        </span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleToggleRuleStatus(rule)}
                        className="btn btn-outline"
                        style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                      >
                        {rule.enabled ? 'Disable' : 'Enable'}
                      </button>
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
