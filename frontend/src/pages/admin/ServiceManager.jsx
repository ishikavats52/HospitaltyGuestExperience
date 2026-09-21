import React, { useState, useEffect } from 'react';
import { Sparkles, Save, Check, Power, DollarSign } from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export const ServiceManager = () => {
  const { currentUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const hotelId = currentUser?.hotelId?._id || currentUser?.hotelId;

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/hotels/${hotelId}/services`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load hotel services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hotelId) fetchServices();
  }, [hotelId]);

  const handleUpdateConfig = async (serviceId, currentConfig, updates) => {
    setSavingId(serviceId);
    setSuccessMsg(null);
    try {
      await api.patch(`/hotels/${hotelId}/services/${serviceId}`, {
        ...currentConfig,
        ...updates,
      });
      setSuccessMsg('Service configuration saved successfully');
      await fetchServices();
    } catch (err) {
      alert(err.message || 'Failed to update service');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div style={{ fontSize: '0.8rem', color: 'var(--gold-light)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Hotel Operations Management
        </div>
        <h1 className="title-gold" style={{ fontSize: '1.8rem' }}>
          Eligible Hotel Services
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Services available to your property based on location ({data?.hotel?.location?.city || 'Delhi'}) and subscription ({data?.planCode || 'FREE'}). Enable and set guest pricing below.
        </p>
      </div>

      {successMsg && (
        <div style={{ padding: '12px 16px', background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={18} /> {successMsg}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          Retrieving location-eligible services...
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Category</th>
                <th>SaaS Geo Entitlement</th>
                <th>Guest Offering Status</th>
                <th>Guest Price (₹)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.services?.map(({ serviceCatalogue, isFreeEntitlement, hotelConfig }) => (
                <tr key={serviceCatalogue._id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{serviceCatalogue.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{serviceCatalogue.description}</div>
                  </td>
                  <td>
                    <span className="badge badge-gold">{serviceCatalogue.category}</span>
                  </td>
                  <td>
                    {isFreeEntitlement ? (
                      <span className="badge badge-free">Free Subscription</span>
                    ) : (
                      <span className="badge badge-blue">Paid Add-on</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() =>
                        handleUpdateConfig(serviceCatalogue._id, hotelConfig, {
                          enabled: !hotelConfig.enabled,
                        })
                      }
                      className={`btn ${hotelConfig.enabled ? 'btn-gold' : 'btn-outline'}`}
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      disabled={savingId === serviceCatalogue._id}
                    >
                      <Power size={14} /> {hotelConfig.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </td>
                  <td>
                    <input
                      type="number"
                      className="input-control"
                      style={{ width: '100px', padding: '6px 10px', fontSize: '0.85rem' }}
                      value={hotelConfig.price || 0}
                      onChange={(e) => {
                        const newPrice = Number(e.target.value);
                        hotelConfig.price = newPrice;
                        setData({ ...data });
                      }}
                      onBlur={() =>
                        handleUpdateConfig(serviceCatalogue._id, hotelConfig, {
                          price: hotelConfig.price,
                        })
                      }
                      disabled={isFreeEntitlement}
                    />
                  </td>
                  <td>
                    <button
                      onClick={() => handleUpdateConfig(serviceCatalogue._id, hotelConfig, {})}
                      className="btn btn-outline"
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      disabled={savingId === serviceCatalogue._id}
                    >
                      <Save size={14} /> {savingId === serviceCatalogue._id ? 'Saving...' : 'Save'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
