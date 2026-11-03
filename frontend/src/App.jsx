import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';

// Layouts
import { GuestLayout } from './components/layouts/GuestLayout.jsx';
import { SuperAdminLayout } from './components/layouts/SuperAdminLayout.jsx';
import { AdminLayout } from './components/layouts/AdminLayout.jsx';
import { StaffLayout } from './components/layouts/StaffLayout.jsx';

// Pages - Guest
import { WelcomePage } from './pages/guest/WelcomePage.jsx';
import { DashboardPage } from './pages/guest/DashboardPage.jsx';
import { CheckinPage } from './pages/guest/CheckinPage.jsx';
import { QRPassPage } from './pages/guest/QRPassPage.jsx';
import { ServicesPage } from './pages/guest/ServicesPage.jsx';
import { FoodMenuPage } from './pages/guest/FoodMenuPage.jsx';
import { MyBillPage } from './pages/guest/MyBillPage.jsx';
import { FeedbackPage } from './pages/guest/FeedbackPage.jsx';
import { MagicStayResolver } from './pages/guest/MagicStayResolver.jsx';

// Pages - Super Admin
import { SuperDashboard } from './pages/superadmin/SuperDashboard.jsx';
import { GeoRulesPage } from './pages/superadmin/GeoRulesPage.jsx';
import { LocationsPage } from './pages/superadmin/LocationsPage.jsx';
import { CataloguePage } from './pages/superadmin/CataloguePage.jsx';
import { PlansPage } from './pages/superadmin/PlansPage.jsx';

// Pages - Hotel Admin
import { HotelDashboard } from './pages/admin/HotelDashboard.jsx';
import { PropertyManager } from './pages/admin/PropertyManager.jsx';
import { RoomManager } from './pages/admin/RoomManager.jsx';
import { StaffManager } from './pages/admin/StaffManager.jsx';
import { MenuManager } from './pages/admin/MenuManager.jsx';
import { ServiceManager } from './pages/admin/ServiceManager.jsx';
import { ReportsPage } from './pages/admin/ReportsPage.jsx';
import { BillingPage } from './pages/admin/BillingPage.jsx';

// Pages - Staff
import { StaffLoginPage } from './pages/staff/StaffLoginPage.jsx';
import { ReceptionDesk } from './pages/staff/ReceptionDesk.jsx';
import { BookingDesk } from './pages/staff/BookingDesk.jsx';
import { KitchenKDS } from './pages/staff/KitchenKDS.jsx';
import { HousekeepingView } from './pages/staff/HousekeepingView.jsx';
import { AccountsFolio } from './pages/staff/AccountsFolio.jsx';
import { useAuth } from './context/AuthContext.jsx';

// Role-based smart redirect for Staff portal entry
const StaffRoleIndexRedirect = () => {
  const { currentUser } = useAuth();
  const role = currentUser?.role;

  if (role === 'BOOKING_DESK') {
    return <Navigate to="/staff/bookings" replace />;
  }
  if (role === 'HOUSEKEEPING') {
    return <Navigate to="/staff/housekeeping" replace />;
  }
  if (role === 'KITCHEN') {
    return <Navigate to="/staff/kitchen" replace />;
  }
  if (role === 'ACCOUNTS') {
    return <Navigate to="/staff/accounts" replace />;
  }
  return <Navigate to="/staff/reception" replace />;
};

export default function App() {
  React.useEffect(() => {
    // Global Mobile Keypad Protection:
    // When any input inside a modal or scrollable container receives focus,
    // smoothly scroll it into center view so it never hides behind the virtual keyboard.
    const handleFocusIn = (e) => {
      const target = e.target;
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(target?.tagName)) {
        setTimeout(() => {
          try {
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
              inline: 'nearest',
            });
          } catch (_) {}
        }, 250);
      }
    };

    document.addEventListener('focusin', handleFocusIn, { passive: true });
    return () => document.removeEventListener('focusin', handleFocusIn);
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/guest/welcome" replace />} />

          {/* Express Magic Stay Resolver for WhatsApp / SMS Links */}
          <Route path="/stay/:bookingRef" element={<MagicStayResolver />} />
          <Route path="/feedback" element={<FeedbackPage />} />

          {/* Guest PWA Portal */}
          <Route path="/guest/welcome" element={<WelcomePage />} />
          <Route path="/guest" element={<GuestLayout />}>
            <Route index element={<Navigate to="/guest/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="checkin" element={<CheckinPage />} />
            <Route path="qr-pass" element={<QRPassPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="dining" element={<FoodMenuPage />} />
            <Route path="bill" element={<MyBillPage />} />
            <Route path="feedback" element={<FeedbackPage />} />
          </Route>

          {/* Staff & Admin Authentication */}
          <Route path="/staff/login" element={<StaffLoginPage />} />

          {/* Super Admin SaaS Governance Portal */}
          <Route path="/super-admin" element={<SuperAdminLayout />}>
            <Route index element={<Navigate to="/super-admin/dashboard" replace />} />
            <Route path="dashboard" element={<SuperDashboard />} />
            <Route path="admins" element={<SuperDashboard />} />
            <Route path="geo-rules" element={<Navigate to="/super-admin/dashboard" replace />} />
            <Route path="locations" element={<Navigate to="/super-admin/dashboard" replace />} />
            <Route path="catalogue" element={<Navigate to="/super-admin/dashboard" replace />} />
            <Route path="plans" element={<PlansPage />} />
            <Route path="hotels" element={<SuperDashboard />} />
          </Route>
          {/* Super Admin URL Alias (supports both /super-admin and /super_admin) */}
          <Route path="/super_admin/*" element={<Navigate to="/super-admin/dashboard" replace />} />

          {/* Hotel Admin Management Portal */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<HotelDashboard />} />
            <Route path="properties" element={<PropertyManager />} />
            <Route path="rooms" element={<RoomManager />} />
            <Route path="staff" element={<StaffManager />} />
            <Route path="menu" element={<MenuManager />} />
            <Route path="services" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="billing" element={<BillingPage />} />
          </Route>

          {/* Hotel Staff Operational Queues */}
          <Route path="/staff" element={<StaffLayout />}>
            <Route index element={<StaffRoleIndexRedirect />} />
            <Route path="reception" element={<ReceptionDesk />} />
            <Route path="bookings" element={<BookingDesk />} />
            <Route path="kitchen" element={<KitchenKDS />} />
            <Route path="housekeeping" element={<HousekeepingView />} />
            <Route path="accounts" element={<AccountsFolio />} />
            {/* Backward compatibility aliases */}
            <Route path="services" element={<HousekeepingView />} />
            <Route path="billing" element={<AccountsFolio />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/guest/welcome" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}
