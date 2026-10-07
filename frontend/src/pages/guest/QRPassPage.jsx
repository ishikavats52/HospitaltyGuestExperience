import React, { useEffect, useState } from 'react';
import { QrCode, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';

export const QRPassPage = () => {
  const { currentUser } = useAuth();
  const [stayData, setStayData] = useState(currentUser?.stay);
  const stayId = currentUser?.stay?._id || currentUser?.stayId || (typeof currentUser?.stay === 'string' ? currentUser?.stay : null);

  useEffect(() => {
    const fetchStay = async () => {
      try {
        if (stayId) {
          const res = await api.get(`/stays/${stayId}`);
          setStayData(res.data);
        }
      } catch (err) {
        console.warn('Failed to refresh stay details:', err.message);
      }
    };
    fetchStay();
  }, [stayId]);

  const isCheckedIn = stayData?.status === 'CHECKED_IN' || stayData?.status === 'STAY_ACTIVE';

  if (!isCheckedIn) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px 16px', gap: '16px', width: '100%' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--gold-soft)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-primary)' }}>
          <QrCode size={30} />
        </div>
        <h2 className="title-gold" style={{ fontSize: '1.6rem', margin: 0 }}>
          Digital Key Requires Check-In
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '420px', lineHeight: 1.5 }}>
          Your digital suite key pass and QR room access code will be cryptographically generated once your contactless check-in with Aadhaar and selfie is submitted.
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '20px', width: '100%' }}>
      <div>
        <div style={{ fontSize: '0.7rem', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>
          Contactless Arrival Pass
        </div>
        <h2 className="title-gold page-title" style={{ fontSize: '1.9rem', margin: '4px 0' }}>
          Digital Key & Check-In QR
        </h2>
        <p className="page-subtitle">
          Present this secure pass at reception or contactless access kiosks.
        </p>
      </div>

      <div
        className="glass-panel animate-fade-in"
        style={{
          padding: 'clamp(20px, 4vw, 28px)',
          width: '100%',
          maxWidth: '340px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          borderColor: 'var(--border-active)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ marginBottom: '16px' }}>
          <div className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {currentUser?.guestName || 'Aarav Mehta'}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--gold-primary)', fontWeight: 500 }}>
            Booking: {currentUser?.booking?.bookingNumber || 'BK-DELHI-101'}
          </div>
        </div>

        {stayData?.qrPassUrl ? (
          <img
            src={stayData.qrPassUrl}
            alt="Digital Check-in Pass"
            style={{ width: '100%', maxWidth: '200px', height: 'auto', aspectRatio: '1/1', borderRadius: '12px', border: '3px solid var(--border-color)', boxShadow: 'var(--shadow-xs)' }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              maxWidth: '200px',
              aspectRatio: '1/1',
              height: 'auto',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <QrCode size={80} color="var(--gold-primary)" />
          </div>
        )}

        <div style={{ marginTop: '20px', width: '100%' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 0',
              borderBottom: '1px solid var(--border-subtle)',
              fontSize: '0.85rem',
            }}
          >
            <span style={{ color: 'var(--text-secondary)' }}>Status</span>
            <span className="badge badge-free" style={{ textTransform: 'capitalize' }}>
              {stayData?.status || 'Active'}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 0',
              fontSize: '0.85rem',
            }}
          >
            <span style={{ color: 'var(--text-secondary)' }}>Room Assigned</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              Room {stayData?.roomId?.roomNumber || '302'}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        <ShieldCheck size={16} color="var(--gold-primary)" /> Cryptographic single-use token protected
      </div>
    </div>
  );
};
