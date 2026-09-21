import React from 'react';
import { BedDouble, Users, Sparkles, Utensils, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export const HotelDashboard = () => {
  const { currentUser } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div style={{ fontSize: '0.8rem', color: 'var(--gold-light)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Hotel Operations Portal
        </div>
        <h1 className="title-gold" style={{ fontSize: '1.8rem' }}>
          Property Performance Overview
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Real-time occupancy, guest service requests, dining orders, and folio settlements.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Occupancy</span>
            <BedDouble size={20} color="var(--gold-light)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff' }}>84%</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '4px' }}>Room 302 Active</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Today's Arrivals</span>
            <Users size={20} color="#60A5FA" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff' }}>1 Pending</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Contactless KYC submitted</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Guest Service Requests</span>
            <Sparkles size={20} color="#C084FC" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff' }}>Active</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--gold-light)', marginTop: '4px' }}>Geo & Free tier filtered</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Dining Revenue</span>
            <Utensils size={20} color="var(--success)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff' }}>₹4,250</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Auto-billed to guest folio</div>
        </div>
      </div>
    </div>
  );
};
