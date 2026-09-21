import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';

export const WelcomePage = () => {
  const [bookingNumber, setBookingNumber] = useState('BK-DELHI-101');
  const [phone, setPhone] = useState('9876543210');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { verifyGuestOtp } = useAuth();
  const navigate = useNavigate();

  const handleDirectAccess = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await verifyGuestOtp(bookingNumber, '123456');
      navigate('/guest/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to access guest portal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'radial-gradient(circle at top, #141E38 0%, #070B19 100%)',
      }}
    >
      <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '36px 28px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'rgba(224, 169, 109, 0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gold-light)',
              marginBottom: '12px',
            }}
          >
            <KeyRound size={26} />
          </div>
          <h1 className="title-gold" style={{ fontSize: '1.6rem', marginBottom: '6px' }}>
            Aura Hospitality
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Contactless In-Stay Experience & Digital Pass
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#F87171',
              fontSize: '0.85rem',
              marginBottom: '20px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleDirectAccess} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Booking Reference
            </label>
            <input
              type="text"
              className="input-control"
              value={bookingNumber}
              onChange={(e) => setBookingNumber(e.target.value)}
              placeholder="e.g. BK-DELHI-101"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Registered Mobile Number
            </label>
            <input
              type="tel"
              className="input-control"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile number"
            />
          </div>

          <button type="submit" className="btn btn-gold" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? 'Entering Portal...' : 'Access My Stay Portal'} <ArrowRight size={16} />
          </button>
        </form>

        <div
          style={{
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-color)',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <ShieldCheck size={14} color="var(--gold-light)" /> 256-bit Encrypted Guest Session
        </div>
      </div>
    </div>
  );
};
