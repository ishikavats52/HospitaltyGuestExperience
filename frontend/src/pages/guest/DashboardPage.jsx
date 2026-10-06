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
              Room {stay?.roomId?.roomNumber || '302'}
            </h2>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              {booking?.hotelId?.name || 'Hotel Grand Delhi'}
            </div>
          </div>
          <span
            className="badge"
            style={{
              backgroundColor: isCheckinCompleted ? 'var(--secondary-soft)' : 'var(--gold-soft)',
              color: isCheckinCompleted ? 'var(--secondary-accent)' : 'var(--gold-primary)',
              border: `1px solid ${isCheckinCompleted ? 'var(--secondary-accent)' : 'var(--border-active)'}`,
            }}
          >
            {stay?.status || 'STAY_ACTIVE'}
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

      {/* Contactless Check-In Alert if not done */}
      {!isCheckinCompleted && (
        <div
          className="glass-panel"
          style={{
            padding: '18px 20px',
            background: 'var(--gold-soft)',
            borderColor: 'var(--border-active)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ flex: '1 1 200px' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.98rem' }}>
                Contactless Check-In Ready
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Upload ID and generate your digital pass to bypass the lobby queue.
              </div>
            </div>
            <Link to="/guest/checkin" className="btn btn-gold" style={{ padding: '8px 16px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
              Check-In <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {/* Quick Action Grid */}
      <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '6px' }}>
        Guest In-Stay Services
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '14px' }}>
        <Link
          to="/guest/services"
          className="glass-panel"
          style={{
            padding: '22px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            textDecoration: 'none',
            color: 'var(--text-primary)',
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
          }}
        >
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
        </Link>

        <Link
          to="/guest/dining"
          className="glass-panel"
          style={{
            padding: '22px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            textDecoration: 'none',
            color: 'var(--text-primary)',
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
          }}
        >
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
        </Link>

        <Link
          to="/guest/bill"
          className="glass-panel"
          style={{
            padding: '22px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            textDecoration: 'none',
            color: 'var(--text-primary)',
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
          }}
        >
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
        </Link>

        <Link
          to="/guest/qr-pass"
          className="glass-panel"
          style={{
            padding: '22px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            textDecoration: 'none',
            color: 'var(--text-primary)',
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
          }}
        >
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
        </Link>
      </div>
    </div>
  );
};
