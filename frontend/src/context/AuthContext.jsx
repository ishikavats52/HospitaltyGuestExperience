import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('aura_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      if (!token) {
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
        console.warn('Session expired:', err.message);
        logout();
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
    setToken(newToken);
    setCurrentUser(user);
    return user;
  };

  const verifyGuestOtp = async (bookingNumber, otp) => {
    const res = await api.post('/auth/guest/verify-otp', { bookingNumber, otp });
    const { token: newToken, booking, stay } = res.data;
    localStorage.setItem('aura_token', newToken);
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

  const logout = () => {
    localStorage.removeItem('aura_token');
    localStorage.removeItem('aura_target_hotel_id');
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
