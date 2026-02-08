# Doctor Appointments (da.app)

> WhatsApp bot for private medical practices in Argentina — no secretary needed.

## Overview

A configurable WhatsApp bot that helps doctors manage appointments, payments, and patient communication without needing a secretary.

## Stack

| Layer | Technology |
|-------|------------|
| Database | Turso (SQLite) |
| Runtime | Bun + TypeScript |
| Admin UI | Next.js |
| AI | Kapso AI |
| Infrastructure | Railway |

## Architecture

Hexagonal (Ports & Adapters) — modules are decoupled and tested independently.

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│   WhatsApp API  │────▶│   Core App   │────▶│   Turso DB      │
│   (Adapter)     │     │   (Domain)   │     │   (Adapter)     │
└─────────────────┘     └──────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │   Next.js    │
                        │   Admin UI   │
                        └──────────────┘
```

## Project Structure

```
.
├── src/
│   ├── domain/              # Business logic, entities, ports
│   ├── application/         # Use cases, services
│   ├── infrastructure/      # DB, WhatsApp, payment adapters
│   └── interfaces/          # HTTP handlers, bot handlers
├── ui/                      # Next.js admin dashboard
├── tests/                   # Service tests
└── scripts/                 # Deployment, migrations
```

## Tasks & Features

### Authentication & Onboarding ✅
- [x] Firebase Authentication setup
- [x] Google Sign-In integration
- [x] Email/Password login
- [x] Doctor onboarding flow
  - [x] Auto-create doctor on first login
  - [x] Collect phone number and specialty
  - [x] Redirect to dashboard after completion
- [x] Auth context with doctor sync
- [x] Protected routes

### Backend API ✅
- [x] `POST /api/auth/doctor` - Create or get doctor from Firebase user
- [x] `GET /api/doctors/:id` - Get doctor by ID
- [x] `POST /api/doctors` - Create new doctor
- [x] `PATCH /api/doctors/:id` - Update doctor
- [x] `GET /api/doctors/:doctorId/patients` - List patients
- [x] `GET /api/doctors/:doctorId/appointments` - List appointments
- [x] `GET /api/doctors/:doctorId/slots` - Get available slots
- [x] `POST /api/appointments` - Book appointment
- [x] `POST /api/appointments/:id/cancel` - Cancel appointment

### Frontend Dashboard ✅
- [x] Login page with Google Sign-In
- [x] Onboarding page for new doctors
- [x] Dashboard with tabs:
  - [x] Appointments (calendar + list)
  - [x] Patients (list + search)
  - [x] Settings (configuration)
- [x] Responsive design
- [x] Loading states

### WhatsApp Bot ✅
- [x] Kapso AI integration
- [x] Welcome message per doctor
- [x] Available slots query
- [x] Appointment booking flow
- [x] Payment link sharing

### Notifications 🚧
- [x] 24-hour reminder script
- [ ] Cron job setup
- [ ] Reschedule/cancel flow

### Payments & Subscriptions 🚧
- [ ] Mercado Pago integration
- [ ] Subscription management
- [ ] Billing history

## Environment Variables

See `.env.example` for required configuration.

### Backend
```bash
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
KAPSO_API_KEY=
WHATSAPP_PHONE_NUMBER_ID=
MP_ACCESS_TOKEN=
MP_WEBHOOK_SECRET=
APP_SECRET=
NODE_ENV=
```

### Frontend
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_API_URL=
```

## Getting Started

```bash
# Install dependencies
bun install

# Run migrations
bun run migrate

# Start backend
cd doctor-appointments
bun run dev

# Start frontend (in another terminal)
cd ui
bun run dev
```

## Deployment

```bash
bun run deploy
```

## License

Private — All rights reserved.
