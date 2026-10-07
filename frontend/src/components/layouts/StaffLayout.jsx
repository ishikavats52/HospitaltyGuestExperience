import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { QrCode, ChefHat, Sparkles, Receipt, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ThemeSwitcher } from '../ThemeSwitcher.jsx';

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
    color: isActive ? 'var(--gold-dark)' : 'var(--text-secondary)',
    background: isActive ? 'var(--gold-soft)' : '#FFFFFF',
    border: isActive ? '1px solid var(--border-active)' : '1px solid var(--border-color)',
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    flexShrink: 0,
    boxShadow: isActive ? 'var(--shadow-xs)' : 'none',
    transition: 'all 0.2s ease',
  });

  return (
    <div className="staff-container">
      {/* Top Operations Nav */}
      <header className="staff-header">
        <div className="staff-header-top">
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>
              Hotel Staff Operations
            </div>
            <div className="font-serif" style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.35rem)', fontWeight: 700, color: 'var(--text-primary)' }}>
              Live Task & Service Dispatch
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ThemeSwitcher compact />
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.1, fontWeight: 500 }}>Welcome,</span>
              <span style={{ fontSize: '0.92rem', color: 'var(--gold-primary)', fontWeight: 800, lineHeight: 1.25, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser?.name || 'Staff Member'}
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {currentUser?.role?.replace('_', ' ') || 'STAFF'}
              </span>
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
      <main className="staff-main" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 120px)' }}>
        <Outlet />
        <div className="dapd-footer-trust" style={{ marginTop: 'auto', paddingTop: '28px' }}>
          🔒 Secure • Reliable • Strategic
        </div>
      </main>
    </div>
  );
};

