import React from 'react';
import { BedDouble, Users, Sparkles, Utensils, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export const HotelDashboard = () => {
  const { currentUser } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div style={{ fontSize: '0.72rem', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>
          Hotel Operations Portal
        </div>
        <h1 className="title-gold page-title" style={{ fontSize: '2.1rem', margin: '4px 0' }}>
          Property Performance Overview
        </h1>
        <p className="page-subtitle">
          Real-time occupancy, guest service requests, dining orders, and folio settlements.
        </p>
      </div>

      <div className="grid-kpi">
        <div className="glass-panel animate-fade-in" style={{ padding: '22px', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Occupancy</span>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'var(--gold-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BedDouble size={20} color="var(--gold-primary)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>84%</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--success)', marginTop: '4px', fontWeight: 500 }}>Room 302 Active</div>
        </div>

        <div className="glass-panel animate-fade-in" style={{ padding: '22px', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Today's Arrivals</span>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'var(--info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} color="var(--info)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>1 Pending</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Contactless KYC submitted</div>
        </div>

        <div className="glass-panel animate-fade-in" style={{ padding: '22px', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Guest Requests</span>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: '#F5EFFB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={20} color="#7C3AED" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Active</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--gold-primary)', marginTop: '4px', fontWeight: 500 }}>Geo & Free tier filtered</div>
        </div>

        <div className="glass-panel animate-fade-in" style={{ padding: '22px', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Dining Revenue</span>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Utensils size={20} color="var(--success)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>₹4,250</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Auto-billed to guest folio</div>
        </div>
      </div>
    </div>
  );
};

