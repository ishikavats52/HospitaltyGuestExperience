import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, CheckCircle2, AlertCircle, Clock, ArrowRight, RefreshCw, XCircle } from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export const ServicesPage = () => {
  const { currentUser } = useAuth();
  const [hotelInfo, setHotelInfo] = useState(null);
  const [services, setServices] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const hotelId = currentUser?.hotelId?._id || currentUser?.hotelId || 'HOTEL-DELHI-01';
  const stayId = currentUser?.stay?._id || currentUser?.stayId;

  const fetchServicesAndRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/hotels/${hotelId}/services`);
      setHotelInfo(res.data.hotel);
      // Show all configured hotel services, retaining availability status
      setServices(res.data.services || []);

      // Fetch guest's own requests
      if (stayId) {
        try {
          const reqRes = await api.get(`/service-requests?stayId=${stayId}`);
          setMyRequests(reqRes.data || []);
        } catch (_) {}
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hotelId) {
      fetchServicesAndRequests();
    }
  }, [hotelId, stayId]);

  const handleRequestService = async (serviceId, serviceName, isAvailable) => {
    if (isAvailable === false) {
      setError(`"${serviceName}" is temporarily unavailable.`);
      setTimeout(() => setError(null), 3500);
      return;
    }

    try {
      setRequestingId(serviceId);
      setError(null);
      setMessage(null);

      const res = await api.post('/service-requests', {
        stayId,
        serviceCatalogueId: serviceId,
        guestNotes: 'Requested via Guest In-Stay Hub',
      });

      // Instantly notify Hotel Admin and Housekeeping / Front Desk staff across all active devices
      try {
        if (typeof window !== 'undefined') {
          const dispatchPayload = {
            type: 'SERVICE',
            requestId: res.data?._id,
            roomNumber: res.data?.roomNumber || 'Room Assigned',
            guestName: res.data?.guestName || 'In-Stay Guest',
            serviceName,
            category: res.data?.serviceCategory || 'Housekeeping',
            price: res.data?.price,
            timestamp: Date.now(),
          };
          localStorage.setItem('aura_last_dispatch_event', JSON.stringify(dispatchPayload));
          window.dispatchEvent(new CustomEvent('aura_live_dispatch', { detail: dispatchPayload }));
          if ('BroadcastChannel' in window) {
            const bc = new BroadcastChannel('hospitality_live_dispatches');
            bc.postMessage(dispatchPayload);
            bc.close();
          }
        }
      } catch (_) {}

      setMessage(`Request for "${serviceName}" placed successfully! Hotel staff notified.`);
      await fetchServicesAndRequests();
      setTimeout(() => setMessage(null), 4500);
    } catch (err) {
      setError(err.message || 'Service request failed. Please check with reception.');
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
          In-stay room amenities, housekeeping, and concierge services are activated upon check-in. Please submit your Aadhaar card and live photo to unlock facilities.
        </p>
        <Link
          to="/guest/checkin"
          className="btn btn-gold"
          style={{ padding: '12px 24px', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}
        >
          <span>Complete Check-In (Aadhaar & Photo)</span> <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <div style={{ fontSize: '0.7rem', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
          {hotelInfo?.name || 'Hotel Grand'}
        </div>
        <h2 className="title-gold page-title" style={{ fontSize: '1.9rem', margin: '4px 0' }}>
          Hotel Guest Services
        </h2>
        <p className="page-subtitle" style={{ margin: 0 }}>
          Request in-room amenities, housekeeping, and concierge assistance directly to your room.
        </p>
      </div>

      {message && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--success-bg)',
            border: '1px solid var(--border-active)',
            color: 'var(--gold-dark)',
            fontSize: '0.86rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} color="var(--gold-primary)" /> {message}
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--danger-bg)',
            border: '1px solid rgba(225, 29, 72, 0.25)',
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

      {/* Active Service Requests Tracker */}
      {myRequests.length > 0 && (
        <div className="glass-panel" style={{ padding: '16px 18px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            My Active Service Requests ({myRequests.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {myRequests.map((req) => (
              <div
                key={req._id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  background: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {req.serviceName || req.serviceCatalogueId?.name || 'Hotel Service'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Requested: {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <span className={`badge ${req.status === 'COMPLETED' ? 'badge-free' : 'badge-gold'}`}>
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          Loading available hotel services...
        </div>
      ) : services.length === 0 ? (
        <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)', backgroundColor: '#FFFFFF' }}>
          No services currently available for this property.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {services.map((item) => {
            const isAvail = item.isAvailable !== false;
            const isComp = item.isComplimentary || item.price === 0;

            return (
              <div
                key={item._id}
                className="glass-panel"
                style={{
                  padding: '18px',
                  backgroundColor: isAvail ? '#FFFFFF' : '#FAFAFA',
                  borderRadius: 'var(--radius-md)',
                  opacity: isAvail ? 1 : 0.85,
                  border: isAvail ? '1px solid var(--border-color)' : '1px dashed #E5E7EB',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ flex: '1 1 200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-primary)' }}>
                        {item.name}
                      </span>

                      {/* Availability Tag */}
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 7px',
                          borderRadius: '9999px',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          background: isAvail ? '#DCFCE7' : '#FEE2E2',
                          color: isAvail ? '#166534' : '#991B1B',
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: isAvail ? '#16A34A' : '#DC2626',
                          }}
                        />
                        {isAvail ? 'Available' : 'Unavailable'}
                      </span>

                      {/* Price Badge */}
                      {isComp ? (
                        <span className="badge badge-free">Complimentary</span>
                      ) : (
                        <span className="badge badge-gold">₹{item.price}</span>
                      )}
                    </div>

                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: '4px 0 0' }}>
                      {item.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                      <Clock size={13} color="var(--gold-primary)" /> Hours: {item.operatingHours?.open || '06:00'} - {item.operatingHours?.close || '23:00'}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRequestService(item._id, item.name, isAvail)}
                    className={isAvail ? 'btn btn-gold' : 'btn btn-outline'}
                    style={{
                      padding: '8px 18px',
                      fontSize: '0.82rem',
                      whiteSpace: 'nowrap',
                      alignSelf: 'flex-start',
                      cursor: isAvail ? 'pointer' : 'not-allowed',
                      opacity: isAvail ? 1 : 0.6,
                    }}
                    disabled={!isAvail || requestingId === item._id}
                    title={!isAvail ? 'This service is currently unavailable' : 'Request Service to Room'}
                  >
                    {requestingId === item._id ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <RefreshCw size={13} className="animate-spin" /> Placing Request...
                      </span>
                    ) : isAvail ? (
                      'Request Service'
                    ) : (
                      'Temporarily Unavailable'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
