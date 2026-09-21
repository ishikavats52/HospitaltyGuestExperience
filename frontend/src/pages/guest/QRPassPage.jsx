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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '20px' }}>
      <div>
        <div style={{ fontSize: '0.75rem', color: 'var(--gold-light)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Contactless Arrival Pass
        </div>
        <h2 className="title-gold" style={{ fontSize: '1.4rem' }}>
          Digital Key & Check-In QR
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Present this secure pass at reception or contactless access kiosks.
        </p>
      </div>

      <div
        className="glass-panel"
        style={{
          padding: '28px',
          width: '100%',
          maxWidth: '340px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderColor: 'var(--border-active)',
        }}
      >
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
            {currentUser?.guestName || 'Aarav Mehta'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--gold-light)' }}>
            Booking: {currentUser?.booking?.bookingNumber || 'BK-DELHI-101'}
          </div>
        </div>

        {stayData?.qrPassUrl ? (
          <img
            src={stayData.qrPassUrl}
            alt="Digital Check-in Pass"
            style={{ width: '200px', height: '200px', borderRadius: '12px', border: '4px solid #fff' }}
          />
        ) : (
          <div
            style={{
              width: '200px',
              height: '200px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <QrCode size={80} color="var(--gold-light)" />
          </div>
        )}

        <div style={{ marginTop: '20px', width: '100%' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
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
              padding: '8px 0',
              fontSize: '0.85rem',
            }}
          >
            <span style={{ color: 'var(--text-secondary)' }}>Room Assigned</span>
            <span style={{ fontWeight: 600, color: '#fff' }}>
              Room {stayData?.roomId?.roomNumber || '302'}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <ShieldCheck size={16} color="var(--gold-light)" /> Cryptographic single-use token protected
      </div>
    </div>
  );
};
