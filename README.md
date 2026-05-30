# Fund Operations Platform

> Multi-tenant operations management for volunteer foundations.

A web application for volunteer foundations that turns the daily flow —
**заявка → закупівля → склад → видача** — into a single auditable workflow.
Coordinators register unit requests, accountants log donor contributions and
allocate them to procurements, the warehouse module tracks stock and
issuances, the reports module emits internal XLSX/PDF/CSV and a public donor
report, and every state change is captured in an append-only audit log.

The system is multi-tenant: a **platform super-admin** provisions foundations
(each with its own legal data, users, and dictionaries) from a separate
admin area. The product UI is Ukrainian-only; this README and the code
comments are English.

## Highlights

- Multi-tenant — every record is scoped to a `foundationId`; the JWT carries it.
- Mandatory TOTP two-factor authentication (QR + manual key) — **set up on first login** for every user including the super-admin.
- JWT access + rotating refresh tokens with transparent client-side refresh-and-retry on 401.
- File-based REST API with Swagger at `/docs` (and the raw OpenAPI at `/docs-json`).
- Role-based UI: admin / coordinator / accountant / auditor. Each section's visibility and writes are gated by `RolesGuard` on the server and `canAccess()` on the client.
- Audit log of every key change (requests, contributions, procurements, stock movements, reports, users, foundation details, dictionaries) with read-time entity-ref resolution.
- Global ⌘K command palette — DB-backed search across requests, counterparties, contributions, procurements; role-filtered.
- File attachments on requests, contributions, procurements, and reports — stored on a Docker-mountable volume.
- Reports: internal builder (5 report types × 5 dimensions × XLSX/PDF/CSV) and a public donor report page rendered from a stored snapshot.

## Tech stack

### Server (`apps/server`)

| Concern | Library |
|---|---|
| Framework | NestJS 11 on Fastify |
| ORM | Prisma 7 (`@prisma/adapter-pg`) on PostgreSQL |
| Auth | `@nestjs/jwt` + passport-jwt, `bcryptjs` |
| 2FA | `otplib` + `qrcode` |
| Validation | `class-validator` + `class-transformer` |
| Files | `@fastify/multipart`, local-disk storage |
| Reports | `exceljs` (XLSX), `pdfkit` (PDF + Cyrillic via `@expo-google-fonts/roboto`) |
| Mail | `nodemailer` |
| Docs | `@nestjs/swagger` |

### Web (`apps/web`)

| Concern | Library |
|---|---|
| Build | Vite |
| UI | React 19 + TypeScript |
| Routing | TanStack Router (file-based) |
| Styling | Plain CSS variables (no UI library) |

### Tooling

Turborepo + pnpm 9 workspace; Node **24.14.0** pinned in `.nvmrc`.

## Project structure

```text
.
├── apps
│   ├── server
│   │   ├── prisma
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/          # init, add_two_factor
│   │   │   └── seed.ts              # seeds the platform super-admin
│   │   └── src
│   │       ├── common/              # guards, decorators, shared DTOs
│   │       ├── config/              # configuration.ts + env.validation.ts
│   │       ├── generated/prisma/    # Prisma client (output of `prisma generate`)
│   │       ├── infrastructure/
│   │       │   ├── database/        # PrismaService + one *.repo.ts per entity
│   │       │   ├── email/
│   │       │   └── storage/
│   │       └── modules/             # auth, platform, foundations, users,
│   │                                # dictionaries, counterparties, requests,
│   │                                # contributions, procurements, warehouses,
│   │                                # stock, files, reports, audit, dashboard,
│   │                                # nav, search
│   └── web
│       └── src
│           ├── routes/              # TanStack file-based routing
│           ├── features/            # one folder per section
│           ├── components/          # layout + ui primitives
│           ├── lib/
│           │   ├── api/             # typed REST client per domain
│           │   ├── auth/            # foundation + platform session stores
│           │   └── rbac.ts          # NAV array, canAccess()
│           └── styles/
├── packages/                        # reserved (empty)
├── docker-compose.yml
└── .env.docker.example
```

## Quick start (Docker)

The compose file boots a self-contained stack: Postgres, Mailpit, server, web.

```bash
cp .env.docker.example .env.docker
# Edit at minimum: JWT_SECRET, PLATFORM_ADMIN_PASSWORD
docker compose --env-file .env.docker up -d --build

# Once, to create the platform super-admin:
docker compose --env-file .env.docker --profile seed run --rm seed
```

