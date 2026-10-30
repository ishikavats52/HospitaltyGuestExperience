import React, { useState, useEffect } from 'react';
import { CreditCard, Check, Sparkles, Plus, CheckCircle2 } from 'lucide-react';
import api from '../../services/api.js';

export const PlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await api.get('/plans');
      setPlans(res.data || []);
    } catch (err) {
      console.error('Failed to load plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: '0.72rem', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
          SaaS Commercial Tiers
        </div>
        <h1 className="title-gold page-title" style={{ fontSize: '2.1rem', margin: '4px 0', letterSpacing: '-0.02em' }}>
          Subscription Plans & Entitlements
        </h1>
        <p className="page-subtitle" style={{ margin: 0 }}>
          Manage hotel SaaS subscription plans, free tier service policies, and property capacities.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          Loading subscription tiers...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '20px' }}>
          {plans.map((plan) => {
            const isFree = plan.code === 'FREE' || plan.price === 0;
            return (
              <div
                key={plan._id}
                className="glass-panel animate-fade-in"
                style={{
                  padding: '28px 24px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: isFree ? '2px solid var(--gold-primary)' : '1px solid var(--border-color)',
                  boxShadow: isFree ? 'var(--shadow-gold)' : 'var(--shadow-sm)',
                  position: 'relative',
                }}
              >
                {isFree && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-12px',
                      right: '20px',
                      background: 'var(--gold-primary)',
                      color: '#FFFFFF',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    Default Free Tier
                  </div>
                )}

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      {plan.name}
                    </h3>
                    <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                      {plan.code}
                    </span>
                  </div>

                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--gold-dark)', margin: '14px 0' }}>
                    {isFree ? 'Free' : `₹${plan.price?.toLocaleString()}`}
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                      {isFree ? ' forever' : '/month'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '20px 0' }}>
                    {(plan.features || [
                      'Contactless Check-In (Aadhaar & Selfie)',
                      'All Geo-Eligible Hotel Amenities',
                      'In-Room Dining Kitchen Pipeline',
                      'Express Checkout & Live Folios',
                    ]).map((feat, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                        <Check size={16} color="var(--gold-primary)" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Status: Active Plan</span>
                  <span className="badge badge-free">Enabled</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
