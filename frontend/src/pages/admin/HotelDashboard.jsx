import React, { useState, useEffect } from 'react';
import { BedDouble, Users, Sparkles, Utensils, Building2, ShieldCheck, Mail, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';

export const HotelDashboard = () => {
  const { currentUser } = useAuth();
  const [hotelInfo, setHotelInfo] = useState(null);

  useEffect(() => {
    const fetchHotel = async () => {
      if (currentUser?.hotelId) {
        try {
          const res = await api.get(`/hotels/${currentUser.hotelId}`);
          setHotelInfo(res.data);
        } catch (_) {}
      }
    };
    fetchHotel();
  }, [currentUser?.hotelId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome & Tenant Banner */}
      <div
        className="glass-panel animate-fade-in"
        style={{
          padding: '24px 28px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-active)',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF7F2 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-free" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              HOTEL ADMIN SESSION ACTIVE
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Verified Credentials Access
            </span>
          </div>
          <h1 className="title-gold" style={{ fontSize: '1.9rem', margin: '4px 0 6px 0', color: 'var(--text-primary)' }}>
            Welcome, {currentUser?.name || 'Hotel Administrator'}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={16} color="var(--gold-primary)" />
              <span>
                Tenant:{' '}
                <strong style={{ color: 'var(--text-primary)' }}>
                  {hotelInfo?.name || 'Hotel Grand Operations'}
                </strong>
                {hotelInfo?.locationHierarchy?.city ? ` (${hotelInfo.locationHierarchy.city})` : ''}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={15} color="var(--gold-primary)" />
              <span>{currentUser?.email}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/admin/services" className="btn btn-gold" style={{ fontSize: '0.85rem', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Manage Services</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
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
