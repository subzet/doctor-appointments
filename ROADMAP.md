# ROADMAP.md — Doctor Appointments

## Phase 1: Foundation
**Goal:** Core infrastructure and WhatsApp integration

- [ ] Initialize Bun + TypeScript project
- [ ] Set up Hexagonal Architecture folder structure
- [ ] Configure Turso database schema
  - [ ] Doctors table
  - [ ] Patients table
  - [ ] Appointments table
  - [ ] Configurations table
- [ ] Set up WhatsApp Business API integration (Kapso AI)
- [ ] Create domain entities (Doctor, Patient, Appointment)
- [ ] Implement basic message handler
- [ ] Add environment configuration

## Phase 2: Core Bot Flow
**Goal:** Working appointment booking via WhatsApp

- [ ] Configurable welcome message per doctor
- [ ] Fetch available slots from calendar
- [ ] Book appointment flow
  - [ ] Ask for patient name
  - [ ] Confirm slot
  - [ ] Save to database
- [ ] Send payment information (Mercado Pago link)
- [ ] Appointment confirmation message
- [ ] Basic error handling and fallbacks

## Phase 3: Notifications
**Goal:** Automated reminders and follow-ups

- [ ] 24-hour reminder via WhatsApp
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

**Phase:** 1 (Foundation)

**Next Task:** Initialize project structure and Turso schema

**Blocked by:** None
