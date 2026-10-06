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
        background: 'linear-gradient(145deg, #FAF8F5 0%, #F4EDE2 50%, #ECE3D4 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative ambient background accents */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(220, 195, 160, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(200, 180, 150, 0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '40px 32px', backgroundColor: '#FFFFFF', boxShadow: 'var(--shadow-lg)', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '26px' }}>
          <div
            className="animate-float"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--gold-soft)',
              border: '1px solid var(--border-active)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gold-primary)',
              marginBottom: '14px',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <ShieldCheck size={28} />
          </div>
          <h1 className="title-gold page-title" style={{ marginBottom: '6px', fontSize: '2.1rem' }}>
            Operations & Portal Sign In
          </h1>
          <p className="page-subtitle" style={{ fontSize: '0.88rem' }}>
            Access Super Admin Governance or Hotel Staff Portal
          </p>
        </div>

        {error && (
          <div style={{ padding: '12px 14px', background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid rgba(186, 51, 51, 0.25)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {/* Quick Demo Role Selector */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Quick Demo Accounts:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(95px, 1fr))', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleQuickPreset('superadmin@platform.com')}
              className="btn btn-outline"
              style={{ fontSize: '0.75rem', padding: '8px 6px', whiteSpace: 'nowrap' }}
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('admin.delhi@hotelgrand.com')}
              className="btn btn-outline"
              style={{ fontSize: '0.75rem', padding: '8px 6px', whiteSpace: 'nowrap' }}
            >
              Hotel Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('reception.delhi@hotelgrand.com')}
              className="btn btn-outline"
              style={{ fontSize: '0.75rem', padding: '8px 6px', whiteSpace: 'nowrap' }}
            >
              Reception
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
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
              <Mail size={16} color="var(--gold-primary)" style={{ position: 'absolute', left: '12px', top: '15px' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
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
              <Lock size={16} color="var(--gold-primary)" style={{ position: 'absolute', left: '12px', top: '15px' }} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-gold" style={{ marginTop: '8px', padding: '13px' }}>
            {loading ? 'Authenticating...' : 'Sign In to Portal'} <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
