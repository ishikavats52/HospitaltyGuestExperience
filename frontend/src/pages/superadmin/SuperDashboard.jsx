import React from 'react';
import { Building2, Globe, Layers, CreditCard, ShieldCheck } from 'lucide-react';

export const SuperDashboard = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div style={{ fontSize: '0.72rem', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>
          Executive Control
        </div>
        <h1 className="title-gold page-title" style={{ fontSize: '2.1rem', margin: '4px 0' }}>
          Platform SaaS Overview
        </h1>
        <p className="page-subtitle">
          Centralized governance of multi-tenant hotels, geographic location rules, and service catalog availability.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid-kpi">
        <div className="glass-panel animate-fade-in" style={{ padding: '22px', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Hotel Tenants</span>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'var(--gold-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={20} color="var(--gold-primary)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>2 Active</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--success)', marginTop: '4px', fontWeight: 500 }}>Delhi (Free) & Agra (Basic)</div>
        </div>

        <div className="glass-panel animate-fade-in" style={{ padding: '22px', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Geo Rules</span>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'var(--info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe size={20} color="var(--info)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>7 Deployed</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Delhi, Agra territorial policies</div>
        </div>

        <div className="glass-panel animate-fade-in" style={{ padding: '22px', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Master Services</span>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: '#F5EFFB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={20} color="#7C3AED" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>5 Active</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--gold-primary)', marginTop: '4px', fontWeight: 500 }}>Room Svc, Laundry, Spa, Tour</div>
        </div>

        <div className="glass-panel animate-fade-in" style={{ padding: '22px', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Subscription Plans</span>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={20} color="var(--success)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>3 Tiers</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Free, Basic, Premium</div>
        </div>
      </div>

      {/* Tenant Hierarchy Spotlight */}
      <div className="glass-panel animate-fade-in" style={{ padding: 'clamp(16px, 3vw, 24px)', backgroundColor: '#FFFFFF' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
          Multi-Tenant Architecture Status
        </h3>
        <div className="grid-2col">
          <div style={{ padding: '18px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem' }}>Hotel Grand Delhi</span>
              <span className="badge badge-free">Free Plan</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Location: <strong style={{ color: 'var(--text-primary)' }}>Delhi, India (Connaught Place)</strong>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
              Eligible Services: <strong style={{ color: 'var(--text-primary)' }}>Room Service (Free), Laundry (Free in Delhi)</strong>
            </div>
          </div>

          <div style={{ padding: '18px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem' }}>The Imperial Agra</span>
              <span className="badge badge-blue">Basic Plan</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Location: <strong style={{ color: 'var(--text-primary)' }}>Agra, Uttar Pradesh (Taj Ganj)</strong>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
              Eligible Services: <strong style={{ color: 'var(--text-primary)' }}>Room Service (Free), Local Taj Tour (Free)</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
