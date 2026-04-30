---
phase: 05-teamspaces
plan: 03
subsystem: ui
tags: [nextjs, prisma, react, teamspaces, rbac, server-actions]

requires:
  - phase: 05-01
    provides: Team schema, createTeam action, sidebar team navigation
  - phase: 05-02
    provides: Invite token API, InviteMemberModal

provides:
  - changeTeamMemberRole server action with OWNER/ADMIN authorization guard
  - removeTeamMember server action with OWNER protection and self-remove guard
  - Members page listing all team members with role badges
  - MembersTable client component with inline role editing and remove controls
  - RoleSelect client component — useTransition + router.refresh() for live updates
  - RemoveMemberButton client component — inline confirm dialog + router.refresh()

affects: [06-editor-integration, future-members-management]

tech-stack:
  added: []
  patterns:
    - "Server action authorization: fetch actor membership, check OWNER/ADMIN, guard OWNER targets"
    - "Live UI updates via router.refresh() after server action — no full page reload"
    - "useTransition for pending state during server action calls"
    - "Inline confirm pattern for destructive actions (no modal dependency)"

key-files:
  created:
    - apps/editor/app/dashboard/teams/[teamId]/members/page.tsx
    - apps/editor/app/dashboard/teams/[teamId]/members/_components/MembersTable.tsx
    - apps/editor/app/dashboard/teams/[teamId]/members/_components/RoleSelect.tsx
    - apps/editor/app/dashboard/teams/[teamId]/members/_components/RemoveMemberButton.tsx
  modified:
    - apps/editor/app/dashboard/actions.ts

key-decisions:
  - "OWNER role fully protected: cannot be assigned, demoted, or removed via any UI action"
  - "Self-remove blocked at action level (Cannot remove yourself) — separate leave-team flow deferred"
  - "router.refresh() chosen over optimistic UI — simpler, consistent with server-driven data model"
  - "Inline confirm in RemoveMemberButton (no DeleteConfirmModal import) — avoids cross-component dependency"

patterns-established:
  - "Authorization pattern: actorMembership check before any mutation; target OWNER guard before any role/remove op"
  - "revalidatePath triple: members list + team page + dashboard — covers all stale caches"

duration: continuation
completed: 2026-04-30
---

# Phase 05 Plan 03: Members Page Summary

**Role change and member removal UI with OWNER protection, ADMIN authorization guards, and live updates via router.refresh() — completes TEAM-04**

## Performance

- **Duration:** continuation (tasks committed in prior session)
- **Completed:** 2026-04-30
- **Tasks:** 2 of 2 auto tasks complete (Task 3 = human-verify checkpoint, pending)
- **Files modified:** 5

## Accomplishments

- `changeTeamMemberRole` and `removeTeamMember` server actions with full RBAC: OWNER/ADMIN can act, OWNER rows are immutable, self-remove blocked
- Members page server component fetches team with ordered members and passes structured props to client table
- MembersTable shows role badge (read-only) for VIEWER/EDITOR/COMMENTER/OWNER; shows RoleSelect + RemoveMemberButton for OWNER/ADMIN managing non-owner rows
- RoleSelect uses `useTransition` for pending state; errors surface inline below the select
- RemoveMemberButton shows inline confirm (no modal library) before calling action; row disappears on router.refresh()

## Task Commits

1. **Task 1: Server actions — changeTeamMemberRole + removeTeamMember** - `ba0799f` (feat)
2. **Task 2: Members page + table + role/remove client components** - `5985758` (feat)

## Files Created/Modified

- `apps/editor/app/dashboard/actions.ts` — added changeTeamMemberRole + removeTeamMember (appended to existing file)
- `apps/editor/app/dashboard/teams/[teamId]/members/page.tsx` — server component; fetches team.members with user relation, guards access, passes to MembersTable
- `apps/editor/app/dashboard/teams/[teamId]/members/_components/MembersTable.tsx` — grid table with Avatar+Name, Email, Role, Actions columns; canManage logic gates controls
- `apps/editor/app/dashboard/teams/[teamId]/members/_components/RoleSelect.tsx` — select with ADMIN/EDITOR/COMMENTER/VIEWER options, useTransition, error display
- `apps/editor/app/dashboard/teams/[teamId]/members/_components/RemoveMemberButton.tsx` — confirm-then-remove inline pattern, pending state, error display

## Decisions Made

- OWNER role fully protected at action level: `if (role === "OWNER") throw` and `if (targetMembership.role === "OWNER") throw` — no UI bypass possible
- Self-remove blocked (`targetUserId === actorId` check) — leave-team flow deferred to future phase
- `router.refresh()` over optimistic UI — simpler and consistent with server-driven data model; avoids stale optimistic state
- Inline confirm in RemoveMemberButton rather than importing DeleteConfirmModal — avoids cross-component coupling

## Deviations from Plan

None — plan executed exactly as written. Both server actions and all four UI files match plan specification.

## Issues Encountered

Pre-existing TypeScript errors exist in `packages/editor` (3D editor package) unrelated to dashboard/teamspaces work. These are not regressions introduced by this plan.

## Human Verification Status

Task 3 (human-verify checkpoint) is pending. See 05-03-PLAN.md for 8 test scenarios covering TEAM-01 through TEAM-06 and authorization edge cases.

## Next Phase Readiness

- Full Phase 5 teamspaces stack is code-complete pending human verification
- TEAM-01 (create team), TEAM-02/03 (invite+accept), TEAM-04 (role change+remove), TEAM-05 (shared projects), TEAM-06 (multi-team switching) all implemented
- Phase 6 can begin after human verification approval

---
*Phase: 05-teamspaces*
*Completed: 2026-04-30*
