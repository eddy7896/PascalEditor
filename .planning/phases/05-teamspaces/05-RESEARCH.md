# Phase 5: Teamspaces - Research

**Researched:** 2026-04-30
**Domain:** Multi-tenant team management — Prisma schema migration, invite token flow, role-based membership, Next.js App Router server actions, sidebar integration
**Confidence:** HIGH (codebase-derived; no speculative third-party library research needed)

---

## Summary

Phase 5 adds team workspace management on top of an already-built dashboard. The core data models (`Team`, `TeamMember`, `Organization`, `OrganizationInviteToken`) exist in the schema but are **incomplete for the requirements**: `TeamMember` has no `role` column, and `OrganizationInviteToken` has no `inviteeEmail` or `role` field, making targeted role-based invitations impossible with the current schema.

The invite flow must follow the established v1 pattern from password reset: generate a token, store it in the DB, return the URL in the API response (no email provider installed), display it in the UI. The same `randomBytes(32).toString("hex")` + expiry pattern should be reused. The `OrganizationInviteToken` model needs a `TeamInviteToken` equivalent (or be extended) to carry `teamId`, `inviteeEmail`, `role`, and `expiresAt`.

The sidebar (`DashboardSidebar.tsx`) already renders a Teams section from server-side props. Switching between teams requires the sidebar to know the "active team" — currently it always shows `firstOrg`'s teams. The pattern to adopt is a URL segment (`/dashboard/teams/[teamId]`) as the source of truth for the active team, which the layout can read and pass down.

**Primary recommendation:** Migrate schema first (add `role` to `TeamMember`, add `TeamInviteToken` model), then build invite flow, then member management CRUD, then wire up sidebar team-switching via `[teamId]` URL routing.

---

## Schema Gaps (Critical — Must Fix Before Any Feature Work)

These are blockers discovered by reading the actual schema. All other planning depends on resolving them.

### Gap 1: `TeamMember` has no `role`

```prisma
// CURRENT — no role field
model TeamMember {
  id      String @id @default(cuid())
  teamId  String
  userId  String
  // ...
}
```

Phase requirement TEAM-02 says invitees get Editor / Commenter / Viewer. The `ProjectRole` enum already has `EDITOR`, `VIEWER`, `COMMENTER`. A new `TeamRole` enum is needed:

```prisma
enum TeamRole {
  OWNER
  ADMIN
  EDITOR
  COMMENTER
  VIEWER
}

model TeamMember {
  id      String   @id @default(cuid())
  teamId  String
  userId  String
  role    TeamRole @default(VIEWER)
  // ...
}
```

### Gap 2: No team-scoped invite token model

`OrganizationInviteToken` is org-scoped and lacks `inviteeEmail`, `role`, and `teamId`. The requirements need a token that encodes which team, what role, and who was invited:

```prisma
model TeamInviteToken {
  id              String    @id @default(cuid())
  token           String    @unique
  teamId          String
  inviteeEmail    String
  role            TeamRole
  createdByUserId String
  expiresAt       DateTime
  usedAt          DateTime?
  usedByUserId    String?

  team            Team      @relation(fields: [teamId], references: [id], onDelete: Cascade)

  createdAt       DateTime  @default(now())

  @@index([token])
  @@index([teamId])
  @@index([inviteeEmail])
}
```

### Gap 3: `Team` has no `avatarUrl` / `slug`

Success criterion 1 mentions optional avatar. No `avatarUrl` or `slug` on `Team`. Add optionally:

```prisma
model Team {
  // ...
  avatarUrl  String?
  slug       String?  // useful for URL routing, @@unique([organizationId, slug])
}
```

---

## Standard Stack

### Core (already installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.1 | App Router, server actions, route handlers | Already in use |
| Prisma | 5.10.0 | ORM, schema migration | Already in use |
| next-auth | ^4.24.14 | JWT session, auth | Already in use |
| Tailwind CSS | (installed) | Styling | Already in use |

### No New Dependencies Required

All requirements can be implemented with what is already installed:
- Invite token: use `randomBytes(32).toString("hex")` from `node:crypto` (same as password reset)
- Email: v1 pattern — return URL in response, display in UI (no email provider installed)
- Role switching UI: Tailwind + React state (no extra component library needed)

### If Email Sending is Needed (v2)

| Library | Version | Purpose |
|---------|---------|---------|
| resend | ^3.x | Transactional email | Install only if email is required in this phase |

The prior password reset precedent strongly suggests email is deferred. Confirm with phase owner before installing.

---

