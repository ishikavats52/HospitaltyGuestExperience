import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export const StaffLoginPage = () => {
  const [email, setEmail] = useState('admin.delhi@hotelgrand.com');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { loginStaff } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await loginStaff(email, password);
      if (user.role === 'SUPER_ADMIN') {
        navigate('/super-admin/dashboard');
      } else if (user.role === 'HOTEL_ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/staff/reception');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPreset = (presetEmail) => {
    setEmail(presetEmail);
    setPassword('Admin@123');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'radial-gradient(circle at top, #141E38 0%, #070B19 100%)',
      }}
    >
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '36px 28px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'rgba(224, 169, 109, 0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gold-light)',
              marginBottom: '12px',
            }}
          >
            <ShieldCheck size={28} />
          </div>
          <h1 className="title-gold" style={{ fontSize: '1.6rem', marginBottom: '6px' }}>
            Operations & Portal Sign In
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Access Super Admin Governance or Hotel Staff Portal
          </p>
        </div>

        {error && (
          <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.15)', color: '#F87171', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {/* Quick Demo Role Selector */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Quick Demo Accounts:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            <button
              type="button"
              onClick={() => handleQuickPreset('superadmin@platform.com')}
              className="btn btn-outline"
              style={{ fontSize: '0.7rem', padding: '6px' }}
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('admin.delhi@hotelgrand.com')}
              className="btn btn-outline"
              style={{ fontSize: '0.7rem', padding: '6px' }}
            >
              Hotel Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('reception.delhi@hotelgrand.com')}
              className="btn btn-outline"
              style={{ fontSize: '0.7rem', padding: '6px' }}
            >
              Reception
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Work Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="input-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: '38px' }}
              />
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="input-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingLeft: '38px' }}
              />
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-gold" style={{ marginTop: '8px', padding: '12px' }}>
            {loading ? 'Authenticating...' : 'Sign In to Portal'} <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
