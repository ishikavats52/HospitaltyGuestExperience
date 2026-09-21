import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, UtensilsCrossed, Sparkles, Receipt, QrCode, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

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
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(7, 11, 25, 0.95)',
          borderBottom: '1px solid var(--border-color)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--gold-light)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Aura Guest Experience
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: '#fff' }}>
            {currentUser?.guestName || 'Distinguished Guest'}
          </div>
        </div>

        <button
          onClick={handleExit}
          className="btn btn-outline"
          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          title="Sign Out"
        >
          <LogOut size={14} /> Exit
        </button>
      </header>

      {/* Main Screen Content */}
      <main style={{ flex: 1, padding: '20px 16px', paddingBottom: '90px', overflowY: 'auto' }}>
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
          background: 'rgba(13, 20, 36, 0.96)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '10px 0',
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
            color: isActive ? 'var(--gold-light)' : 'var(--text-secondary)',
            fontSize: '0.7rem',
            textDecoration: 'none',
          })}
        >
          <Home size={20} />
          <span>Stay</span>
        </NavLink>

        <NavLink
          to="/guest/services"
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            color: isActive ? 'var(--gold-light)' : 'var(--text-secondary)',
            fontSize: '0.7rem',
            textDecoration: 'none',
          })}
        >
          <Sparkles size={20} />
          <span>Services</span>
        </NavLink>

        <NavLink
          to="/guest/dining"
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            color: isActive ? 'var(--gold-light)' : 'var(--text-secondary)',
            fontSize: '0.7rem',
            textDecoration: 'none',
          })}
        >
          <UtensilsCrossed size={20} />
          <span>Dining</span>
        </NavLink>

        <NavLink
          to="/guest/bill"
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            color: isActive ? 'var(--gold-light)' : 'var(--text-secondary)',
            fontSize: '0.7rem',
            textDecoration: 'none',
          })}
        >
          <Receipt size={20} />
          <span>My Bill</span>
        </NavLink>

        <NavLink
          to="/guest/qr-pass"
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            color: isActive ? 'var(--gold-light)' : 'var(--text-secondary)',
            fontSize: '0.7rem',
            textDecoration: 'none',
          })}
        >
          <QrCode size={20} />
          <span>Digital Key</span>
        </NavLink>
      </nav>
    </div>
  );
};
