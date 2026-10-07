import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Hotel, Sparkles, BedDouble, Utensils, Users, BarChart3, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ThemeSwitcher } from '../ThemeSwitcher.jsx';

export const AdminLayout = () => {
  const { currentUser, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/staff/login');
  };

  const navItemStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    borderRadius: 'var(--radius-sm)',
    color: isActive ? 'var(--gold-dark)' : 'var(--text-secondary)',
    background: isActive ? 'var(--gold-soft)' : 'transparent',
    border: isActive ? '1px solid var(--border-active)' : '1px solid transparent',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: isActive ? 600 : 500,
    transition: 'all 0.2s ease',
  });

  return (
    <div className="admin-container">
      {/* Mobile Top Header (DAPD text format) */}
      <header className="admin-mobile-header" style={{ padding: '14px 18px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.1, fontWeight: 500 }}>Welcome,</span>
          <span style={{ fontSize: '1.02rem', color: 'var(--gold-primary)', fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.01em' }}>
            {currentUser?.name || 'Hotel Admin'}
          </span>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: '1px' }}>
            {currentUser?.role?.replace('_', ' ') || 'Hotel Admin'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ThemeSwitcher compact />
          <button
            type="button"
            className="admin-mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Navigation Menu"
            style={{ width: '42px', height: '42px', borderRadius: '10px' }}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>


      {/* Backdrop for mobile drawer */}
      <div
        className={`admin-backdrop ${mobileOpen ? 'active' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar Drawer */}
      <aside className={`admin-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0 8px 16px', borderBottom: '1px solid var(--border-color)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold-primary)' }}>
              <Hotel size={22} />
              <span className="font-serif" style={{ fontSize: '1.2rem', fontWeight: 700 }}>HOTEL ADMIN</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Property Management Suite
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="admin-mobile-toggle"
            style={{ display: mobileOpen ? 'flex' : 'none', width: '32px', height: '32px' }}
            aria-label="Close Navigation Menu"
          >
            <X size={16} />
          </button>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '16px', flex: 1 }}>
          <NavLink to="/admin/dashboard" style={navItemStyle} onClick={() => setMobileOpen(false)}>
            <Hotel size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/admin/services" style={navItemStyle} onClick={() => setMobileOpen(false)}>
            <Sparkles size={18} />
            <span>Eligible Services</span>
          </NavLink>

          <NavLink to="/admin/rooms" style={navItemStyle} onClick={() => setMobileOpen(false)}>
            <BedDouble size={18} />
            <span>Rooms Inventory</span>
          </NavLink>

          <NavLink to="/admin/menu" style={navItemStyle} onClick={() => setMobileOpen(false)}>
            <Utensils size={18} />
            <span>F&B Dining Menu</span>
          </NavLink>

          <NavLink to="/admin/staff" style={navItemStyle} onClick={() => setMobileOpen(false)}>
            <Users size={18} />
            <span>Staff & Roles</span>
          </NavLink>

          <NavLink to="/admin/reports" style={navItemStyle} onClick={() => setMobileOpen(false)}>
            <BarChart3 size={18} />
            <span>Operational Reports</span>
          </NavLink>
        </nav>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Theme</span>
            <ThemeSwitcher compact />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>{currentUser?.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser?.email}</div>
          </div>
          <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%', padding: '9px', fontSize: '0.8rem' }}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main View Area */}
      <main className="admin-main" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
        <Outlet />
        <div className="dapd-footer-trust" style={{ marginTop: 'auto', paddingTop: '32px' }}>
          🔒 Secure • Reliable • Strategic
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar for SmartPhones */}
      <nav className="admin-mobile-bottom-nav">
        <NavLink to="/admin/dashboard" className={({ isActive }) => `admin-bottom-tab ${isActive ? 'active' : ''}`}>
          <Hotel size={18} />
          <span>Overview</span>
        </NavLink>
        <NavLink to="/admin/rooms" className={({ isActive }) => `admin-bottom-tab ${isActive ? 'active' : ''}`}>
          <BedDouble size={18} />
          <span>Guests</span>
        </NavLink>
        <NavLink to="/admin/services" className={({ isActive }) => `admin-bottom-tab ${isActive ? 'active' : ''}`}>
          <Sparkles size={18} />
          <span>Services</span>
        </NavLink>
        <NavLink to="/admin/menu" className={({ isActive }) => `admin-bottom-tab ${isActive ? 'active' : ''}`}>
          <Utensils size={18} />
          <span>Dining</span>
        </NavLink>
      </nav>
    </div>
  );
};


