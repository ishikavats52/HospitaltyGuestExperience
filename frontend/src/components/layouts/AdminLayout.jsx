import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  BedDouble,
  Users,
  Utensils,
  Sparkles,
  BarChart3,
  CreditCard,
  LogOut,
  Menu,
  X,
  Hotel,
  ShieldCheck,
  UserCheck,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

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
    padding: '12px 16px',
    borderRadius: 'var(--radius-sm)',
    color: isActive ? 'var(--gold-dark)' : 'var(--text-secondary)',
    background: isActive ? 'var(--gold-soft)' : 'transparent',
    border: isActive ? '1px solid var(--border-active)' : '1px solid transparent',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: isActive ? 700 : 500,
    transition: 'all 0.2s ease',
  });

  return (
    <div className="admin-container">
      {/* Mobile Top Header */}
      <header
        className="admin-mobile-header"
        style={{
          padding: '14px 20px',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.1, fontWeight: 500 }}>
            Hotel Admin Portal
          </span>
          <span
            style={{
              fontSize: '1.05rem',
              color: 'var(--gold-primary)',
              fontWeight: 800,
              lineHeight: 1.25,
              letterSpacing: '-0.01em',
            }}
          >
            {currentUser?.name || 'Administrator'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            padding: '0 8px 18px',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--gold-primary)' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'var(--gold-soft)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Hotel size={20} />
              </div>
              <span className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
                HOTEL ADMIN
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              Hospitality Executive Suite
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

        {/* 7 Hotel Admin Navigation Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '16px', flex: 1 }}>
          <NavLink to="/admin/properties" style={navItemStyle} onClick={() => setMobileOpen(false)}>
            <Building2 size={18} />
            <span>1. Property Management</span>
          </NavLink>

          <NavLink to="/admin/rooms" style={navItemStyle} onClick={() => setMobileOpen(false)}>
            <BedDouble size={18} />
            <span>2. Rooms</span>
          </NavLink>

          <NavLink to="/admin/staff" style={navItemStyle} onClick={() => setMobileOpen(false)}>
            <Users size={18} />
            <span>3. Staff</span>
          </NavLink>

          <NavLink to="/admin/menu" style={navItemStyle} onClick={() => setMobileOpen(false)}>
            <Utensils size={18} />
            <span>4. Menu</span>
          </NavLink>

          <NavLink to="/admin/services" style={navItemStyle} onClick={() => setMobileOpen(false)}>
            <Sparkles size={18} />
            <span>5. Services</span>
          </NavLink>

          <NavLink to="/admin/reports" style={navItemStyle} onClick={() => setMobileOpen(false)}>
            <BarChart3 size={18} />
            <span>6. Reports</span>
          </NavLink>

          <NavLink to="/admin/billing" style={navItemStyle} onClick={() => setMobileOpen(false)}>
            <CreditCard size={18} />
            <span>7. Billing</span>
          </NavLink>

          {/* Additional Quick Hubs */}
          <div style={{ margin: '12px 0 6px', padding: '0 8px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Operations & Reception
          </div>

          <NavLink to="/admin/dashboard" style={navItemStyle} onClick={() => setMobileOpen(false)}>
            <Hotel size={18} />
            <span>Guest KYC & Check-Ins</span>
          </NavLink>

          <Link
            to="/staff/reception"
            style={{
              ...navItemStyle({ isActive: false }),
              background: '#FFF0F3',
              color: 'var(--gold-dark)',
              border: '1px solid var(--border-active)',
              marginTop: '4px',
            }}
            onClick={() => setMobileOpen(false)}
          >
            <UserCheck size={18} />
            <span>Reception Desk Portal</span>
            <ExternalLink size={14} style={{ marginLeft: 'auto' }} />
          </Link>
        </nav>

        {/* User Card & Sign Out */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 700 }}>
              {currentUser?.name || 'Hotel Admin'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentUser?.email}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-outline"
            style={{ width: '100%', padding: '10px', fontSize: '0.82rem', borderRadius: 'var(--radius-sm)' }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main View Area */}
      <main className="admin-main" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', padding: '32px 36px' }}>
        <Outlet />
        <div className="dapd-footer-trust" style={{ marginTop: 'auto', paddingTop: '36px' }}>
          🔒 AURA SaaS • Enterprise Hospitality System
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar for SmartPhones */}
      <nav className="admin-mobile-bottom-nav">
        <NavLink to="/admin/properties" className={({ isActive }) => `admin-bottom-tab ${isActive ? 'active' : ''}`}>
          <Building2 size={18} />
          <span>Properties</span>
        </NavLink>
        <NavLink to="/admin/rooms" className={({ isActive }) => `admin-bottom-tab ${isActive ? 'active' : ''}`}>
          <BedDouble size={18} />
          <span>Rooms</span>
        </NavLink>
        <NavLink to="/admin/staff" className={({ isActive }) => `admin-bottom-tab ${isActive ? 'active' : ''}`}>
          <Users size={18} />
          <span>Staff</span>
        </NavLink>
        <NavLink to="/admin/billing" className={({ isActive }) => `admin-bottom-tab ${isActive ? 'active' : ''}`}>
          <CreditCard size={18} />
          <span>Billing</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default AdminLayout;