## Architecture Patterns

### Recommended File Structure

```
apps/editor/
├── app/
│   ├── dashboard/
│   │   ├── _components/
│   │   │   ├── DashboardSidebar.tsx       # extend: active team highlight, team switcher
│   │   │   └── TeamSwitcher.tsx           # new: dropdown/list for multi-team switching
│   │   ├── teams/
│   │   │   ├── [teamId]/
│   │   │   │   ├── page.tsx               # team projects view (shared projects grid)
│   │   │   │   ├── members/
│   │   │   │   │   └── page.tsx           # member management for this team
│   │   │   │   └── invite/
│   │   │   │       └── page.tsx           # invite modal or page
│   │   │   └── page.tsx                   # redirect to first team or team list
│   │   ├── actions.ts                     # extend with team actions
│   │   └── layout.tsx                     # extend: pass activeTeamId from URL
│   └── api/
│       └── teams/
│           └── invite/
│               ├── route.ts               # POST: create TeamInviteToken
│               └── accept/
│                   └── route.ts           # GET ?token=...: accept invite, create TeamMember
├── prisma/
│   └── schema.prisma                      # add TeamRole, TeamInviteToken, TeamMember.role
```

### Pattern 1: URL-Driven Active Team

The sidebar currently hardcodes `firstOrg`'s teams. Use `params.teamId` from the URL segment as the source of truth:

```typescript
// app/dashboard/teams/[teamId]/layout.tsx
export default async function TeamLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { teamId: string }
}) {
  // Pass activeTeamId down via props or server context
  // Sidebar can highlight the active team from URL
}
```

The `DashboardSidebar` should receive `activeTeamId?: string` and highlight the matching team entry.

### Pattern 2: Invite Token Flow (follows existing password reset pattern)

```typescript
// POST /api/teams/invite
import { randomBytes } from "node:crypto"

const token = randomBytes(32).toString("hex")
const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000) // 48h

await prisma.teamInviteToken.create({
  data: { token, teamId, inviteeEmail, role, createdByUserId, expiresAt }
})

const inviteUrl = `${process.env.NEXTAUTH_URL}/invite/accept?token=${token}`
// v1: return inviteUrl in response body, display in UI
return NextResponse.json({ success: true, inviteUrl })
```

```typescript
// GET /api/teams/invite/accept?token=...
// 1. Validate token exists, not expired, not used
// 2. Check inviteeEmail matches session user email (or allow any — decide in plan)
// 3. Upsert TeamMember with role from token
// 4. Mark token as used (usedAt, usedByUserId)
// 5. Redirect to /dashboard/teams/[teamId]
```

### Pattern 3: Server Action for Role Change / Removal

Follow the existing actions.ts pattern — no API route needed:

```typescript
// In actions.ts
export async function changeTeamMemberRole(teamId: string, userId: string, role: TeamRole) {
  const session = await getServerSession(authOptions)
  const actorId = (session?.user as { id?: string })?.id
  if (!actorId) throw new Error("Unauthorized")

  // Authorization: actor must be OWNER or ADMIN of the team
  const actorMembership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: actorId } }
  })
  if (!actorMembership || !['OWNER', 'ADMIN'].includes(actorMembership.role)) {
    throw new Error("Forbidden")
  }

  await prisma.teamMember.update({
    where: { teamId_userId: { teamId, userId } },
    data: { role }
  })
  revalidatePath(`/dashboard/teams/${teamId}/members`)
}
```

### Pattern 4: Multi-Team Sidebar Switcher

The sidebar currently shows all teams as nav links to `/dashboard/teams`. For multi-team support, each link should go to `/dashboard/teams/[teamId]` and the active one should be highlighted.

```typescript
// DashboardSidebar: change from
href={`/dashboard/teams`}
// to
href={`/dashboard/teams/${team.id}`}
// and add
const isActive = pathname.startsWith(`/dashboard/teams/${team.id}`)
```

### Anti-Patterns to Avoid

