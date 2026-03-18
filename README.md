# Voxio API

REST API for the Voxio application. Built with NestJS, Prisma, and PostgreSQL. Provides authentication (JWT + refresh tokens in HTTP-only cookies), user management, roles, permissions, sessions, and Telegram bot integration for audio processing and transcription.

## Tech Stack

- **Runtime:** Node.js 20+
- **Framework:** [NestJS](https://nestjs.com/) 11
- **ORM:** [Prisma](https://www.prisma.io/) 7 (PostgreSQL)
- **Auth:** JWT (access tokens) + signed HTTP-only cookies (refresh tokens), Passport, bcrypt
- **Queue:** [BullMQ](https://docs.bullmq.io/) + Redis
- **Validation:** class-validator, class-transformer
- **Security:** Helmet, Throttler, CORS
- **Config:** @nestjs/config, Joi
- **Integrations:** Telegraf (Telegram Bot), OpenAI (speech-to-text)

## Prerequisites

- Node.js 20+
- pnpm 10+
- PostgreSQL
- Redis

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Environment variables

Create a `.env` file in the project root. Required variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` or `production` |
| `CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:5173` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db_name?schema=public` |
| `POSTGRES_USER` | PostgreSQL user (for Docker) | `username` |
| `POSTGRES_PASSWORD` | PostgreSQL password (for Docker) | `password` |
| `POSTGRES_DB` | PostgreSQL database name (for Docker) | `db_name` |
| `COOKIE_SECRET` | Secret for signing cookies | `your-secret` |
| `COOKIE_PATH` | Path for auth cookies. Use `/api/auth/refresh` when frontend proxies via `/api` | `/auth/refresh` or `/api/auth/refresh` |
| `COOKIE_SECURE` | Set to `true` only over HTTPS | `false` |
| `ACCESS_TOKEN_SECRET` | Secret for JWT access tokens | `your-secret` |
| `REFRESH_TOKEN_SECRET` | Secret for JWT refresh tokens | `your-secret` |
| `ACCESS_TOKEN_TTL` | Access token lifetime | `15m` |
| `REFRESH_TOKEN_TTL` | Refresh token lifetime | `7d` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `BOT_TOKEN` | Telegram Bot Token (optional) | — |
| `OPENAI_API_KEY` | OpenAI API key for transcription (optional) | — |
| `UPLOAD_PATH` / `UPLOADS_PATH` | Path for uploaded files storage | `uploads` |

### 3. Database

Generate Prisma client and run migrations:

```bash
pnpm prisma generate
pnpm prisma migrate deploy
```

For local development with migration creation:

```bash
pnpm prisma migrate dev
```

### 4. Seed (optional)

Creates admin user (`admin@test.com` / `password`), admin role, and `manage.all` permission:

```bash
pnpm build
pnpm seed
```

## Running the app

```bash
# Development (watch mode)
pnpm start:dev

# Production
pnpm build
pnpm start:prod
```

The API listens on `http://localhost:PORT` (default 3000).

## Docker

The project includes `docker-compose.yml` for API + PostgreSQL + Redis + Adminer.

```bash
docker compose up -d
```

- **API:** http://localhost:3000
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379
- **Adminer** (DB admin UI): http://localhost:8080 — System: PostgreSQL, Server: postgres, credentials from `.env`

For Docker with nginx proxy (frontend at `/api`), set `COOKIE_PATH=/api/auth/refresh` and `COOKIE_SECURE=false` in `.env`.

Run seed manually in Docker:

```bash
docker compose exec voxio-api node dist/prisma/seeds/seed.js
```

## Modules

| Module | Description |
|--------|-------------|
| `auth` | Login, register, refresh, logout |
| `users` | System users |
| `roles` | Roles |
| `permissions` | Permissions |
| `sessions` | User sessions |
| `profile` | Current user profile |
| `clients` | Clients (Telegram users) |
| `credits` | Client credits |
| `files` | Files (audio) |
| `jobs` | Transcription jobs (BullMQ) |
| `transcripts` | Transcripts |
| `telegram` | Telegram Bot (audio handling, job creation) |
| `speech` | OpenAI Whisper (speech-to-text) |

## Security

- **Rate limiting:** 100 requests per 60 seconds per IP; auth routes (login, register, refresh) are limited to 10 per 60 seconds.
- **CORS:** Only origins listed in `CORS_ORIGINS` are allowed; credentials are enabled.
- **Guards:** JWT auth is applied globally; use `@Public()` on routes that must stay unauthenticated.

## Testing

```bash
# Unit tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:cov

# E2E tests
pnpm test:e2e
```

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm build` | Build for production (includes seed). |
| `pnpm seed` | Run database seed (requires build first). |
| `pnpm start` | Start (no watch). |
| `pnpm start:dev` | Start in watch mode. |
| `pnpm start:prod` | Run production build. |
| `pnpm lint` | Run ESLint. |
| `pnpm format` | Format with Prettier. |

## Project structure

- `src/app.module.ts` — Root module (throttling, config, global JWT guard).
- `src/main.ts` — Bootstrap (validation pipe, cookie parser, CORS, Helmet).
- `src/common/` — Config, guards, decorators, utilities, ability (CASL).
- `src/infrastructure/` — Database (Prisma), Telegram, Speech (OpenAI), queue.
- `src/modules/` — Feature modules: auth, users, roles, permissions, sessions, profile, clients, credits, files, jobs, transcripts.
- `prisma/schema/` — Prisma schema (multi-file).
- `prisma/seeds/` — Database seed scripts.

## License

UNLICENSED (private).