Then open:

| Service | URL |
|---|---|
| Web app | <http://localhost:8080> |
| API + Swagger | <http://localhost:3000/docs> |
| Mailpit (mail catcher) | <http://localhost:8025> |
| Postgres | `localhost:5432` (user/pass from `.env.docker`) |

The super-admin signs in at <http://localhost:8080/platform-login> and is
**immediately forced through TOTP QR setup** before reaching the admin
dashboard. The server entrypoint runs `prisma migrate deploy` on every boot,
so subsequent deploys auto-apply pending migrations.

To point the stack at an external Postgres (e.g. Supabase) instead of the
in-compose one, set `DATABASE_URL` in `.env.docker` to the external connection
string — the local `postgres` service then just runs idle, or can be commented out.

## Local development (without Docker)

Pin the runtime:

```bash
# fnm/nvm: respect .nvmrc
nvm use                  # → Node 24.14.0
corepack enable          # → pnpm 9.0.0 (from packageManager)
pnpm install             # whole workspace
```

Bring up a Postgres any way you prefer (Docker, Supabase, brew, …), then:

```bash
# apps/server/.env — minimum required:
#   DATABASE_URL=postgresql://...
#   JWT_SECRET=at-least-16-characters
#   PLATFORM_ADMIN_NAME=...   PLATFORM_ADMIN_EMAIL=...   PLATFORM_ADMIN_PASSWORD=...

pnpm --filter server exec prisma migrate dev
pnpm --filter server seed
pnpm dev                 # runs server (3000) + web (5173) together via turbo
```

Then open the web at <http://localhost:5173> (the API base it talks to comes
from `VITE_API_URL`, default `http://localhost:3000`).

## Environment variables

Configured in `apps/server/src/config/configuration.ts` and validated by
`apps/server/src/config/env.validation.ts`. The seed script uses three
extra variables.

### Required

| Name | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string. |
| `JWT_SECRET` | Symmetric secret for access + refresh signing. **Minimum 16 characters.** |

### Server (optional, with defaults)

