import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { QrCode, ChefHat, Sparkles, Receipt, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export const StaffLayout = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/staff/login');
  };

  const navTabStyle = ({ isActive }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 16px',
    borderRadius: 'var(--radius-sm)',
    color: isActive ? 'var(--gold-light)' : 'var(--text-secondary)',
    background: isActive ? 'rgba(224, 169, 109, 0.15)' : 'rgba(255, 255, 255, 0.03)',
    border: isActive ? '1px solid var(--border-active)' : '1px solid var(--border-color)',
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    flexShrink: 0,
    transition: 'all 0.2s',
  });

  return (
    <div className="staff-container">
      {/* Top Operations Nav */}
      <header className="staff-header">
        <div className="staff-header-top">
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gold-light)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Hotel Staff Operations
            </div>
            <div style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', fontWeight: 700, color: '#fff' }}>
              Live Task & Service Dispatch
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser?.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--gold-light)' }}>
                {currentUser?.role?.replace('_', ' ')}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-outline"
              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
              title="Sign Out"
            >
              <LogOut size={14} /> Exit
            </button>
          </div>
        </div>

        <nav className="staff-nav touch-scroll-x">
          <NavLink to="/staff/reception" style={navTabStyle}>
            <QrCode size={16} /> Reception Desk & QR
          </NavLink>
          <NavLink to="/staff/kitchen" style={navTabStyle}>
            <ChefHat size={16} /> Kitchen KDS
          </NavLink>
          <NavLink to="/staff/services" style={navTabStyle}>
            <Sparkles size={16} /> Guest Services
          </NavLink>
          <NavLink to="/staff/billing" style={navTabStyle}>
            <Receipt size={16} /> Folio Billing
          </NavLink>
        </nav>
      </header>

      {/* Main Operations Body */}
      <main className="staff-main">
        <Outlet />
      </main>
    </div>
  );
};

