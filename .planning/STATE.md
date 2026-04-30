# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-28)

**Core value:** Make discovering, organizing, and sharing 3D spaces as fluid as Figma makes 2D design
**Current focus:** Phase 5 — Teamspaces

## Current Position

Phase: 5.1 of 7 (Email Auth Hardening) — IN PROGRESS
Plan: 2 of 3 — COMPLETE
Status: Phase 5.1 Plan 02 complete; Email verification gating implemented; Plan 03 (email rate limiting) ready
Last activity: 2026-04-30 — 05.1-02 email verification complete; credentials signup requires email verification

Progress: [████████░░] 87% (5.0 complete, 5.1 started)

## Performance Metrics

**Velocity:**
- Total plans completed: 1
- Average duration: 18 min
- Total execution time: 18 min (0.3 hours)

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 05.1 | 1 | 18 min | 18 min |

**Recent Trend:**
- Last 5 plans: [05.1-01: 18 min]
- Trend: Accelerating (planned phases ahead)

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Viewer package used for marketplace + dashboard thumbnails (read-only embed, no editor overhead)
- Figma Community "duplicate" model for marketplace (preserves original, creates copy in workspace)
- Dribbble-style public profiles (self-contained; no separate portfolio app)
- Free-only marketplace for v1 (validate demand before monetization)
- All 5 public CTA links canonically use /signup (not /apply); /apply preserved for beta funnel
- Enterprise "Contact Sales" tier also routes through /signup for unified auth entry
- OG image uses next/og (bundled Next.js 16) — no @vercel/og install; Satori requires all styles inline
- twitter-image.tsx is a self-contained copy of opengraph-image (no cross-import; Next.js file convention)
- No @auth/prisma-adapter — manual signIn callback upsert preserves JWT session strategy; email as unique key prevents duplicate users
- allowDangerousEmailAccountLinking: true on GoogleProvider — safe for Google (verifies email); enables credential-user account linking
- BETTER_AUTH_SECRET renamed to NEXTAUTH_SECRET (was causing silent JWT signing failures)
- v1 password reset returns resetUrl in API response (no email provider); MUST be replaced with transactional email in v2
- Token stored as raw 64-char hex — acceptable for v1; v2 hardening: store SHA-256 of token instead
- Middleware reads onboardingComplete from JWT only (getToken) — never Prisma; Edge Runtime compatibility
- trigger=update in jwt callback enables client to force JWT refresh after onboarding completion via useSession().update()
- Google OAuth callbackUrl set to /onboarding; middleware redirects to /dashboard for returning users with onboardingComplete=true
- Role/useCase stored in OnboardingProgress.selections JSON — NOT added as User.role field (defers migration to future phase)
- createProject return type updated to { id: string } to enable /editor/[projectId] redirect from onboarding
- StepTeam saves step=3 progress before invite redirect so user returns to Step 4 (First Project) after token consumption
- WorkspaceSetupModal removed from dashboard layout — middleware from 03-01 guarantees only onboarded users reach /dashboard
- session.user cast to { id?: string } in dashboard server actions — consistent with getFirstTeamId pattern; no next-auth.d.ts module augmentation needed
- StarredProject migration deferred to deployment (no local DB); schema validated via bunx prisma validate; client regenerated against updated schema
- activeTeamId derived via usePathname() inside DashboardSidebar (client) — no prop drilling from server layout
- Team slug optional, not used in URLs for v1; id-based routing (/dashboard/teams/[teamId])
- Dashboard layout flatMaps across all org memberships so multi-org users see all their teams
- Team invite token is 64-char raw hex, 48h TTL, v1 URL-in-response pattern (no email provider)
- OWNER role excluded from invite — owner only set on team creation
- Atomic transaction on invite accept: teamMember.upsert + token.usedAt update
- OWNER role fully protected in server actions: cannot be assigned, demoted, or removed via any UI call
- Self-remove blocked at action level — separate leave-team flow deferred to future phase
- router.refresh() chosen over optimistic UI for member changes — simpler, consistent with server-driven data model
- Inline confirm in RemoveMemberButton avoids cross-component dependency on DeleteConfirmModal
- Resend chosen for transactional email (managed service, reliable, excellent TypeScript DX)
- SHA-256(token) stored in DB for password reset tokens (v2 hardening pattern, establishes secure pattern early)
- Raw token sent in email link, hashed token in DB (prevents URL leakage if DB compromised)
- Fire-and-forget email sends with .catch() error logging (preserves enumeration safety)
- Password reset endpoint no longer returns resetUrl in API response (v1 → v2 upgrade)
- Team invite endpoint no longer returns inviteUrl in API response (v1 → v2 upgrade)
- Email verification mandatory for credentials signup (prevents fake email registrations)
- Verification tokens use same security pattern as password reset: raw hex in URL, SHA-256 hash in DB
- Google OAuth users auto-verified on signup (Google has already verified their email)
- Grandfather migration sets emailVerified = createdAt for existing password users (no lockout)

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Session Continuity

Last session: 2026-04-30
Stopped at: Completed 05.1-01-PLAN.md — Resend integration and email auth hardening complete
Resume file: Begin Phase 5.1 Plan 02 (Email Verification) or continue to Phase 06 (Editor)
