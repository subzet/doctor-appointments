# ROADMAP.md — Doctor Appointments

## Phase 1: Foundation ✅
**Goal:** Core infrastructure and WhatsApp integration

- [x] Initialize Bun + TypeScript project
- [x] Set up Hexagonal Architecture folder structure
- [x] Configure Turso database schema
  - [x] Doctors table
  - [x] Patients table
  - [x] Appointments table
  - [x] Configurations table
- [x] Set up WhatsApp Business API integration (Kapso AI) - placeholder
- [x] Create domain entities (Doctor, Patient, Appointment)
- [x] Implement basic message handler
- [x] Add environment configuration

## Phase 2: Core Bot Flow ✅
**Goal:** Working appointment booking via WhatsApp

- [x] Configurable welcome message per doctor
- [x] Fetch available slots from calendar
- [x] Book appointment flow
  - [x] Ask for patient name
  - [x] Confirm slot
  - [x] Save to database
- [x] Send payment information (Mercado Pago link)
- [x] Appointment confirmation message
- [x] Basic error handling and fallbacks

## Phase 3: Notifications ✅
**Goal:** Automated reminders and follow-ups

- [x] 24-hour reminder via WhatsApp
- [x] Script for daily reminders
- [ ] Cron job setup for daily reminders
- [ ] Reschedule/cancel flow
- [ ] Missed appointment handling

## Phase 4: Admin UI ✅
**Goal:** Web interface for doctors

- [x] Next.js project setup
- [x] Authentication with Firebase
- [x] Dashboard with upcoming appointments
- [x] Calendar view (read-only for now)
- [ ] Chat history viewer
- [x] Configuration panel
  - [x] Edit welcome message
  - [x] View available hours
  - [x] Payment link configuration

## Phase 5: Patient Management ✅
**Goal:** Complete patient history and search

- [x] Patient list with search
- [x] Patient profile page
- [x] Appointment history per patient
- [ ] Notes/observations field
- [ ] Export patient data

## Phase 6: Subscription & Payments
**Goal:** Monetize the platform

- [ ] Mercado Pago subscription integration
- [ ] Subscription status tracking
- [ ] Grace period handling
- [ ] Billing history
- [ ] Admin panel for subscription management

## Phase 7: Polish & Scale
**Goal:** Production-ready features

- [ ] Comprehensive test coverage for services
- [ ] Error monitoring (Sentry or similar)
- [ ] Rate limiting
- [ ] Multi-doctor support (single instance)
- [ ] Analytics dashboard
- [ ] Performance optimizations

---

## Current Status

**Phase:** 4-5 (Admin UI + Patient Management)

**Next Tasks:**
1. Add authentication to admin UI
2. Implement cron job for reminders
3. Add tests for services
4. Mercado Pago subscription integration

**Blocked by:** None

---

## Project Structure

```
doctor-appointments/
├── src/
│   ├── domain/              # Entities & ports (Doctor, Patient, Appointment)
│   ├── application/         # Services & bot flow handler
│   ├── infrastructure/      # Turso DB, WhatsApp (Kapso)
│   ├── interfaces/          # API routes & webhook handlers
│   └── index.ts             # Hono server
├── ui/                      # Next.js admin dashboard
│   ├── app/
│   │   ├── components/      # Appointments, Patients, Settings tabs
│   │   ├── page.tsx         # Dashboard main page
│   │   └── layout.tsx
│   ├── components/ui/       # shadcn/ui components
│   └── lib/
│       ├── api.ts           # API client
│       └── types.ts         # TypeScript types
├── scripts/
│   ├── migrate.ts           # Database migrations
│   └── send-reminders.ts    # Daily reminder script
├── AGENTS.md                # Repository overview
└── ROADMAP.md               # This file
```
