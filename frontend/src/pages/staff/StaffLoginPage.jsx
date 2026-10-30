import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  Lock,
  Mail,
  Eye,
  EyeOff,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  X,
  PhoneCall,
  UserX,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export const StaffLoginPage = () => {
  const [searchParams] = useSearchParams();
  const paramEmail = searchParams.get('email');
  const paramPass = searchParams.get('prefillPass');

  const [email, setEmail] = useState(paramEmail || 'admin.delhi@hotelgrand.com');
  const [password, setPassword] = useState(paramPass || 'Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Deactivated Account Popup Modal State
  const [isDeactivatedModalOpen, setIsDeactivatedModalOpen] = useState(false);
  const [deactivatedMsg, setDeactivatedMsg] = useState(
    'Your profile has been deactivated by SuperAdmin. Please contact them.'
  );

  const { loginStaff } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (paramEmail) {
      setEmail(paramEmail);
    }
    if (paramPass) {
      setPassword(paramPass);
    }
  }, [paramEmail, paramPass]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await loginStaff(email.trim(), password);
      if (user.role === 'SUPER_ADMIN') {
        navigate('/super-admin/dashboard');
      } else if (user.role === 'HOTEL_ADMIN') {
        navigate('/admin/properties');
      } else {
        navigate('/staff/reception');
      }
    } catch (err) {
      const rawMsg = err.message || '';
      if (
        rawMsg.toLowerCase().includes('deactivated') ||
        rawMsg.toLowerCase().includes('suspended') ||
        rawMsg.toLowerCase().includes('superadmin')
      ) {
        setDeactivatedMsg('Your profile has been deactivated by SuperAdmin. Please contact them.');
        setIsDeactivatedModalOpen(true);
        setError('Your profile has been deactivated by SuperAdmin. Please contact them.');
      } else {
        setError(rawMsg || 'Login failed. Please verify your email and password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPreset = (presetEmail) => {
    setEmail(presetEmail);
    setPassword('Admin@123');
    setError(null);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '28px 20px',
        background: 'linear-gradient(145deg, #FFF9FA 0%, #FFF0F3 50%, #FDF2F4 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative ambient background accents */}
      <div
        style={{
          position: 'absolute',
          top: '-12%',
          right: '-6%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 56, 92, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-12%',
          left: '-6%',
          width: '550px',
          height: '550px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(217, 4, 41, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '44px 36px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-color)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            className="animate-float"
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              background: 'var(--gold-soft)',
              border: '1px solid var(--border-active)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gold-primary)',
              marginBottom: '16px',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <ShieldCheck size={32} />
          </div>
          <div
            className="dapd-header-title"
            style={{ fontSize: '1.95rem', marginBottom: '4px', letterSpacing: '-0.02em', fontWeight: 800, color: 'var(--text-primary)' }}
          >
            AURA SAAS
          </div>
          <div
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: 'var(--gold-primary)',
              textTransform: 'uppercase',
            }}
          >
            Hospitality Governance & Portal
          </div>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Multi-Tenant Hotel Experience System
          </div>
        </div>

        {paramEmail && (
          <div
            style={{
              padding: '10px 14px',
              background: '#E6F7F7',
              color: '#008489',
              border: '1px solid rgba(0, 132, 137, 0.25)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CheckCircle2 size={16} color="#008489" />
            <span>
              Preloaded credentials for <strong>{paramEmail}</strong>.
            </span>
          </div>
        )}

        {error && (
          <div
            style={{
              padding: '12px 14px',
              background: '#FFF0F3',
              color: 'var(--gold-dark)',
              border: '1px solid var(--border-active)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Demo Role Selector */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Quick Demo Accounts:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleQuickPreset('superadmin@platform.com')}
              className="btn btn-outline"
              style={{ fontSize: '0.75rem', padding: '9px 6px', whiteSpace: 'nowrap' }}
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('admin.delhi@hotelgrand.com')}
              className="btn btn-outline"
              style={{ fontSize: '0.75rem', padding: '9px 6px', whiteSpace: 'nowrap' }}
            >
              Hotel Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('reception.delhi@hotelgrand.com')}
              className="btn btn-outline"
              style={{ fontSize: '0.75rem', padding: '9px 6px', whiteSpace: 'nowrap' }}
            >
              Reception
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Work Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="input-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@hotel.com"
                required
                style={{ paddingLeft: '40px', borderRadius: 'var(--radius-sm)' }}
              />
              <Mail size={17} color="var(--gold-primary)" style={{ position: 'absolute', left: '13px', top: '14px' }} />
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Your administrator or staff profile email.
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter account password"
                required
                style={{ paddingLeft: '40px', paddingRight: '42px', borderRadius: 'var(--radius-sm)' }}
              />
              <Lock size={17} color="var(--gold-primary)" style={{ position: 'absolute', left: '13px', top: '14px' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '13px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-gold"
            style={{
              marginTop: '10px',
              padding: '14px',
              borderRadius: 'var(--radius-full)',
              boxShadow: 'var(--shadow-gold)',
              fontSize: '0.95rem',
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'} <ArrowRight size={17} />
          </button>
        </form>

        <div className="dapd-footer-trust" style={{ marginTop: '26px', paddingBottom: 0 }}>
          🔒 AURA SaaS • Enterprise Hospitality System
        </div>
      </div>

      {/* POPUP: Profile Deactivated by SuperAdmin Modal */}
      {isDeactivatedModalOpen && (
        <div
          className="modal-backdrop active"
          style={{
            zIndex: 99999,
            backgroundColor: 'rgba(31, 36, 33, 0.65)',
            backdropFilter: 'blur(6px)',
          }}
          onClick={() => setIsDeactivatedModalOpen(false)}
        >
          <div
            className="modal-content glass-panel animate-fade-in"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '480px',
              width: '90%',
              padding: '40px 32px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 24px 60px rgba(217, 4, 41, 0.22)',
              border: '2px solid var(--border-active)',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <button
              type="button"
              onClick={() => setIsDeactivatedModalOpen(false)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
              }}
            >
              <X size={20} />
            </button>

            {/* Prominent Deactivated Alert Icon */}
            <div
              style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                background: '#FFF0F3',
                border: '2px solid var(--border-active)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--gold-dark)',
                marginBottom: '18px',
                boxShadow: '0 8px 24px rgba(217, 4, 41, 0.15)',
              }}
            >
              <UserX size={36} />
            </div>

            <h2
              style={{
                fontSize: '1.55rem',
                fontWeight: 800,
                color: 'var(--gold-dark)',
                margin: '0 0 10px',
                letterSpacing: '-0.01em',
              }}
            >
              Profile Deactivated
            </h2>

            <div
              style={{
                padding: '16px 20px',
                background: '#FFF9FA',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '20px',
                fontSize: '0.98rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                lineHeight: 1.45,
              }}
            >
              {deactivatedMsg}
            </div>

            <div
              style={{
                fontSize: '0.84rem',
                color: 'var(--text-secondary)',
                marginBottom: '28px',
                lineHeight: 1.5,
              }}
            >
              Your administrator access for account <strong style={{ color: 'var(--text-primary)' }}>{email}</strong> has
              been disabled by platform governance. To re-activate your profile and properties, please contact your
              platform Super Administrator.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a
                href={`mailto:superadmin@platform.com?subject=Profile%20Reactivation%20Request%20for%20${encodeURIComponent(
                  email
                )}&body=Hello%20SuperAdmin,%0D%0A%0D%0AMy%20hotel%20admin%20profile%20(${encodeURIComponent(
                  email
                )})%20has%20been%20deactivated.%20Please%20assist%20in%20reactivating%20my%20account.`}
                className="btn btn-gold"
                style={{
                  padding: '13px 20px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.92rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <PhoneCall size={16} />
                <span>Contact SuperAdmin Support</span>
              </a>

              <button
                type="button"
                onClick={() => setIsDeactivatedModalOpen(false)}
                className="btn btn-outline"
                style={{
                  padding: '11px 20px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.88rem',
                }}
              >
                Understood, Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffLoginPage;