- **Hardcoding `organizations[0]`**: The current teams/page.tsx and members/page.tsx do `data.organizations[0]`. For multi-team this needs to be parameterized by `teamId` from the URL, not array index.
- **getDashboardData() for team detail pages**: This action fetches everything including all projects. For team-specific pages, write focused queries: `getTeamWithMembers(teamId)`.
- **Upsert-then-add-member for invites (current inviteMember pattern)**: This immediately adds the user without acceptance. Phase 5 requires a proper invite/accept flow — do not reuse the current `inviteMember` action for the new flow.
- **Missing authorization checks**: `createTeam` and `inviteMember` in actions.ts do not check that the acting user is actually an org OWNER/ADMIN. Add role checks before any write.
- **Role change without page reload**: Success criterion 4 says "without page reload." Use `router.refresh()` (Next.js App Router) after a server action completes — this re-fetches Server Component data without a full navigation.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Secure random tokens | Custom UUID | `randomBytes(32).toString("hex")` from `node:crypto` | Cryptographically secure, same pattern already used in password reset |
| Token expiry check | Custom date math in every handler | Single helper: `token.expiresAt > new Date() && !token.usedAt` | Centralize to avoid clock bugs |
| Role authorization | Ad-hoc checks scattered in UI | Authorization check at the top of every server action that mutates | Actions are the auth boundary in App Router |

**Key insight:** This phase is primarily data modeling + CRUD + token flow. All the hard infrastructure (auth, DB, routing) is already in place. The risk is in schema correctness and authorization gaps, not in novel library usage.

---

## Common Pitfalls

### Pitfall 1: Missing `@@unique([teamId, userId])` on new TeamMember fields

**What goes wrong:** Duplicate TeamMember rows created if invite is accepted twice or if a user is added manually and then via invite.
**Why it happens:** Prisma's `create` doesn't enforce uniqueness at the application layer.
**How to avoid:** The `@@unique([teamId, userId])` constraint already exists on `TeamMember`. Use `upsert` or catch unique constraint errors when accepting invites.
**Warning signs:** P2002 Prisma error in server logs.

### Pitfall 2: Invite token not scoped to inviteeEmail

**What goes wrong:** Anyone with the link can accept the invite and join the team with the role meant for someone else.
**Why it happens:** Token-only validation without checking who is accepting.
**How to avoid:** On accept, verify `session.user.email === token.inviteeEmail`. If user is not logged in, redirect to login with `callbackUrl` pointing back to the accept URL.
**Warning signs:** Members appearing in teams who were not invited.

### Pitfall 3: `revalidatePath` not covering all affected paths

**What goes wrong:** After role change or removal, the UI shows stale data even though the DB was updated.
**Why it happens:** App Router caches RSC output. If `revalidatePath` doesn't match the exact path rendered, the old data persists.
**How to avoid:** Revalidate `/dashboard/teams/[teamId]/members` AND `/dashboard` (layout might show member counts). Also call `router.refresh()` from the client after the action resolves.
**Warning signs:** Changes appear after manual page reload but not after action.

### Pitfall 4: Layout fetches only `firstOrg` teams

**What goes wrong:** Users in multiple orgs or with multiple teams only see the first org's teams in the sidebar.
**Why it happens:** `layout.tsx` hardcodes `const firstOrg = memberships[0]?.organization`.
**How to avoid:** Pass ALL orgs and ALL their teams to the sidebar. The sidebar can group by org or flatten. Or: make the layout URL-aware (read `teamId` from path and use it to select the active org).
**Warning signs:** Switching teams in sidebar doesn't change the projects shown.

### Pitfall 5: `TeamMember` role migration breaks existing rows

**What goes wrong:** Adding `role TeamRole @default(VIEWER)` to TeamMember runs fine for new rows but existing `TeamMember` rows (team creators) will become VIEWER, not OWNER.
**Why it happens:** The default is applied to existing rows in the migration.
**How to avoid:** After the `prisma migrate dev`, run a data migration: set `role = 'OWNER'` for the user who created each team (identifiable by cross-referencing team creator with `createTeam` action pattern — first member added). Write this as a seed script or migration step.
**Warning signs:** Team creator can't manage their own team after migration.

---

## Code Examples

### Accept Invite Route Handler

```typescript
// Source: password reset pattern in apps/editor/app/api/auth/forgot-password/route.ts
// app/api/teams/invite/accept/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token")
  if (!token) return NextResponse.redirect("/dashboard?error=invalid_token")

  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    // Redirect to login, then back here
    return NextResponse.redirect(`/login?callbackUrl=/api/teams/invite/accept?token=${token}`)
  }

  const invite = await prisma.teamInviteToken.findUnique({ where: { token } })
  if (!invite || invite.usedAt || invite.expiresAt < new Date()) {
    return NextResponse.redirect("/dashboard?error=expired_token")
  }
  if (invite.inviteeEmail !== session.user.email) {
    return NextResponse.redirect("/dashboard?error=wrong_account")
  }

  const userId = (session.user as { id: string }).id

  await prisma.$transaction([
    prisma.teamMember.upsert({
      where: { teamId_userId: { teamId: invite.teamId, userId } },
      update: { role: invite.role },
      create: { teamId: invite.teamId, userId, role: invite.role },
    }),
    prisma.teamInviteToken.update({
      where: { token },
      data: { usedAt: new Date(), usedByUserId: userId },
    }),
  ])

  return NextResponse.redirect(`/dashboard/teams/${invite.teamId}`)
}
```

