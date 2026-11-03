import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const pathname = window.location.pathname || '';
    const isGuestPath = pathname.startsWith('/guest') || pathname.startsWith('/stay');

    let token = null;

    if (isGuestPath) {
      // Guest Portal & Express Stay Links
      token = localStorage.getItem('aura_guest_token') || localStorage.getItem('aura_token');
    } else {
      // Admin, Staff & SuperAdmin Portals (Always prioritize Admin / Staff credentials)
      token = localStorage.getItem('aura_admin_token') || localStorage.getItem('aura_staff_token');

      if (!token) {
        const generalToken = localStorage.getItem('aura_token');
        if (generalToken) {
          try {
            // Safely inspect JWT payload role
            const base64Url = generalToken.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));
            // Never send guest tokens to admin or staff endpoints
            if (payload.role !== 'GUEST' && !payload.isGuest) {
              token = generalToken;
            }
          } catch (_) {
            token = generalToken;
          }
        }
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Optional target hotel override for Super Admin
    const targetHotelId = localStorage.getItem('aura_target_hotel_id');
    if (targetHotelId) {
      config.headers['x-target-hotel-id'] = targetHotelId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;
