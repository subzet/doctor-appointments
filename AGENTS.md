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

## Environment Variables

See `.env.example` for required configuration.

## Getting Started

```bash
bun install
bun run migrate
bun run dev
```

## Deployment

```bash
bun run deploy
```

## License

Private — All rights reserved.
