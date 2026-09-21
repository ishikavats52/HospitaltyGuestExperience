import React from 'react';
import { Building2, Globe, Layers, CreditCard, ShieldCheck } from 'lucide-react';

export const SuperDashboard = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div style={{ fontSize: '0.8rem', color: 'var(--gold-light)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Executive Control
        </div>
        <h1 className="title-gold" style={{ fontSize: '1.8rem' }}>
          Platform SaaS Overview
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Centralized governance of multi-tenant hotels, geographic location rules, and service catalog availability.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Hotel Tenants</span>
            <Building2 size={20} color="var(--gold-light)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff' }}>2 Active</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '4px' }}>Delhi (Free) & Agra (Basic)</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Geo Availability Rules</span>
            <Globe size={20} color="#60A5FA" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff' }}>7 Deployed</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Delhi, Agra territorial policies</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Master Services</span>
            <Layers size={20} color="#C084FC" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff' }}>5 Active</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--gold-light)', marginTop: '4px' }}>Room Svc, Laundry, Spa, Tour</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Subscription Plans</span>
            <CreditCard size={20} color="var(--success)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff' }}>3 Tiers</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Free, Basic, Premium</div>
        </div>
      </div>

      {/* Tenant Hierarchy Spotlight */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>
          Multi-Tenant Architecture Status
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600, color: '#fff' }}>Hotel Grand Delhi</span>
              <span className="badge badge-free">Free Plan</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Location: <strong>Delhi, India (Connaught Place)</strong>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Eligible Services: <strong>Room Service (Free), Laundry (Free in Delhi)</strong>
            </div>
          </div>

          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600, color: '#fff' }}>The Imperial Agra</span>
              <span className="badge badge-blue">Basic Plan</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Location: <strong>Agra, Uttar Pradesh (Taj Ganj)</strong>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Eligible Services: <strong>Room Service (Free), Local Taj Tour (Free)</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
