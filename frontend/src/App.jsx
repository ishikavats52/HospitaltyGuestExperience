import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';

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

// Pages - Super Admin
import { SuperDashboard } from './pages/superadmin/SuperDashboard.jsx';
import { GeoRulesPage } from './pages/superadmin/GeoRulesPage.jsx';

// Pages - Hotel Admin
import { HotelDashboard } from './pages/admin/HotelDashboard.jsx';
import { ServiceManager } from './pages/admin/ServiceManager.jsx';

// Pages - Staff
import { StaffLoginPage } from './pages/staff/StaffLoginPage.jsx';
import { ReceptionDesk } from './pages/staff/ReceptionDesk.jsx';
import { KitchenKDS } from './pages/staff/KitchenKDS.jsx';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/guest/welcome" replace />} />

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
        </Route>

        {/* Staff & Admin Authentication */}
        <Route path="/staff/login" element={<StaffLoginPage />} />

        {/* Super Admin SaaS Governance Portal */}
        <Route path="/super-admin" element={<SuperAdminLayout />}>
          <Route index element={<Navigate to="/super-admin/dashboard" replace />} />
          <Route path="dashboard" element={<SuperDashboard />} />
          <Route path="geo-rules" element={<GeoRulesPage />} />
          <Route path="locations" element={<GeoRulesPage />} />
          <Route path="catalogue" element={<GeoRulesPage />} />
          <Route path="plans" element={<GeoRulesPage />} />
          <Route path="hotels" element={<SuperDashboard />} />
        </Route>

        {/* Hotel Admin Management Portal */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<HotelDashboard />} />
          <Route path="services" element={<ServiceManager />} />
          <Route path="rooms" element={<HotelDashboard />} />
          <Route path="menu" element={<HotelDashboard />} />
          <Route path="staff" element={<HotelDashboard />} />
          <Route path="reports" element={<HotelDashboard />} />
        </Route>

        {/* Hotel Staff Operational Queues */}
        <Route path="/staff" element={<StaffLayout />}>
          <Route index element={<Navigate to="/staff/reception" replace />} />
          <Route path="reception" element={<ReceptionDesk />} />
          <Route path="kitchen" element={<KitchenKDS />} />
          <Route path="services" element={<ServiceManager />} />
          <Route path="billing" element={<HotelDashboard />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/guest/welcome" replace />} />
      </Routes>
    </AuthProvider>
  );
}
