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

    } catch (err) {
      setError(err.message || 'Service request failed');
    } finally {
      setRequestingId(null);
    }
  };

  const isCheckedIn = currentUser?.stay?.status === 'CHECKED_IN' || currentUser?.stay?.status === 'STAY_ACTIVE';

  if (!isCheckedIn) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px 16px', gap: '16px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--gold-soft)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-primary)' }}>
          <AlertCircle size={32} />
        </div>
        <h2 className="title-gold" style={{ fontSize: '1.6rem', margin: 0 }}>
          Check-In Required for Services
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '420px', lineHeight: 1.5 }}>
          In-stay room amenities, housekeeping, and concierge services are activated upon check-in. Please upload your Aadhaar card and live selfie to unlock facilities.
        </p>
        <button
          type="button"
          onClick={() => window.location.href = '/guest/checkin'}
          className="btn btn-gold"
          style={{ padding: '12px 24px', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}
        >
          <span>Complete Check-In (Aadhaar & Selfie)</span>
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <div style={{ fontSize: '0.7rem', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>
          {hotelInfo?.name || 'Hotel Grand Delhi'} • {hotelInfo?.location?.city || 'Delhi'}
        </div>
        <h2 className="title-gold page-title" style={{ fontSize: '1.9rem', margin: '4px 0' }}>
          Available Guest Services
        </h2>
        <p className="page-subtitle">
          Curated amenities based on your hotel's location and active subscription entitlements.
        </p>
      </div>

      {message && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--success-bg)',
            border: '1px solid rgba(28, 108, 67, 0.25)',
            color: 'var(--success)',
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
            background: 'var(--danger-bg)',
            border: '1px solid rgba(186, 51, 51, 0.25)',
            color: 'var(--danger)',
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
        <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)', backgroundColor: '#FFFFFF' }}>
          No services currently enabled for this location.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {services.map(({ serviceCatalogue, isFreeEntitlement, hotelConfig }) => (
            <div key={serviceCatalogue._id} className="glass-panel" style={{ padding: '18px', backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.98rem', color: 'var(--text-primary)' }}>
                      {serviceCatalogue.name}
                    </span>
                    {isFreeEntitlement || hotelConfig.isComplimentary ? (
                      <span className="badge badge-free">Complimentary</span>
                    ) : (
                      <span className="badge badge-gold">₹{hotelConfig.price}</span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    {serviceCatalogue.description}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                    <Clock size={13} color="var(--gold-primary)" /> Hours: {hotelConfig.operatingHours?.open} - {hotelConfig.operatingHours?.close}
                  </div>
                </div>

                <button
                  onClick={() => handleRequestService(serviceCatalogue._id, serviceCatalogue.name)}
                  className="btn btn-gold"
                  style={{ padding: '8px 16px', fontSize: '0.82rem', whiteSpace: 'nowrap', alignSelf: 'flex-start' }}
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
