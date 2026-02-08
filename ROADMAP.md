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

## Phase 2: Core Bot Flow 🚧
**Goal:** Working appointment booking via WhatsApp

- [x] Configurable welcome message per doctor
- [x] Fetch available slots from calendar
- [x] Book appointment flow
  - [x] Ask for patient name
  - [x] Confirm slot
  - [x] Save to database
- [x] Send payment information (Mercado Pago link)
- [x] Appointment confirmation message
- [ ] Basic error handling and fallbacks

## Phase 3: Notifications ✅
**Goal:** Automated reminders and follow-ups

- [x] 24-hour reminder via WhatsApp
- [x] Script for daily reminders
- [ ] Cron job setup for daily reminders
- [ ] Reschedule/cancel flow
- [ ] Missed appointment handling

## Phase 4: Admin UI
**Goal:** Web interface for doctors

- [ ] Next.js project setup
- [ ] Authentication (simple password or magic link)
- [ ] Dashboard with upcoming appointments
- [ ] Calendar view (read-only for now)
- [ ] Chat history viewer
- [ ] Configuration panel
  - [ ] Edit welcome message
  - [ ] Set available hours
  - [ ] Payment link configuration

## Phase 5: Patient Management
**Goal:** Complete patient history and search

- [ ] Patient list with search
- [ ] Patient profile page
- [ ] Appointment history per patient
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

**Phase:** 2-3 (Core Bot Flow + Notifications)

**Next Tasks:**
1. Add tests for services
2. Implement reschedule/cancel flow
3. Set up cron job for reminders
4. Start Admin UI (Next.js)

**Blocked by:** None
