---
phase: 05-teamspaces
plan: 02
subsystem: team-invites
tags: [auth, invite, teamspaces, api, ui]
dependency_graph:
  requires: ["05-01"]
  provides: ["team-invite-token-flow", "invite-accept-route", "InviteMemberModal"]
  affects: ["dashboard/teams/[teamId]/members"]
tech_stack:
  added: []
  patterns:
    - "v1 URL-in-response invite pattern (mirrors password reset v1)"
    - "Atomic Prisma transaction for upsert + mark-used"
    - "useTransition for async form submission"
key_files:
  created:
    - apps/editor/app/api/teams/invite/route.ts
    - apps/editor/app/api/teams/invite/accept/route.ts
    - apps/editor/app/dashboard/teams/[teamId]/members/_components/InviteMemberModal.tsx
  modified: []
decisions:
  - "Token stored as raw 64-char hex (consistent with password reset v1 decision)"
  - "OWNER role excluded from invite roles — owner only set on team creation"
  - "Email lowercased at creation and comparison — case-insensitive matching"
  - "Invite URL returned directly in API response (no email provider for v1)"
  - "48-hour TTL chosen (vs 1h for password reset) — invite links shared manually"
  - "Upsert on TeamMember.create handles edge case of already-member user"
metrics:
  duration: "~20 minutes"
  completed: "2026-04-30"
  tasks: 3
  files_created: 3
  files_modified: 0
---

# Phase 5 Plan 02: Team Invite Flow Summary

**One-liner:** Token-based team invite with OWNER/ADMIN gated creation, atomic acceptance, and modal URL-display UI (v1 — no email provider).

## What Was Built

### Token Creation (POST /api/teams/invite)

- Requires active session with OWNER or ADMIN membership on the target team
- Validates email format and role (ADMIN, EDITOR, COMMENTER, VIEWER — OWNER excluded)
- Generates `randomBytes(32).toString("hex")` token, stores in `TeamInviteToken` with 48h TTL
- Returns `{ success, inviteUrl, expiresAt }` — URL displayed in UI (v1 pattern)
- Email stored lowercase to ensure case-insensitive matching on accept

### Token Acceptance (GET /api/teams/invite/accept)

Validation order:
1. Token present in query string → else redirect `?error=invalid_token`
2. User authenticated → else redirect to `/login?callbackUrl=...`
3. Token exists in DB → else redirect `?error=invalid_token`
4. Token not already used → else `?error=token_already_used`
5. Token not expired → else `?error=token_expired`
6. Session email matches `invite.inviteeEmail` → else `?error=wrong_account`
7. Atomic transaction: `teamMember.upsert` + `teamInviteToken.update({ usedAt })`
8. Redirect to `/dashboard/teams/[teamId]`

### InviteMemberModal UI

Two-state component: form view → result view.

- **Form view:** email input + role select (VIEWER default) with per-role description help text. Inline error display from API `error` field. Disabled submit during `useTransition`.
- **Result view:** read-only URL input, copy-to-clipboard button with 2-second "Copied!" feedback, "Send another" resets to form, "Done" closes modal.
- Styled to match `CreateTeamModal` (zinc-900, white text, rounded-2xl, border white/10).

## Deviations from Plan

None — plan executed exactly as written.

## Commits

| Task | Hash | Message |
|------|------|---------|
| 1 — POST /api/teams/invite | 11abd34 | feat(05-02): POST /api/teams/invite — token creation route |
| 2 — GET /api/teams/invite/accept | 87de9a7 | feat(05-02): GET /api/teams/invite/accept — validation + membership creation |
| 3 — InviteMemberModal | 3465408 | feat(05-02): InviteMemberModal — invite UI with URL display |

## Self-Check: PASSED

- apps/editor/app/api/teams/invite/route.ts — exists
- apps/editor/app/api/teams/invite/accept/route.ts — exists
- apps/editor/app/dashboard/teams/[teamId]/members/_components/InviteMemberModal.tsx — exists
- TypeScript: no errors in new files
- All 3 commits present
