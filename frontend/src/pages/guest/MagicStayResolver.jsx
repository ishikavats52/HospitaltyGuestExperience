import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, AlertCircle, ArrowRight, Hotel, CheckCircle2 } from 'lucide-react';
import api from '../../services/api.js';

export const MagicStayResolver = () => {
  const { bookingRef } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);

  useEffect(() => {
    if (!bookingRef) {
      setError('No booking reference provided in link.');
      setLoading(false);
      return;
    }

    const resolveMagicLink = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get(`/bookings/magic/${encodeURIComponent(bookingRef.trim())}`);
        const data = res.data;

        // Auto authenticate guest (in isolated guest namespace)
        if (data.token) {
          localStorage.setItem('aura_guest_token', data.token);

          // Only set aura_token if no active admin session is present
          const existingAdminToken = localStorage.getItem('aura_admin_token');
          if (!existingAdminToken) {
            localStorage.setItem('aura_token', data.token);
          }

          if (data.guest) {
            const guestPayload = JSON.stringify({
              ...data.guest,
              role: 'GUEST',
              isGuest: true,
              stayId: data.stay?._id || data.booking?._id,
              stay: data.stay,
              booking: data.booking,
              bookingId: data.booking?._id,
              bookingNumber: data.booking?.bookingNumber,
              roomNumber: data.room?.roomNumber || data.booking?.roomNumber,
              isStayActive: data.isStayActive,
            });

            localStorage.setItem('aura_guest_user', guestPayload);
            if (!existingAdminToken) {
              localStorage.setItem('aura_user', guestPayload);
            }
          }
        }

        setBookingDetails(data);

        // Seamless transition after brief luxury welcome
        setTimeout(() => {
          if (data.redirectUrl) {
            navigate(data.redirectUrl, { replace: true });
          } else if (data.isStayActive) {
            navigate('/guest/dashboard', { replace: true });
          } else {
            navigate('/guest/checkin', { replace: true });
          }
        }, 1200);
      } catch (err) {
        setError(err.message || 'Invalid or expired magic link. Please check with the front desk.');
        setLoading(false);
      }
    };

    resolveMagicLink();
  }, [bookingRef, navigate]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: 'var(--bg-primary, #fbf7f4)',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: 'min(94vw, 460px)',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg, 16px)',
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.08)',
          border: '1px solid var(--border-color)',
          padding: '36px 28px',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'var(--gold-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gold-primary)',
            }}
          >
            <Hotel size={22} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            AURA HOSPITALITY
          </span>
        </div>

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                border: '3px solid var(--gold-soft)',
                borderTopColor: 'var(--gold-primary)',
                animation: 'spin 0.9s linear infinite',
              }}
            />
            <div>
              <h3 style={{ margin: '0 0 6px', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Accessing Your Stay Pass
              </h3>
              <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                Connecting booking <strong>{bookingRef}</strong>...
              </p>
            </div>
          </div>
        )}

        {!loading && bookingDetails && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', marginTop: '12px' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: 'var(--success-bg, rgba(28, 108, 67, 0.12))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--success, #1c6c43)',
              }}
            >
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Welcome, {bookingDetails.guest?.name || 'Guest'}!
              </h3>
              <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                Redirecting you to your seamless digital stay portal...
              </p>
            </div>
          </div>
        )}

        {!loading && error && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: 'rgba(186, 51, 51, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#BA3333',
              }}
            >
              <AlertCircle size={32} />
            </div>

            <div>
              <h3 style={{ margin: '0 0 6px', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Unable to Resolve Booking
              </h3>
              <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                {error}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px', width: '100%' }}>
              <Link
                to="/guest/welcome"
                className="btn btn-outline"
                style={{ flex: 1, padding: '10px', fontSize: '0.84rem', textDecoration: 'none' }}
              >
                Guest Sign-In
              </Link>
              <Link
                to="/staff/login"
                className="btn btn-gold"
                style={{ flex: 1, padding: '10px', fontSize: '0.84rem', textDecoration: 'none' }}
              >
                Staff Desk
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

