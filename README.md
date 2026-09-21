# Hospitality Guest Experience SaaS Platform (MERN + DynamoDB)

A next-generation, multi-tenant Guest Experience Platform built with the MERN stack and Amazon DynamoDB Single-Table architecture support. Centrally managed by SaaS Super Admins with **Geolocation-based Service Availability Rules** and **Free Subscription Entitlements**, allowing Hotel Admins to configure and offer custom services to guests.

---

## 🌟 Core Features & Architecture

1. **Multi-Tenant Hierarchy**:
   - `Hotel` (Tenant with location hierarchy: Country → State → City → Local Area)
   - `Property` (Physical hotel branches)
   - `Rooms`, `Staff`, `Menu`, and `Services` scoped strictly under properties.

2. **The 5-Tier Service Availability Chain**:
   ```
   Hotel Location (e.g. India / Delhi / Connaught Place)
         │
         ▼
   Super Admin Location Rules (Service enabled for Delhi?)
         │
         ▼
   Central Service Catalogue (Master SaaS service definition & active status)
         │
         ▼
   Subscription Entitlements (Hotel on Free Plan vs Paid Plan? Is service allowed?)
         │
         ▼
   Hotel Admin Enablement (Hotel Admin toggles enabled, sets price/operating hours)
         │
         ▼
   Guest PWA Service Availability & Backend Rejection Guard
   ```

3. **3 Dedicated User Interfaces**:
   - **Guest PWA** (`/guest`): Mobile-first web app with Welcome/OTP, Contactless Check-In (ID upload, selfie, signature pad), Cryptographic QR Digital Pass, Active Stay Hub, Geolocation-filtered Services, In-Room Dining, Live Folio Billing, and Checkout.
   - **Staff & Hotel Admin Portal** (`/admin` and `/staff`): Reception Desk QR scanner, Kitchen Display System (KDS) order pipeline, Eligible Services Manager, and Billing Folio audits.
   - **SaaS Super Admin Portal** (`/super-admin`): Multi-tenant management, Geographic Locations Hierarchy, Master Service Catalogue, Geolocation Service Availability Matrix, and Subscription Plans.

4. **Dual Database Architecture**:
   - **MongoDB (Default)**: Modular Mongoose models with zero-config in-memory fallback for immediate local testing.
   - **Amazon DynamoDB**: Single-Table schema design (`PK`, `SK`, `GSI1`) with DocumentClient repository helpers.

---

## 📁 Project Structure

