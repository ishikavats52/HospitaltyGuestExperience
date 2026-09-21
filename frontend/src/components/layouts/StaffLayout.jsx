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
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: 'var(--radius-sm)',
    color: isActive ? 'var(--gold-light)' : 'var(--text-secondary)',
    background: isActive ? 'rgba(224, 169, 109, 0.15)' : 'transparent',
    border: isActive ? '1px solid var(--border-color)' : '1px solid transparent',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: 600,
    transition: 'all 0.2s',
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Operations Nav */}
      <header
        style={{
          padding: '16px 32px',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--gold-light)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Hotel Staff Operations
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
            Live Task & Service Dispatch
          </div>
        </div>

        <nav style={{ display: 'flex', gap: '8px' }}>
          <NavLink to="/staff/reception" style={navTabStyle}>
            <QrCode size={18} /> Reception Desk & QR
          </NavLink>
          <NavLink to="/staff/kitchen" style={navTabStyle}>
            <ChefHat size={18} /> Kitchen KDS
          </NavLink>
          <NavLink to="/staff/services" style={navTabStyle}>
            <Sparkles size={18} /> Guest Services
          </NavLink>
          <NavLink to="/staff/billing" style={navTabStyle}>
            <Receipt size={18} /> Folio Billing
          </NavLink>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{currentUser?.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gold-light)' }}>{currentUser?.role}</div>
          </div>
          <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '8px 14px' }}>
            <LogOut size={16} /> Exit
          </button>
        </div>
      </header>

      {/* Main Operations Body */}
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
};
