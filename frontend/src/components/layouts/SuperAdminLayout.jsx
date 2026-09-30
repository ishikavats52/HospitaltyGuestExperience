import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Globe, Layers, MapPin, CreditCard, Building2, LayoutDashboard, LogOut, ShieldCheck, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export const SuperAdminLayout = () => {
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
    color: isActive ? 'var(--gold-light)' : 'var(--text-secondary)',
    background: isActive ? 'rgba(224, 169, 109, 0.12)' : 'transparent',
    border: isActive ? '1px solid var(--border-color)' : '1px solid transparent',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: 500,
    transition: 'all 0.2s',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold-light)' }}>
            <ShieldCheck size={18} />
            <span className="font-serif" style={{ fontSize: '0.95rem', fontWeight: 700 }}>AURA SAAS</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--gold-light)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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

      {/* Sidebar */}
      <aside className={`admin-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0 8px 16px', borderBottom: '1px solid var(--border-color)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold-light)' }}>
              <ShieldCheck size={22} />
              <span className="font-serif" style={{ fontSize: '1.1rem', fontWeight: 700 }}>AURA SAAS</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Super Admin Control Center
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
          <NavLink to="/super-admin/dashboard" style={navItemStyle} onClick={() => setMobileOpen(false)}>
            <LayoutDashboard size={18} />
            <span>Platform Overview</span>
          </NavLink>

          <NavLink to="/super-admin/locations" style={navItemStyle} onClick={() => setMobileOpen(false)}>
            <MapPin size={18} />
            <span>Locations Hierarchy</span>
          </NavLink>

          <NavLink to="/super-admin/catalogue" style={navItemStyle} onClick={() => setMobileOpen(false)}>
            <Layers size={18} />
            <span>Service Catalogue</span>
          </NavLink>

          <NavLink to="/super-admin/geo-rules" style={navItemStyle} onClick={() => setMobileOpen(false)}>
            <Globe size={18} />
            <span>Geo Service Availability</span>
          </NavLink>

          <NavLink to="/super-admin/plans" style={navItemStyle} onClick={() => setMobileOpen(false)}>
            <CreditCard size={18} />
            <span>Subscription Plans</span>
          </NavLink>

          <NavLink to="/super-admin/hotels" style={navItemStyle} onClick={() => setMobileOpen(false)}>
            <Building2 size={18} />
            <span>Hotel Tenants</span>
          </NavLink>
        </nav>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600 }}>{currentUser?.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser?.email}</div>
          <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%', padding: '10px', fontSize: '0.8rem' }}>
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