```
Hospitality guest experience platform/
├── package.json                         # Monorepo scripts
├── backend/
│   ├── package.json
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js                   # Environment configuration
│   │   │   ├── db.js                    # MongoDB with in-memory fallback
│   │   │   ├── dynamodb.js              # AWS DynamoDB client configuration
│   │   │   └── redis.js                 # In-memory/Redis cache for OTPs & tokens
│   │   ├── database/
│   │   │   └── dynamodb/
│   │   │       ├── tableSchema.json     # DynamoDB Single-Table specification
│   │   │       └── dynamodbRepository.js# PK/SK and GSI query abstraction
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js        # JWT verification (Staff, Guest, Super Admin)
│   │   │   ├── tenant.middleware.js      # Multi-tenant isolation (hotelId/propertyId)
│   │   │   ├── role.middleware.js        # RBAC (Super Admin, Hotel Admin, Staff)
│   │   │   ├── eligibility.middleware.js # 5-tier service availability verification
│   │   │   └── error.middleware.js       # Global error handler
│   │   ├── modules/
│   │   │   ├── auth/                    # Staff login & Guest OTP
│   │   │   ├── locations/               # [ADDED] Geographic hierarchy
│   │   │   ├── serviceCatalogue/        # [ADDED] Master central catalogue
│   │   │   ├── serviceAvailability/     # [ADDED] Geolocation & plan rule matrix
│   │   │   ├── plans/                   # [ADDED] Free, Basic, Premium plans
│   │   │   ├── subscriptions/           # [ADDED] Hotel subscriptions
│   │   │   ├── hotels/                  # Hotel tenants
│   │   │   ├── properties/              # Physical branches
│   │   │   ├── rooms/                   # Room inventory & room types
│   │   │   ├── users/                   # Staff accounts & roles
│   │   │   ├── guests/                  # Master guest records & KYC docs
│   │   │   ├── bookings/                # Reservations
│   │   │   ├── stays/                   # 14-state journey lifecycle
│   │   │   ├── checkin/                 # Contactless check-in & ID capture
│   │   │   ├── qr/                      # Cryptographic QR pass & scan
│   │   │   ├── menu/                    # F&B dining catalog
│   │   │   ├── orders/                  # Food orders & kitchen status pipeline
│   │   │   ├── services/                # Hotel services & 5-tier guest requests
│   │   │   ├── billing/                 # Folio calculation & checkout settlement
│   │   │   └── feedback/                # Post-stay ratings & NPS scores
│   │   ├── seeds/
│   │   │   └── seedData.js              # Realistic seed script (Delhi & Agra hotels)
│   │   ├── utils/
│   │   │   ├── apiResponse.js           # Standard JSON response formatter
│   │   │   ├── qrGenerator.js           # Secure QR token generator
│   │   │   └── logger.js                # Structured logger
│   │   ├── app.js                       # Express app mounting all /api/v1 routes
│   │   └── server.js                    # HTTP listener entrypoint
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    ├── public/
    │   └── manifest.json                # PWA manifest
    └── src/
        ├── styles/
        │   └── index.css                # Luxury hospitality design system & tokens
        ├── services/
        │   └── api.js                   # Axios client with JWT interceptor
        ├── context/
        │   └── AuthContext.jsx          # Reactive session state
        ├── components/
        │   └── layouts/
        │       ├── GuestLayout.jsx      # Mobile-first luxury guest shell
        │       ├── StaffLayout.jsx      # Operational tabs for Reception & Kitchen
        │       ├── AdminLayout.jsx      # Hotel Admin management dashboard
        │       └── SuperAdminLayout.jsx # SaaS Super Admin governance layout
        ├── pages/
        │   ├── guest/
        │   │   ├── WelcomePage.jsx      # Contactless OTP authentication
        │   │   ├── CheckinPage.jsx      # Online KYC ID, selfie, signature pad
        │   │   ├── QRPassPage.jsx       # Digital check-in pass
        │   │   ├── DashboardPage.jsx    # Active stay dashboard & quick actions
        │   │   ├── ServicesPage.jsx     # Geolocation & plan-filtered guest services
        │   │   ├── FoodMenuPage.jsx     # In-room dining & cart ordering
        │   │   └── MyBillPage.jsx       # Itemized folio & checkout settlement
        │   ├── superadmin/
        │   │   ├── SuperDashboard.jsx   # Platform metrics & tenant overview
        │   │   └── GeoRulesPage.jsx     # Geolocation availability matrix & Free tier
        │   ├── admin/
        │   │   ├── HotelDashboard.jsx   # Property performance overview
        │   │   └── ServiceManager.jsx   # Eligible services enablement & pricing
        │   └── staff/
        │       ├── StaffLoginPage.jsx   # Staff & Super Admin login
        │       ├── ReceptionDesk.jsx    # QR scanner & arrival check-in validation
        │       └── KitchenKDS.jsx       # Live kitchen display queue
        ├── App.jsx                      # Unified routing
        └── main.jsx
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Populate Demo Data (Delhi & Agra Properties)
```bash
cd backend
npm run seed
```

### 3. Start the Development Servers
```bash
# In backend directory
npm run dev

# In frontend directory (separate terminal)
npm run dev
```

The web application will be accessible at:
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api/v1`

---

## 🔑 Demo Credentials

| Role | Email | Password | URL Route |
|---|---|---|---|
| **Super Admin** | `superadmin@platform.com` | `Admin@123` | `/super-admin/dashboard` |
| **Hotel Admin (Delhi)** | `admin.delhi@hotelgrand.com` | `Admin@123` | `/admin/dashboard` |
| **Reception Staff** | `reception.delhi@hotelgrand.com` | `Admin@123` | `/staff/reception` |
| **Kitchen Chef** | `kitchen.delhi@hotelgrand.com` | `Admin@123` | `/staff/kitchen` |
| **Guest PWA** | Booking: `BK-DELHI-101` / Phone: `9876543210` | OTP: `123456` | `/guest/welcome` |
