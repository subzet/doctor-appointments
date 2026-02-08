# Doctor Appointments (da.app)

> WhatsApp bot for private medical practices in Argentina — no secretary needed.

## Quick Start

```bash
# 1. Install dependencies
bun install

# 2. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 3. Run migrations
bun run migrate

# 4. Start development server
bun run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `TURSO_DATABASE_URL` | Turso database URL |
| `TURSO_AUTH_TOKEN` | Turso auth token |
| `KAPSO_API_KEY` | Kapso AI API key |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp Business phone number ID |
| `MP_ACCESS_TOKEN` | Mercado Pago access token |
| `APP_SECRET` | Application secret for sessions |

## Scripts

- `bun run dev` — Start development server with hot reload
- `bun run migrate` — Run database migrations
- `bun run test` — Run tests
- `bun run build` — Build for production
- `bun run start` — Start production server

## Architecture

Hexagonal (Ports & Adapters):
- `domain/` — Business logic, entities, ports
- `application/` — Use cases, services
- `infrastructure/` — Database, WhatsApp, payment adapters
- `interfaces/` — HTTP handlers, bot handlers

## License

Private — All rights reserved.
