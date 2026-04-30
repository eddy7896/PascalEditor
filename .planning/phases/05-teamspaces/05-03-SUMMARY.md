---
phase: 05-teamspaces
plan: 03
subsystem: ui
tags: [next.js, prisma, server-actions, rbac, teamspaces]

# Dependency graph
requires:
  - phase: 05-01
    provides: Team schema, createTeam action, sidebar team switching
  - phase: 05-02
    provides: TeamInviteToken, invite API, InviteMemberModal

provides:
  - changeTeamMemberRole server action with OWNER/ADMIN gate and OWNER protection
  - removeTeamMember server action with OWNER/ADMIN gate and OWNER + self-remove protection
  - /dashboard/teams/[teamId]/members server page (data fetching + role context)
  - MembersTable client component (role-gated controls per row)
  - RoleSelect client component (useTransition + router.refresh inline role change)
  - RemoveMemberButton client component (inline confirm + router.refresh removal)

affects: [06-editor, 07-deployment]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - router.refresh() for live updates after server actions (no optimistic UI)
    - useTransition for pending state on server action calls
    - Inline confirm in RemoveMemberButton avoids cross-component DeleteConfirmModal dependency
    - OWNER role fully protected at action level — cannot be assigned, demoted, or removed via any UI call

key-files:
  created:
    - apps/editor/app/dashboard/teams/[teamId]/members/page.tsx
    - apps/editor/app/dashboard/teams/[teamId]/members/_components/MembersTable.tsx
    - apps/editor/app/dashboard/teams/[teamId]/members/_components/RoleSelect.tsx
    - apps/editor/app/dashboard/teams/[teamId]/members/_components/RemoveMemberButton.tsx
  modified:
    - apps/editor/app/dashboard/actions.ts

key-decisions:
  - "router.refresh() chosen over optimistic UI for member changes — simpler, consistent with server-driven data model"
  - "OWNER role fully protected in server actions: cannot be assigned, demoted, or removed via any UI call"
  - "Self-remove blocked at action level — separate leave-team flow deferred to future phase"
  - "Inline confirm in RemoveMemberButton avoids cross-component dependency on DeleteConfirmModal"

patterns-established:
  - "Server action authorization: always verify caller membership before performing team mutation"
  - "Role-gated UI: OWNER/ADMIN see controls; VIEWER/EDITOR/COMMENTER see read-only; OWNER row always read-only"
  - "Live row updates via router.refresh() after action resolves — no state lifting or prop threading needed"

# Metrics
duration: ~60min (across session)
completed: 2026-04-30
---

# Phase 5 Plan 03: Member Management Summary

**Role change + removal actions with OWNER/ADMIN RBAC gates, live row updates via router.refresh(), and a fully protected OWNER row across MembersTable, RoleSelect, and RemoveMemberButton**

## Performance

- **Duration:** ~60 min
- **Started:** 2026-04-30
- **Completed:** 2026-04-30
- **Tasks:** 3 (2 auto + 1 human-verify)
- **Files modified:** 5

## Accomplishments

- `changeTeamMemberRole` and `removeTeamMember` server actions with three-layer protection: auth check, OWNER/ADMIN gate, OWNER-row freeze
- Members page server component fetches full member+user relation and passes role context to client table
- MembersTable renders role controls only for OWNER/ADMIN viewers; OWNER rows are always read-only
- RoleSelect uses `useTransition` for pending state; RemoveMemberButton uses inline confirm — both call `router.refresh()` for immediate row sync
- All 8 Phase 5 end-to-end human verification tests passed

## Task Commits

1. **Task 1: Server actions — changeTeamMemberRole + removeTeamMember** - `ba0799f` (feat)
2. **Task 2: Members page + MembersTable + RoleSelect + RemoveMemberButton** - `5985758` (feat)
3. **Task 3: Human verify — full Phase 5 end-to-end flow** - approved (no code commit; verification only)

## Files Created/Modified

- `apps/editor/app/dashboard/actions.ts` - Added changeTeamMemberRole + removeTeamMember with full RBAC + OWNER protection
- `apps/editor/app/dashboard/teams/[teamId]/members/page.tsx` - Server component: fetches team+members, determines currentUserRole, renders header + MembersTable
- `apps/editor/app/dashboard/teams/[teamId]/members/_components/MembersTable.tsx` - Client table: role-gated RoleSelect/RemoveMemberButton per row
- `apps/editor/app/dashboard/teams/[teamId]/members/_components/RoleSelect.tsx` - Client select: useTransition + changeTeamMemberRole + router.refresh()
- `apps/editor/app/dashboard/teams/[teamId]/members/_components/RemoveMemberButton.tsx` - Client button: inline confirm + removeTeamMember + router.refresh()

## Decisions Made

- `router.refresh()` chosen over optimistic UI — simpler and consistent with the server-driven data model used throughout the dashboard
- OWNER role protected at the action level (not just UI) — cannot be assigned, demoted, or removed regardless of caller
- Self-remove blocked at action level; a "leave team" flow is deferred to a future phase
- Inline confirm written directly in RemoveMemberButton to avoid importing DeleteConfirmModal across component boundaries

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Human Verification Results

All 8 test scenarios passed:
- Test 1: TEAM-01 — Create teamspace, sidebar highlight
- Test 2: TEAM-02 + TEAM-03 — Invite member, accept invite, member appears with correct role
- Test 3: TEAM-04 — Role change + removal without page reload
- Test 4: TEAM-05 — Shared projects visible to invited member
- Test 5: TEAM-06 — Multi-team switching, project grid + sidebar highlight update
- Test 6: Authorization gates — VIEWER sees read-only; direct API call returns 403
- Test 7: Token edge cases — already-used token error redirect; wrong-account token error redirect
- Test 8: OWNER protection — no controls on OWNER row; direct action call throws "Cannot remove team owner"

## Self-Check: PASSED

- `ba0799f` commit exists in git log
- `5985758` commit exists in git log
- `apps/editor/app/dashboard/teams/[teamId]/members/page.tsx` exists
- `apps/editor/app/dashboard/teams/[teamId]/members/_components/MembersTable.tsx` exists
- `apps/editor/app/dashboard/teams/[teamId]/members/_components/RoleSelect.tsx` exists
- `apps/editor/app/dashboard/teams/[teamId]/members/_components/RemoveMemberButton.tsx` exists
- `apps/editor/app/dashboard/actions.ts` contains changeTeamMemberRole + removeTeamMember

## Next Phase Readiness

Phase 5 (Teamspaces) is fully complete — all 6 TEAM requirements (TEAM-01 through TEAM-06) satisfied and human-verified. Phase 6 (Editor) can begin immediately. No blockers.

---
*Phase: 05-teamspaces*
*Completed: 2026-04-30*
