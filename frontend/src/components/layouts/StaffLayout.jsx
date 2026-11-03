import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { QrCode, CalendarCheck, ChefHat, Sparkles, Receipt, LogOut, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export const StaffLayout = () => {
  const { currentUser, logout, isHotelAdmin, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/staff/login');
  };

  const isAdmin = isHotelAdmin || isSuperAdmin;
  const role = currentUser?.role;

  // Determine allowed routes based on staff role
  const getRoleDefaultPath = (userRole) => {
    switch (userRole) {
      case 'BOOKING_DESK':
        return '/staff/bookings';
      case 'HOUSEKEEPING':
        return '/staff/housekeeping';
      case 'KITCHEN':
        return '/staff/kitchen';
      case 'ACCOUNTS':
        return '/staff/accounts';
      case 'RECEPTION':
      default:
        return '/staff/reception';
    }
  };

  // Restrict staff to their own operational portal unless they are an admin
  const currentPath = location.pathname;
  if (!isAdmin && role) {
    const allowedPath = getRoleDefaultPath(role);
    // If staff is trying to access another department's sub-path, redirect to their allowed portal
    if (currentPath !== allowedPath && currentPath.startsWith('/staff/')) {
      return <Navigate to={allowedPath} replace />;
    }
  }

  // Navigation items: Admins see all departments to govern everything;
  // Individual staff members see only their dedicated department.
  const allNavTabs = [
    { to: '/staff/reception', label: 'Reception Desk', icon: QrCode, role: 'RECEPTION' },
    { to: '/staff/bookings', label: 'Booking Desk', icon: CalendarCheck, role: 'BOOKING_DESK' },
    { to: '/staff/housekeeping', label: 'Housekeeping', icon: Sparkles, role: 'HOUSEKEEPING' },
    { to: '/staff/kitchen', label: 'Kitchen KDS', icon: ChefHat, role: 'KITCHEN' },
    { to: '/staff/accounts', label: 'Accounts Folio', icon: Receipt, role: 'ACCOUNTS' },
  ];

  const visibleTabs = isAdmin
    ? allNavTabs
    : allNavTabs.filter((t) => t.role === role);

  const navTabStyle = ({ isActive }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: 'var(--radius-sm)',
    color: isActive ? 'var(--gold-dark)' : 'var(--text-secondary)',
    background: isActive ? 'var(--gold-soft)' : '#FFFFFF',
    border: isActive ? '1px solid var(--border-active)' : '1px solid var(--border-color)',
    textDecoration: 'none',
    fontSize: '0.84rem',
    fontWeight: isActive ? 700 : 500,
    whiteSpace: 'nowrap',
    flexShrink: 0,
    boxShadow: isActive ? 'var(--shadow-xs)' : 'none',
    transition: 'all 0.2s ease',
  });

  return (
    <div className="staff-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      {/* Clean Minimalist Staff Header */}
      <header
        style={{
          background: '#FFFFFF',
          borderBottom: '1px solid var(--border-color)',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Welcome,</span>
          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {currentUser?.name || 'Staff Member'}
          </span>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '9999px',
              background: 'var(--gold-soft)',
              color: 'var(--gold-primary)',
              border: '1px solid var(--border-active)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {currentUser?.department || currentUser?.role?.replace('_', ' ') || 'STAFF'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isAdmin && (
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="btn btn-outline"
              style={{ padding: '6px 14px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <span>Hotel Admin Suite</span>
              <ArrowRight size={13} />
            </button>
          )}
          <button
            onClick={handleLogout}
            className="btn btn-outline"
            style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Sign Out"
          >
            <LogOut size={14} />
            <span>Exit</span>
          </button>
        </div>
      </header>

      {/* Role Navigation Bar (Shown when admin can govern all, or when user has tabs) */}
      {isAdmin && (
        <nav
          className="staff-nav touch-scroll-x"
          style={{
            padding: '8px 20px',
            background: 'var(--bg-primary)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
          }}
        >
          {visibleTabs.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} style={navTabStyle}>
                <Icon size={15} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      )}

      {/* Main Operations Content */}
      <main className="staff-main" style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '24px 20px' }}>
        <Outlet />
        <div className="dapd-footer-trust" style={{ marginTop: 'auto', paddingTop: '32px' }}>
          🔒 AURA Staff Operations • Dedicated Role Workspace
        </div>
      </main>
    </div>
  );
};
