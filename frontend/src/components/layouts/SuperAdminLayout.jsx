import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Globe, Layers, MapPin, CreditCard, Building2, LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export const SuperAdminLayout = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/staff/login');
  };

  const navItemStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
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
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div style={{ padding: '0 8px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold-light)' }}>
            <ShieldCheck size={22} />
            <span className="font-serif" style={{ fontSize: '1.1rem', fontWeight: 700 }}>AURA SAAS</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Super Admin Control Center
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '16px', flex: 1 }}>
          <NavLink to="/super-admin/dashboard" style={navItemStyle}>
            <LayoutDashboard size={18} />
            <span>Platform Overview</span>
          </NavLink>

          <NavLink to="/super-admin/locations" style={navItemStyle}>
            <MapPin size={18} />
            <span>Locations Hierarchy</span>
          </NavLink>

          <NavLink to="/super-admin/catalogue" style={navItemStyle}>
            <Layers size={18} />
            <span>Service Catalogue</span>
          </NavLink>

          <NavLink to="/super-admin/geo-rules" style={navItemStyle}>
            <Globe size={18} />
            <span>Geo Service Availability</span>
          </NavLink>

          <NavLink to="/super-admin/plans" style={navItemStyle}>
            <CreditCard size={18} />
            <span>Subscription Plans</span>
          </NavLink>

          <NavLink to="/super-admin/hotels" style={navItemStyle}>
            <Building2 size={18} />
            <span>Hotel Tenants</span>
          </NavLink>
        </nav>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600 }}>{currentUser?.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>{currentUser?.email}</div>
          <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%', padding: '8px', fontSize: '0.8rem' }}>
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
