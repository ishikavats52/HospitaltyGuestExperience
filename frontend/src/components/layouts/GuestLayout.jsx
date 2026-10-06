import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, UtensilsCrossed, Sparkles, Receipt, QrCode, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ThemeSwitcher } from '../ThemeSwitcher.jsx';

export const GuestLayout = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleExit = () => {
    logout();
    navigate('/guest/welcome');
  };

  return (
    <div className="guest-container">
      {/* Top Luxury App Bar */}
      <header
        style={{
          padding: '12px 18px',
          paddingTop: 'max(12px, env(safe-area-inset-top))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-xs)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div>
          <div style={{ fontSize: '0.68rem', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
            Aura Guest Experience
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {currentUser?.guestName || 'Distinguished Guest'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ThemeSwitcher compact />
          <button
            onClick={handleExit}
            className="btn btn-outline"
            style={{ padding: '5px 10px', fontSize: '0.74rem' }}
            title="Sign Out"
          >
            <LogOut size={13} /> Exit
          </button>
        </div>
      </header>

      {/* Main Screen Content */}
      <main style={{ flex: 1, padding: '16px 14px', paddingBottom: '96px', overflowY: 'auto' }}>
        <Outlet />
      </main>

      {/* Luxury Bottom Navigation Bar */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '480px',
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--border-color)',
          boxShadow: '0 -4px 20px rgba(45, 35, 25, 0.06)',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '10px 4px',
          paddingBottom: 'max(10px, env(safe-area-inset-bottom))',
          zIndex: 50,
        }}
      >
        <NavLink
          to="/guest/dashboard"
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            color: isActive ? 'var(--gold-primary)' : 'var(--text-muted)',
            fontWeight: isActive ? 600 : 500,
            fontSize: '0.72rem',
            textDecoration: 'none',
            padding: '4px 8px',
            transition: 'all 0.2s ease',
          })}
        >
          <Home size={20} strokeWidth={2.2} />
          <span>Stay</span>
        </NavLink>

        <NavLink
          to="/guest/services"
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            color: isActive ? 'var(--gold-primary)' : 'var(--text-muted)',
            fontWeight: isActive ? 600 : 500,
            fontSize: '0.72rem',
            textDecoration: 'none',
            padding: '4px 8px',
            transition: 'all 0.2s ease',
          })}
        >
          <Sparkles size={20} strokeWidth={2.2} />
          <span>Services</span>
        </NavLink>

        <NavLink
          to="/guest/dining"
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            color: isActive ? 'var(--gold-primary)' : 'var(--text-muted)',
            fontWeight: isActive ? 600 : 500,
            fontSize: '0.72rem',
            textDecoration: 'none',
            padding: '4px 8px',
            transition: 'all 0.2s ease',
          })}
        >
          <UtensilsCrossed size={20} strokeWidth={2.2} />
          <span>Dining</span>
        </NavLink>

        <NavLink
          to="/guest/bill"
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            color: isActive ? 'var(--gold-primary)' : 'var(--text-muted)',
            fontWeight: isActive ? 600 : 500,
            fontSize: '0.72rem',
            textDecoration: 'none',
            padding: '4px 8px',
            transition: 'all 0.2s ease',
          })}
        >
          <Receipt size={20} strokeWidth={2.2} />
          <span>My Bill</span>
        </NavLink>

        <NavLink
          to="/guest/qr-pass"
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            color: isActive ? 'var(--gold-primary)' : 'var(--text-muted)',
            fontWeight: isActive ? 600 : 500,
            fontSize: '0.72rem',
            textDecoration: 'none',
            padding: '4px 8px',
            transition: 'all 0.2s ease',
          })}
        >
          <QrCode size={20} strokeWidth={2.2} />
          <span>Digital Key</span>
        </NavLink>
      </nav>
    </div>
  );
};

