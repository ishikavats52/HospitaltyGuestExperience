import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Utensils, Receipt, QrCode, Wifi, Clock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export const DashboardPage = () => {
  const { currentUser } = useAuth();
  const stay = currentUser?.stay;
  const booking = currentUser?.booking;

  const isCheckinCompleted = stay?.status === 'STAY_ACTIVE' || stay?.status === 'CHECKED_IN';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Welcome Luxury Hero Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(20, 30, 56, 0.9) 0%, rgba(13, 20, 36, 0.95) 100%)',
          borderColor: 'var(--border-active)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gold-light)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Current Accommodation
            </div>
            <h2 className="title-gold" style={{ fontSize: '1.4rem' }}>
              Room {stay?.roomId?.roomNumber || '302'}
            </h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {booking?.hotelId?.name || 'Hotel Grand Delhi'}
            </div>
          </div>
          <span className={`badge ${isCheckinCompleted ? 'badge-free' : 'badge-gold'}`}>
            {stay?.status || 'STAY_ACTIVE'}
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <Clock size={16} color="var(--gold-light)" /> Checkout: 11:00 AM
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <Wifi size={16} color="var(--gold-light)" /> WiFi: GrandGuest_5G
          </div>
        </div>
      </div>

      {/* Contactless Check-In Alert if not done */}
      {!isCheckinCompleted && (
        <div
          className="glass-panel"
          style={{
            padding: '18px',
            background: 'rgba(224, 169, 109, 0.1)',
            borderColor: 'var(--gold-light)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>
                Contactless Check-In Ready
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Upload ID and generate your digital pass to bypass the lobby queue.
              </div>
            </div>
            <Link to="/guest/checkin" className="btn btn-gold" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
              Check-In <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {/* Quick Action Grid */}
      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gold-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Guest In-Stay Services
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
        <Link
          to="/guest/services"
          className="glass-panel"
          style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            textDecoration: 'none',
            color: '#fff',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(224, 169, 109, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gold-light)',
            }}
          >
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Hotel Services</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Linen, Housekeeping, Concierge
            </div>
          </div>
        </Link>

        <Link
          to="/guest/dining"
          className="glass-panel"
          style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            textDecoration: 'none',
            color: '#fff',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(59, 130, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#60A5FA',
            }}
          >
            <Utensils size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>In-Room Dining</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Fresh artisan culinary dishes
            </div>
          </div>
        </Link>

        <Link
          to="/guest/bill"
          className="glass-panel"
          style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            textDecoration: 'none',
            color: '#fff',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34D399',
            }}
          >
            <Receipt size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>My Bill & Folio</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Live statement & settlement
            </div>
          </div>
        </Link>

        <Link
          to="/guest/qr-pass"
          className="glass-panel"
          style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            textDecoration: 'none',
            color: '#fff',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(168, 85, 247, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#C084FC',
            }}
          >
            <QrCode size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Digital QR Key</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Contactless pass & access
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};
