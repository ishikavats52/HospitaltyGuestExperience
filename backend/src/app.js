import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Middleware imports
import { errorHandler } from './middleware/error.middleware.js';
import { ApiResponse } from './utils/apiResponse.js';

// Route imports
import authRoutes from './modules/auth/auth.routes.js';
import locationsRoutes from './modules/locations/locations.routes.js';
import serviceCatalogueRoutes from './modules/serviceCatalogue/serviceCatalogue.routes.js';
import serviceAvailabilityRoutes from './modules/serviceAvailability/serviceAvailability.routes.js';
import plansRoutes from './modules/plans/plans.routes.js';
import subscriptionsRoutes from './modules/subscriptions/subscriptions.routes.js';
import hotelsRoutes from './modules/hotels/hotels.routes.js';
import propertiesRoutes from './modules/properties/properties.routes.js';
import roomsRoutes from './modules/rooms/rooms.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import guestsRoutes from './modules/guests/guests.routes.js';
import bookingsRoutes from './modules/bookings/bookings.routes.js';
import staysRoutes from './modules/stays/stays.routes.js';
import checkinRoutes from './modules/checkin/checkin.routes.js';
import qrRoutes from './modules/qr/qr.routes.js';
import menuRoutes from './modules/menu/menu.routes.js';
import ordersRoutes from './modules/orders/orders.routes.js';
import servicesRoutes from './modules/services/services.routes.js';
import billingRoutes from './modules/billing/billing.routes.js';
import feedbackRoutes from './modules/feedback/feedback.routes.js';

const app = express();

// Security and utility middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// API Health Check for AWS Load Balancer / Container Monitoring
app.get('/health', (req, res) => {
  return ApiResponse.success(res, 'Hospitality Guest Experience Platform API is active', {
    status: 'UP',
    version: '1.0.0',
    uptime: `${Math.floor(process.uptime())}s`,
    memory: process.memoryUsage(),
    engine: ENV.DB_ENGINE,
    environment: ENV.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Register Modular REST Endpoints
const API_BASE = '/api/v1';

app.use(`${API_BASE}/auth`, authRoutes);
app.use(`${API_BASE}/locations`, locationsRoutes);
app.use(`${API_BASE}/service-catalogue`, serviceCatalogueRoutes);
app.use(`${API_BASE}/service-availability`, serviceAvailabilityRoutes);
app.use(`${API_BASE}/plans`, plansRoutes);
app.use(`${API_BASE}/subscriptions`, subscriptionsRoutes);
app.use(`${API_BASE}/hotels`, hotelsRoutes);
app.use(`${API_BASE}/properties`, propertiesRoutes);
app.use(`${API_BASE}/rooms`, roomsRoutes);
app.use(`${API_BASE}/users`, usersRoutes);
app.use(`${API_BASE}/guests`, guestsRoutes);
app.use(`${API_BASE}/bookings`, bookingsRoutes);
app.use(`${API_BASE}/stays`, staysRoutes);
app.use(`${API_BASE}/checkin`, checkinRoutes);
app.use(`${API_BASE}/qr`, qrRoutes);
app.use(`${API_BASE}/menu`, menuRoutes);
app.use(`${API_BASE}/orders`, ordersRoutes);
app.use(`${API_BASE}`, servicesRoutes); // covers /hotels/:hotelId/services & /service-requests
app.use(`${API_BASE}/billing`, billingRoutes);
app.use(`${API_BASE}/feedback`, feedbackRoutes);

// Catch 404
app.use('*', (req, res) => {
  return ApiResponse.error(res, `Route ${req.originalUrl} not found on this server`, 404);
});

// Global Error Handler
app.use(errorHandler);

export default app;