| Name | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP listen port. |
| `WEB_APP_URL` | `http://localhost:5173` | CORS origin and the prefix used in invitation/reset emails. |
| `TOTP_ISSUER` | `Фонд-платформа` | Issuer label shown in the authenticator app. |
| `JWT_ACCESS_TTL` | `15m` | Access-token lifetime (any [`ms`](https://github.com/vercel/ms)-style string). |
| `JWT_REFRESH_TTL_DAYS` | `30` | Refresh-token lifetime in days. |
| `UPLOAD_DIR` | `./uploads` | Filesystem root for attachments (mount a volume here in Docker). |
| `UPLOAD_MAX_FILE_SIZE` | `26214400` (25 MiB) | Per-file upload limit. |
| `MAIL_HOST` | — | SMTP host. Required for invitation / reset emails. |
| `MAIL_USER` | — | SMTP username. |
| `MAIL_PASS` | — | SMTP password. |

### Web (build-time)

| Name | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000` | API base **baked into the bundle** at build time. Provide via `--build-arg` for the web Docker image. |

### Seed (`apps/server/prisma/seed.ts` only)

| Name | Description |
|---|---|
| `PLATFORM_ADMIN_NAME` | Display name of the initial super-admin. |
| `PLATFORM_ADMIN_EMAIL` | Login email of the initial super-admin (unique). |
| `PLATFORM_ADMIN_PASSWORD` | Initial password. The first login forces TOTP setup. |

## Database, migrations, seeding

- Schema lives in `apps/server/prisma/schema.prisma`; provider `postgresql`, generator output `apps/server/src/generated/prisma` (CJS for the Nest build).
- The Prisma client is instantiated with `@prisma/adapter-pg` (see `infrastructure/database/prisma.service.ts`).
- Existing migrations: `20260529095431_init` and `20260529195724_add_two_factor`. New ones:

  ```bash
  pnpm --filter server exec prisma migrate dev --name <slug>
  ```

- In production / Docker, the server entrypoint runs `prisma migrate deploy` before launching the Nest process, so the container always starts on a migrated database.
- `pnpm --filter server seed` upserts the platform super-admin from the `PLATFORM_ADMIN_*` env vars. Run it once after `migrate deploy`.

## Authentication & two-factor

Two independent login flows share token plumbing:

| Audience | Login route | Session store |
|---|---|---|
| Foundation users | `POST /auth/login`, plus `POST /auth/invitations/:token/accept` for first-time activation | `apps/web/src/lib/auth/session.ts` |
| Platform super-admin | `POST /platform/auth/login` | `apps/web/src/lib/auth/platform-session.ts` |

Every login is **two-step**:

1. Email + password → server returns a `TwoFactorChallenge`:
   - `stage: 'SETUP'` (no TOTP yet) — includes a fresh `secret`, `otpauthUri`, and a `qrDataUrl`.
   - `stage: 'VERIFY'` — just a short-lived ticket.
2. The client posts the 6-digit code to `/auth/2fa/setup` or `/auth/2fa/verify` (platform: `/platform/auth/2fa/{setup,verify}`). Only then are access + refresh tokens issued.

The ticket is a JWT signed with a secret derived from `JWT_SECRET` but distinct from it, so it can never be used as a Bearer access token (and vice versa).

## Roles & access

Sidebar visibility (`apps/web/src/lib/rbac.ts`) — matches the server-side `RolesGuard` enforcement:

| Section | admin | coordinator | accountant | auditor |
|---|:-:|:-:|:-:|:-:|
| Дашборд | ✓ | ✓ | ✓ | ✓ |
| Заявки | ✓ | ✓ | | ✓ |
| Контрагенти | ✓ | ✓ | ✓ | ✓ |
| Благодійні внески | ✓ | | ✓ | ✓ |
| Закупівлі | ✓ | ✓ | ✓ | ✓ |
| Склад | ✓ | ✓ | | ✓ |
| Звітність | ✓ | | ✓ | ✓ |
| Аудит та історія | ✓ | | | ✓ |
| Адміністрування | ✓ | | | |

Auditor is read-only across the board (no write buttons, no status changes).

## API documentation

| URL | What it serves |
|---|---|
| `/docs` | Swagger UI (interactive). |
| `/docs-json` | Raw OpenAPI 3 document. |

Tag groups: `Auth`, `Platform`, `Foundations`, `Users`, `Counterparties`,
`Requests`, `Contributions`, `Procurements`, `Warehouses`, `Stock`, `Files`,
`Reports`, `Audit`, `Dashboard`, `Nav`, `Search`.

## Scripts cheatsheet

### Workspace root (turbo)

| Command | Effect |
|---|---|
| `pnpm dev` | Runs every package's `dev` script in parallel. |
| `pnpm build` | Builds every package. |
| `pnpm lint` | Lints every package. |
| `pnpm check-types` | Type-checks every package. |

### Server (`pnpm --filter server …`)

| Command | Effect |
|---|---|
| `dev` | `nest start --watch` |
| `build` | `nest build` → `apps/server/dist` |
| `start:prod` | `node dist/main` (used by the Docker `CMD`) |
| `seed` | `tsx prisma/seed.ts` — upserts the super-admin |
| `exec prisma migrate dev --name <slug>` | Create + apply a new migration |
| `exec prisma migrate deploy` | Apply pending migrations (Docker entrypoint) |

### Web (`pnpm --filter web …`)

| Command | Effect |
|---|---|
| `dev` | `vite` dev server at `:5173` |
| `build` | `tsc -b && vite build` → `apps/web/dist` |
| `preview` | `vite preview` against the built bundle |

## Conventions & notes

- The product UI is **Ukrainian-only** (`<html lang="uk">`). Code, errors, comments, and this README are English.
- There is **no mock data left** — the only files remaining under `apps/web/src/data/` are display-metadata (`statuses.ts`, `users.ts`); the rest were removed when each section was wired to the backend.
- Styles are plain CSS variables and module classes — no UI library, no CSS-in-JS.
- `.env*` files are never committed; only `.env.docker.example` is tracked. The dev default for `JWT_SECRET` in `configuration.ts` (`dev-insecure-secret-change-me`) is intentionally loud.
- The Prisma client is generated to `apps/server/src/generated/prisma` (relative to the server package). It's regenerated by `prisma generate`, which runs as part of `prisma migrate dev`, the seed flow, and the server Dockerfile's build stage.
- After adding a new TanStack route, run `pnpm --filter web exec vite build` once so `routeTree.gen.ts` is regenerated before `tsc -b` runs in CI.

## Authorship

Stanislav Basarab — diploma project, 2026. All rights reserved.
