import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  Utensils,
  Receipt,
  QrCode,
  Wifi,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  LogOut,
  AlertCircle,
  X,
  FileCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';

export const DashboardPage = () => {
  const { currentUser, refreshSession } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [liveStay, setLiveStay] = useState(currentUser?.stay);
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [lockedServiceName, setLockedServiceName] = useState('');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(
    searchParams.get('checkinCompleted') ? 'Contactless Check-In Verified! All room services unlocked.' : null
  );

  const stay = liveStay || currentUser?.stay;
  const booking = currentUser?.booking;
  const stayId = stay?._id || currentUser?.stayId;

  // Real-time status determination
  const isCheckedIn = stay?.status === 'CHECKED_IN' || stay?.status === 'STAY_ACTIVE';
  const isCheckedOut = stay?.status === 'CHECKED_OUT';
  const isPendingCheckin = !isCheckedIn && !isCheckedOut;

  // Auto sync live stay from server on mount
  useEffect(() => {
    const fetchLatestStay = async () => {
      if (stayId && stayId !== 'default-stay') {
        try {
          const res = await api.get(`/stays/${stayId}`);
          if (res.data) setLiveStay(res.data);
        } catch (_) {}
      }
    };
    fetchLatestStay();
  }, [stayId]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleServiceClick = (e, serviceTitle, path) => {
    if (isPendingCheckin) {
      e.preventDefault();
      setLockedServiceName(serviceTitle);
      setShowLockedModal(true);
    } else {
      navigate(path);
    }
  };

  const handleExecuteCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const res = await api.post('/checkin/checkout', {
        stayId: stay?._id || stayId || 'default-stay',
      });
      setLiveStay(res.data.stay || { ...stay, status: 'CHECKED_OUT' });
      if (refreshSession) {
        await refreshSession();
      }
      setShowCheckoutModal(false);
      setToastMessage('Express Check-Out Completed! Thank you for staying with us.');
    } catch (err) {
      alert(err.message || 'Check-out request failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: 'var(--text-primary)',
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

      {/* Welcome Luxury Hero Banner */}
      <div
        className="glass-panel animate-fade-in"
        style={{
          padding: '26px 22px',
          background: 'linear-gradient(135deg, #FFFFFF 0%, var(--gold-soft) 100%)',
          borderColor: 'var(--border-active)',
          boxShadow: 'var(--shadow-md)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
              Current Accommodation
            </div>
            <h2 className="title-gold page-title" style={{ fontSize: '1.9rem', margin: '4px 0' }}>
              Room {stay?.roomId?.roomNumber || stay?.room?.roomNumber || '302'}
            </h2>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              {booking?.hotelId?.name || 'Hotel Grand Delhi'}
            </div>
          </div>

          {/* Dynamic Status Pill */}
          <span
            className="badge"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: isCheckedIn
                ? 'var(--success-bg)'
                : isCheckedOut
                ? 'var(--bg-secondary)'
                : 'var(--warning-bg, #FEF3C7)',
              color: isCheckedIn
                ? 'var(--success)'
                : isCheckedOut
                ? 'var(--text-muted)'
                : 'var(--warning, #D97706)',
              border: `1px solid ${
                isCheckedIn
                  ? 'rgba(16, 185, 129, 0.3)'
                  : isCheckedOut
                  ? 'var(--border-color)'
                  : 'rgba(217, 119, 6, 0.3)'
              }`,
            }}
          >
            {isCheckedIn ? (
              <>
                <CheckCircle2 size={13} /> CHECKED IN
              </>
            ) : isCheckedOut ? (
              <>
                <FileCheck size={13} /> CHECKED OUT
              </>
            ) : (
              <>
                <AlertCircle size={13} /> CHECK-IN PENDING
              </>
            )}
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
            gap: '12px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <Clock size={16} color="var(--gold-primary)" /> Checkout: 11:00 AM
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <Wifi size={16} color="var(--secondary-accent)" /> WiFi: GrandGuest_5G
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CASE A: PENDING CHECK-IN BANNER                               */}
      {/* ------------------------------------------------------------- */}
      {isPendingCheckin && (
        <div
          className="glass-panel animate-fade-in"
          style={{
            padding: '20px 22px',
            background: 'linear-gradient(135deg, #FFFDF8 0%, #FEF9EE 100%)',
            borderColor: 'var(--border-active)',
            borderWidth: '1.5px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ flex: '1 1 240px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge" style={{ background: 'var(--gold-soft)', color: 'var(--gold-dark)', fontSize: '0.72rem', padding: '3px 8px' }}>
                  STEP 1 OF 1
                </span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>
                  Contactless Check-In Required
                </span>
              </div>
              <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                Upload your Aadhaar card and live selfie to verify your reservation and immediately activate your room amenities and dining facilities.
              </div>
            </div>
            <Link
              to="/guest/checkin"
              className="btn btn-gold"
              style={{ padding: '10px 20px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: 'var(--shadow-sm)' }}
            >
              <span>Complete Check-In</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CASE B: CHECKED-IN ACTIVE STAY (CONVERTED TO CHECK-OUT!)      */}
      {/* ------------------------------------------------------------- */}
      {isCheckedIn && (
        <div
          className="glass-panel animate-fade-in"
          style={{
            padding: '20px 22px',
            background: 'linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)',
            borderColor: 'rgba(16, 185, 129, 0.35)',
            borderWidth: '1.5px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ flex: '1 1 240px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-free" style={{ fontSize: '0.72rem', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={12} /> Aadhaar Verified KYC
                </span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>
                  Room 302 Active & Verified
                </span>
              </div>
              <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                Contactless check-in complete. All hotel services, dining orders, and your digital key pass are fully operational.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowCheckoutModal(true)}
              className="btn btn-outline"
              style={{
                padding: '10px 18px',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderColor: 'var(--text-secondary)',
                color: 'var(--text-primary)',
              }}
            >
              <LogOut size={15} />
              <span>Express Check-Out</span>
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CASE C: CHECKED-OUT DEPARTURE STATE                           */}
      {/* ------------------------------------------------------------- */}
      {isCheckedOut && (
        <div
          className="glass-panel animate-fade-in"
          style={{
            padding: '20px 22px',
            background: 'linear-gradient(135deg, #FAF7F2 0%, #F5EFEB 100%)',
            borderColor: 'var(--border-color)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>
                Thank You for Staying With Us
              </div>
              <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Your departure from Room 302 has been finalized. We hope you had an exceptional hospitality experience.
              </div>
            </div>
            <Link to="/guest/bill" className="btn btn-gold" style={{ padding: '9px 18px', fontSize: '0.85rem' }}>
              <span>View Final Folio</span>
            </Link>
          </div>
        </div>
      )}

      {/* Quick Action Grid */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
            Guest In-Stay Services
          </h3>
          {isPendingCheckin && (
            <span style={{ fontSize: '0.74rem', color: 'var(--warning, #D97706)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <Lock size={12} /> Services Locked Until Check-In
            </span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '14px' }}>
          {/* Hotel Services */}
          <div
            onClick={(e) => handleServiceClick(e, 'Hotel Services', '/guest/services')}
            className="glass-panel"
            style={{
              padding: '22px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              position: 'relative',
              opacity: isPendingCheckin ? 0.8 : 1,
              transition: 'all 0.2s ease',
            }}
          >
            {isPendingCheckin && (
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Lock size={10} /> Locked
              </div>
            )}
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--secondary-soft)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--secondary-accent)',
              }}
            >
              <Sparkles size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.96rem', color: 'var(--text-primary)' }}>Hotel Services</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                Linen, Housekeeping, Concierge
              </div>
            </div>
          </div>

          {/* In-Room Dining */}
          <div
            onClick={(e) => handleServiceClick(e, 'In-Room Dining', '/guest/dining')}
            className="glass-panel"
            style={{
              padding: '22px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              position: 'relative',
              opacity: isPendingCheckin ? 0.8 : 1,
              transition: 'all 0.2s ease',
            }}
          >
            {isPendingCheckin && (
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Lock size={10} /> Locked
              </div>
            )}
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--gold-soft)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--gold-primary)',
              }}
            >
              <Utensils size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.96rem', color: 'var(--text-primary)' }}>In-Room Dining</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                Fresh artisan culinary dishes
              </div>
            </div>
          </div>

          {/* My Bill & Folio */}
          <div
            onClick={(e) => handleServiceClick(e, 'My Bill & Folio', '/guest/bill')}
            className="glass-panel"
            style={{
              padding: '22px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              position: 'relative',
              opacity: isPendingCheckin ? 0.8 : 1,
              transition: 'all 0.2s ease',
            }}
          >
            {isPendingCheckin && (
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Lock size={10} /> Locked
              </div>
            )}
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--success-bg)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--success)',
              }}
            >
              <Receipt size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.96rem', color: 'var(--text-primary)' }}>My Bill & Folio</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                Live statement & settlement
              </div>
            </div>
          </div>

          {/* Digital QR Key */}
          <div
            onClick={(e) => handleServiceClick(e, 'Digital QR Key', '/guest/qr-pass')}
            className="glass-panel"
            style={{
              padding: '22px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              position: 'relative',
              opacity: isPendingCheckin ? 0.8 : 1,
              transition: 'all 0.2s ease',
            }}
          >
            {isPendingCheckin && (
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Lock size={10} /> Locked
              </div>
            )}
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--info-bg)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--info)',
              }}
            >
              <QrCode size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.96rem', color: 'var(--text-primary)' }}>Digital QR Key</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                Contactless pass & access
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: Check-In Required Warning                              */}
      {/* ------------------------------------------------------------- */}
      {showLockedModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '16px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            className="glass-panel animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-xl)',
              padding: '28px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'var(--gold-soft)',
                color: 'var(--gold-dark)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <Lock size={28} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Check-In Required for {lockedServiceName}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '22px' }}>
              To access room services, in-room dining, and your digital key pass, you must complete your quick contactless check-in with your Aadhaar card and selfie.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setShowLockedModal(false);
                  navigate('/guest/checkin');
                }}
                className="btn btn-gold"
                style={{ width: '100%', padding: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <span>Complete Check-In (Aadhaar & Selfie)</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => setShowLockedModal(false)}
                className="btn btn-outline"
                style={{ width: '100%', padding: '10px', fontSize: '0.85rem' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: Express Check-Out Confirmation                         */}
      {/* ------------------------------------------------------------- */}
      {showCheckoutModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '16px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            className="glass-panel animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-xl)',
              padding: '28px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'var(--info-bg)',
                color: 'var(--info)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <LogOut size={28} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Confirm Express Check-Out
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
              Are you ready to depart from <strong>Room {stay?.roomId?.roomNumber || '302'}</strong>? Your digital key will be released and your stay marked as checked out.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                disabled={checkoutLoading}
                onClick={handleExecuteCheckout}
                className="btn btn-gold"
                style={{ width: '100%', padding: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {checkoutLoading ? 'Processing Departure...' : 'Confirm & Check-Out'}
              </button>

              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="btn btn-outline"
                style={{ width: '100%', padding: '10px', fontSize: '0.85rem' }}
              >
                Stay in Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
