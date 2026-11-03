import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('aura_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const pathname = window.location.pathname || '';
      const isStaffOrAdmin = pathname.startsWith('/admin') || pathname.startsWith('/super-admin') || pathname.startsWith('/staff');
      const isGuestPath = pathname.startsWith('/guest') || pathname.startsWith('/stay');

      let activeToken = null;
      if (isStaffOrAdmin) {
        // Look for dedicated admin or staff token first
        activeToken = localStorage.getItem('aura_admin_token') || localStorage.getItem('aura_staff_token');
        if (!activeToken) {
          const generalToken = localStorage.getItem('aura_token');
          if (generalToken) {
            try {
              const base64Url = generalToken.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const payload = JSON.parse(window.atob(base64));
              // Never use guest token for staff/admin session context
              if (payload.role !== 'GUEST' && !payload.isGuest) {
                activeToken = generalToken;
              }
            } catch (_) {
              activeToken = generalToken;
            }
          }
        }
      } else if (isGuestPath) {
        activeToken = localStorage.getItem('aura_guest_token') || localStorage.getItem('aura_token');
      } else {
        activeToken = localStorage.getItem('aura_admin_token') || localStorage.getItem('aura_token');
      }

      if (!activeToken) {
        setCurrentUser(null);
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        const user = res.data.user;
        if (user && (user.isGuest || user.role === 'GUEST')) {
          const derivedStayId = user.stayId || (typeof user.stay === 'string' ? user.stay : user.stay?._id);
          user.stayId = derivedStayId;
          if (!user.stay || typeof user.stay === 'string') {
            user.stay = { _id: derivedStayId, hotelId: user.hotelId };
          }
        }
        setCurrentUser(user);
      } catch (err) {
        console.warn('Session invalid or expired:', err.message);
        if (isStaffOrAdmin) {
          localStorage.removeItem('aura_admin_token');
          localStorage.removeItem('aura_staff_token');
          localStorage.removeItem('aura_admin_user');
        } else {
          localStorage.removeItem('aura_guest_token');
          localStorage.removeItem('aura_guest_user');
        }
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [token]);

  const loginStaff = async (email, password) => {
    const res = await api.post('/auth/staff/login', { email, password });
    const { token: newToken, user } = res.data;
    localStorage.setItem('aura_token', newToken);
    localStorage.setItem('aura_admin_token', newToken);
    localStorage.setItem('aura_staff_token', newToken);
    localStorage.setItem('aura_admin_user', JSON.stringify(user));
    setToken(newToken);
    setCurrentUser(user);
    return user;
  };

  const verifyGuestOtp = async (bookingNumber, otp) => {
    const res = await api.post('/auth/guest/verify-otp', { bookingNumber, otp });
    const { token: newToken, booking, stay } = res.data;
    localStorage.setItem('aura_guest_token', newToken);
    if (!localStorage.getItem('aura_admin_token')) {
      localStorage.setItem('aura_token', newToken);
    }
    setToken(newToken);
    const derivedHotelId = booking?.hotelId?._id || booking?.hotelId || stay?.hotelId?._id || stay?.hotelId || null;
    const derivedStayId = stay?._id || stay || null;
    const guestUser = {
      isGuest: true,
      role: 'GUEST',
      booking,
      stay: typeof stay === 'object' && stay !== null ? stay : { _id: derivedStayId, hotelId: derivedHotelId },
      stayId: derivedStayId,
      hotelId: derivedHotelId,
      guestName: booking?.guestId?.name || booking?.guestName || 'Guest User',
    };
    setCurrentUser(guestUser);
    return guestUser;
  };

  const refreshSession = async () => {
    const pathname = window.location.pathname || '';
    const isStaffOrAdmin = pathname.startsWith('/admin') || pathname.startsWith('/super-admin') || pathname.startsWith('/staff');
    const currentToken = isStaffOrAdmin
      ? (localStorage.getItem('aura_admin_token') || localStorage.getItem('aura_token'))
      : (localStorage.getItem('aura_guest_token') || localStorage.getItem('aura_token'));

    if (!currentToken) return null;
    try {
      const res = await api.get('/auth/me');
      const user = res.data.user;
      if (user && (user.isGuest || user.role === 'GUEST')) {
        const derivedStayId = user.stayId || (typeof user.stay === 'string' ? user.stay : user.stay?._id);
        user.stayId = derivedStayId;
        if (!user.stay || typeof user.stay === 'string') {
          user.stay = { _id: derivedStayId, hotelId: user.hotelId };
        }
      }
      setCurrentUser(user);
      return user;
    } catch (err) {
      console.warn('Session refresh failed:', err.message);
      return null;
    }
  };

  const logout = () => {
    const pathname = window.location.pathname || '';
    if (pathname.startsWith('/guest') || pathname.startsWith('/stay')) {
      localStorage.removeItem('aura_guest_token');
      localStorage.removeItem('aura_guest_user');
    } else {
      localStorage.removeItem('aura_token');
      localStorage.removeItem('aura_admin_token');
      localStorage.removeItem('aura_staff_token');
      localStorage.removeItem('aura_admin_user');
      localStorage.removeItem('aura_target_hotel_id');
    }
    setToken(null);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        loading,
        loginStaff,
        verifyGuestOtp,
        refreshSession,
        logout,
        isAuthenticated: !!currentUser,
        isSuperAdmin: currentUser?.role === 'SUPER_ADMIN',
        isHotelAdmin: currentUser?.role === 'HOTEL_ADMIN',
        isStaff: ['HOTEL_ADMIN', 'RECEPTION', 'KITCHEN', 'HOUSEKEEPING', 'ACCOUNTS'].includes(currentUser?.role),
        isGuest: currentUser?.isGuest || currentUser?.role === 'GUEST',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
