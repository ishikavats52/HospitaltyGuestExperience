import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, BedDouble, Utensils, Sparkles, Star } from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export const ReportsPage = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalGuests: 12,
    occupancyRate: 85,
    diningRevenue: 14850,
    servicesRevenue: 4200,
    roomRevenue: 54000,
    avgRating: 4.9,
  });

  const totalRevenue = stats.roomRevenue + stats.diningRevenue + stats.servicesRevenue;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: '0.72rem', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
          Executive Analytics
        </div>
        <h1 className="title-gold page-title" style={{ fontSize: '2.1rem', margin: '4px 0', letterSpacing: '-0.02em' }}>
          Hotel Operations & Revenue Reports
        </h1>
        <p className="page-subtitle" style={{ margin: 0 }}>
          Performance metrics, room occupancy rates, folio billing summaries, and contactless guest satisfaction.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid-kpi">
        <div className="glass-panel" style={{ padding: '22px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Gross Revenue</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--gold-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-primary)' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            ₹{totalRevenue.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '4px', fontWeight: 600 }}>
            +18.4% vs last period
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '22px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Current Occupancy</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--gold-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-primary)' }}>
              <BedDouble size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {stats.occupancyRate}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--gold-primary)', marginTop: '4px', fontWeight: 600 }}>
            High season peak performance
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '22px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Culinary Dining Sales</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--gold-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-primary)' }}>
              <Utensils size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            ₹{stats.diningRevenue.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            28 completed room service orders
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '22px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Guest Satisfaction</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--gold-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-primary)' }}>
              <Star size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {stats.avgRating} / 5.0
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '4px', fontWeight: 600 }}>
            99.2% contactless check-in satisfaction
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="glass-panel animate-fade-in" style={{ padding: 'clamp(16px, 3vw, 24px)', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
          Departmental Revenue Contribution
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', fontWeight: 600, marginBottom: '6px' }}>
              <span>Room Accommodations (Base Rates)</span>
              <span>₹{stats.roomRevenue.toLocaleString()} (74%)</span>
            </div>
            <div style={{ width: '100%', height: '10px', background: 'var(--bg-tertiary)', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ width: '74%', height: '100%', background: 'var(--gold-primary)', borderRadius: '9999px' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', fontWeight: 600, marginBottom: '6px' }}>
              <span>In-Room Dining & Culinary Orders</span>
              <span>₹{stats.diningRevenue.toLocaleString()} (20%)</span>
            </div>
            <div style={{ width: '100%', height: '10px', background: 'var(--bg-tertiary)', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ width: '20%', height: '100%', background: 'var(--gold-light)', borderRadius: '9999px' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', fontWeight: 600, marginBottom: '6px' }}>
              <span>Paid Guest Services & Amenities (Airport, Spa, Tours)</span>
              <span>₹{stats.servicesRevenue.toLocaleString()} (6%)</span>
            </div>
            <div style={{ width: '100%', height: '10px', background: 'var(--bg-tertiary)', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ width: '6%', height: '100%', background: 'var(--gold-dark)', borderRadius: '9999px' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