### Role Change with router.refresh() (client pattern)

```typescript
// Client component that calls a server action and refreshes
"use client"
import { useRouter } from "next/navigation"
import { changeTeamMemberRole } from "../actions"

export function RoleSelect({ teamId, userId, currentRole }: ...) {
  const router = useRouter()

  async function handleChange(newRole: string) {
    await changeTeamMemberRole(teamId, userId, newRole as TeamRole)
    router.refresh() // Re-fetches RSC data without full navigation
  }
  // ...
}
```

### Sidebar Active Team Highlight

```typescript
// DashboardSidebar.tsx change
// Add activeTeamId prop, change team link hrefs
{teams.map((team, i) => {
  const isActive = activeTeamId === team.id
  return (
    <Link key={team.id} href={`/dashboard/teams/${team.id}`}>
      <div className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-all text-[13px] ${
        isActive
          ? 'bg-white/[0.07] text-white'
          : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]'
      }`}>
        {/* ... */}
      </div>
    </Link>
  )
})}
```

---

## State of the Art

| Old Approach | Current Approach | Impact for This Phase |
|--------------|------------------|-----------------------|
| Pages Router API routes | App Router server actions + route handlers | Use server actions for mutations; route handlers only for GET redirects (invite accept) |
| `getServerSideProps` | RSC + `getServerSession` at component level | Already the pattern in use |
| Email-first invite (send then accept) | Token URL shown in UI (v1 pattern) | Confirmed by password reset precedent in this codebase |

---

## Open Questions

1. **Should invite acceptance require the invitee to have an existing account?**
   - What we know: Password reset requires existing account. Current `inviteMember` upserts the user without confirmation.
   - What's unclear: Should a non-existent user be able to accept an invite (creating their account in the process)?
   - Recommendation: Require existing account for v1 simplicity. If user doesn't exist, show "Create an account first" message with a link to signup.

2. **Multi-org support or single-org assumed?**
   - What we know: `layout.tsx` hardcodes `memberships[0]?.organization`. The sidebar shows one org's teams.
   - What's unclear: Can users belong to multiple organizations in this phase?
   - Recommendation: Keep single-org-active assumption for Phase 5. The sidebar org switcher (`ChevronRight` next to org name) can be wired in a future phase.

3. **Team slug for URL routing vs. team ID?**
   - What we know: `Team` has no `slug` field. URLs would be `/dashboard/teams/[teamId]` using cuid.
   - What's unclear: Is a human-readable slug required?
   - Recommendation: Use `teamId` (cuid) in URLs for v1. Slugs can be added later without breaking routes.

---

## Sources

### Primary (HIGH confidence)
- Direct codebase reading: `apps/editor/prisma/schema.prisma` — schema gaps identified
- Direct codebase reading: `apps/editor/app/dashboard/layout.tsx` — sidebar data flow
- Direct codebase reading: `apps/editor/app/dashboard/_components/DashboardSidebar.tsx` — current team rendering
- Direct codebase reading: `apps/editor/app/dashboard/actions.ts` — existing action patterns
- Direct codebase reading: `apps/editor/app/api/auth/forgot-password/route.ts` — v1 token URL pattern
- Direct codebase reading: `apps/editor/app/dashboard/members/page.tsx` and `teams/page.tsx` — current UI state

### Secondary (MEDIUM confidence)
- Next.js App Router docs: `router.refresh()` for re-fetching RSC data after server action — consistent with App Router design
- Prisma docs: `$transaction` for atomic multi-model writes — standard Prisma pattern

---

## Metadata

**Confidence breakdown:**
- Schema gaps: HIGH — read directly from schema.prisma
- Invite token flow: HIGH — directly modeled on existing password reset pattern in same codebase
- Sidebar integration: HIGH — read DashboardSidebar.tsx and layout.tsx directly
- Authorization patterns: HIGH — read existing actions.ts, identified missing checks
- Multi-team switching: MEDIUM — URL pattern is standard App Router but requires layout refactor not yet attempted

**Research date:** 2026-04-30
**Valid until:** 60 days (stable stack, no fast-moving dependencies)
