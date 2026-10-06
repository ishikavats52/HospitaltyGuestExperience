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
      {/* Mobile Top Header */}
      <header className="admin-mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="admin-mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold-primary)' }}>
            <Hotel size={18} />
            <span className="font-serif" style={{ fontSize: '0.98rem', fontWeight: 700 }}>HOTEL ADMIN</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ThemeSwitcher compact />
          <span style={{ fontSize: '0.78rem', color: 'var(--gold-primary)', fontWeight: 600, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentUser?.name?.split(' ')[0]}
          </span>
          <button
            onClick={handleLogout}
            className="btn btn-outline"
            style={{ padding: '6px 10px', fontSize: '0.75rem' }}
            title="Sign Out"
          >
            <LogOut size={14} />
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
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

