# Pascal Editor — Setup

## Prerequisites

- [Bun](https://bun.sh/) 1.3+ (or Node.js 18+)

## Quick Start

```bash
bun install
bun dev
```

The editor will be running at **http://localhost:3000**.

## Environment Variables

### Development

Copy `.env.example` to `.env` in the project root:

```bash
cp .env.example .env
```

Fill in values for:

- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET` — Generate with `openssl rand -base64 32`
- `REDIS_URL` — Redis connection string (for rate limiting)
- `R2_*` — Cloudflare R2 credentials (for file storage)

The editor runs with reasonable defaults for local dev if these are omitted.

### Production / Docker Deployment

Copy `.env.production` to `.env` on your VPS or Docker container:

```bash
cp .env.production .env
```

Update with your actual credentials:

- `DOMAIN` — Your production domain
- `DATABASE_URL` — Prod PostgreSQL (e.g., `postgresql://user:pass@db-host:5432/pascal_db`)
- `NEXTAUTH_SECRET` — Generate a new secret
- `R2_*` — Production R2 credentials
- `NEXTAUTH_URL` — Must match `DOMAIN` (`https://yourdomain.com`)

All variables are sourced from the root `.env` file by both the monorepo orchestrator (Turbo) and the Next.js app.

## Monorepo Structure

```
├── apps/
│   └── editor/          # Next.js editor application
├── packages/
│   ├── core/            # @pascal-app/core — Scene schema, state, systems
│   ├── viewer/          # @pascal-app/viewer — 3D rendering
│   └── ui/              # Shared UI components
└── tooling/             # Build & release tooling
```

## Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Start the development server |
| `bun build` | Build all packages |
| `bun check` | Lint and format check (Biome) |
| `bun check:fix` | Auto-fix lint and format issues |
| `bun check-types` | TypeScript type checking |

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on submitting PRs and reporting issues.
