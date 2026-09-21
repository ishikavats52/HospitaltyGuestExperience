import React, { useState, useEffect } from 'react';
import { Sparkles, Check, Clock, AlertCircle } from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export const ServicesPage = () => {
  const { currentUser } = useAuth();
  const [services, setServices] = useState([]);
  const [hotelInfo, setHotelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const hotelId = currentUser?.hotelId || currentUser?.stay?.hotelId || currentUser?.booking?.hotelId?._id || currentUser?.booking?.hotelId;
  const stayId = currentUser?.stay?._id || currentUser?.stayId || (typeof currentUser?.stay === 'string' ? currentUser?.stay : null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/hotels/${hotelId}/services`);
        setHotelInfo(res.data.hotel);
        // Only show services that are enabled by Hotel Admin
        const enabledServices = res.data.services.filter((s) => s.hotelConfig.enabled);
        setServices(enabledServices);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (hotelId) {
      fetchServices();
    }
  }, [hotelId]);

  const handleRequestService = async (serviceCatalogueId, serviceName) => {
    try {
      setRequestingId(serviceCatalogueId);
      setError(null);
      setMessage(null);

      const res = await api.post('/service-requests', {
        stayId,
        serviceCatalogueId,
        guestNotes: 'Requested via Guest PWA',
      });

      setMessage(`Request for "${serviceName}" placed successfully! Service team notified.`);
    } catch (err) {
      setError(err.message || 'Service request failed');
    } finally {
      setRequestingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <div style={{ fontSize: '0.75rem', color: 'var(--gold-light)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {hotelInfo?.name || 'Hotel Grand Delhi'} • {hotelInfo?.location?.city || 'Delhi'}
        </div>
        <h2 className="title-gold" style={{ fontSize: '1.4rem' }}>
          Available Guest Services
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Curated amenities based on your hotel's location and active subscription entitlements.
        </p>
      </div>

      {message && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34D399',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Check size={18} /> {message}
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#F87171',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          Evaluating 5-Tier Location & Plan Availability...
        </div>
      ) : services.length === 0 ? (
        <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No services currently enabled for this location.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {services.map(({ serviceCatalogue, isFreeEntitlement, hotelConfig }) => (
            <div key={serviceCatalogue._id} className="glass-panel" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, paddingRight: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, fontSize: '1rem', color: '#fff' }}>
                      {serviceCatalogue.name}
                    </span>
                    {isFreeEntitlement || hotelConfig.isComplimentary ? (
                      <span className="badge badge-free">Complimentary</span>
                    ) : (
                      <span className="badge badge-gold">₹{hotelConfig.price}</span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {serviceCatalogue.description}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                    <Clock size={12} /> Hours: {hotelConfig.operatingHours?.open} - {hotelConfig.operatingHours?.close}
                  </div>
                </div>

                <button
                  onClick={() => handleRequestService(serviceCatalogue._id, serviceCatalogue.name)}
                  className="btn btn-gold"
                  style={{ padding: '8px 14px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                  disabled={requestingId === serviceCatalogue._id}
                >
                  {requestingId === serviceCatalogue._id ? 'Requesting...' : 'Request'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
