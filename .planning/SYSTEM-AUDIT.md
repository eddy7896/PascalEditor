# System Audit: Archly vs Figma
*Auth · Projects · Teams · UI Components*

---

## 1. AUTHENTICATION

### Figma

| Aspect | Detail |
|--------|--------|
| Strategy | Email/password + Google + SAML SSO (Enterprise) |
| Session | Persistent cookies (long-lived, refreshed silently) |
| MFA | TOTP-based 2FA available on all plans |
| Email verification | Required before first login |
| Password policy | Min 8 chars, exposed password check via HIBP |
| Rate limiting | Login throttled (lockout after N failures) |
| SSO | SAML 2.0 for Enterprise; Google Workspace domain enforcement |
| Magic links | Not natively offered; email-only for invites |
| Token handling | Auth tokens stored in HttpOnly cookies; CSRF protection built-in |
| Session refresh | Silent background refresh; persistent "stay signed in" |

**Figma Auth Flow:**
```
Unauthenticated visit
  → figma.com/login
  → email + password OR "Continue with Google"
  → If Google: OAuth → email verified → JWT issued
  → If credentials: email + password → email verify step (new accounts)
  → Session cookie set (HttpOnly, Secure, SameSite=Lax)
  → Redirect to /files (dashboard)
```

---

### Archly (Our System)

| Aspect | Detail |
|--------|--------|
| Strategy | Email/password (bcrypt) + Google OAuth |
| Session | JWT stored in cookie via NextAuth |
| MFA | Not implemented |
| Email verification | Not implemented (neither OAuth nor credentials verify email) |
| Password policy | Min 8 chars on reset only; no frontend validation on signup |
| Rate limiting | None |
| SSO | Not implemented |
| Magic links | Not implemented |
| Token handling | JWT in cookie (NextAuth default — HttpOnly via `set-cookie`) |
| Session refresh | `useSession().update()` for forced refresh (used post-onboarding) |

**Our Auth Flow:**
```
/signup or /login
  → email + password OR "Continue with Google"
  → POST /api/auth/signup → create User (bcrypt hash)
  → signIn('credentials') → NextAuth jwt callback → set onboardingComplete
  → Middleware checks onboardingComplete flag
     → false: redirect /onboarding
     → true: redirect /dashboard
```

**Password Reset (v1 dev shortcut):**
```
POST /api/auth/forgot-password → creates PasswordResetToken
→ returns resetUrl IN RESPONSE BODY (no email provider)
← MUST be replaced with transactional email before production
```

---

### Key Auth Differences

| Dimension | Figma | Archly | Gap |
|-----------|-------|--------|-----|
| Email verification | Required | None | Critical |
| MFA | TOTP 2FA | None | High |
| Rate limiting | Yes (lockout) | None | High |
| SSO | SAML 2.0 Enterprise | None | Future |
| Password reset delivery | Email | URL in response | Critical (v1 hack) |
| Session type | HttpOnly cookie | JWT in cookie (NextAuth) | Low |
| Password exposure check | HIBP integration | None | Medium |
| Persistent login | Yes | Yes | Parity |
| Google OAuth | Yes | Yes | Parity |

---

## 2. PROJECTS

### Figma

**Creation:**
- From dashboard: "New design file", "New FigJam", "Import"
- Template picker (50+ community + team templates)
- File created in-browser; empty canvas starts immediately
- No team required — personal drafts available

**Listing & Organization:**
- "Drafts" — personal workspace, not shared
- Team projects — shared within a team
- Hierarchical: Organization → Team → Project → Files
- Recents + Starred at top level
- Grid and list view toggle
- Thumbnail: auto-generated from canvas content (live preview)

**File Operations:**
- Duplicate (keeps original; copy in same location)
- Move to team/project
- Share link (view / edit / comment per link)
- Download (PDF, PNG, SVG, JSON)
- Export assets directly from editor
- Version history (named saves; restore any version)
- Archive (hidden from view; not deleted)

**Search:**
- Server-side search across all files in org
- Filter by team, type (design/figjam), date

**Access Model:**
- Project-level permissions: can invite by email directly to file
- Link sharing: view-only or edit per link
- Org-wide access controls per team plan

---

### Archly (Our System)

**Creation:**
- From dashboard or team page via CreateProjectModal
- Name + description + team selector
- No templates
- Editor opens at `/editor/[projectId]`
- Requires an existing team (no personal "Drafts" workspace)

**Listing & Organization:**
- `/dashboard` — recent 6 + all projects (paginated only by scroll)
- `/dashboard/projects` — searchable client-side grid
- `/dashboard/teams/[teamId]` — projects per team
- Starred section (toggle, stored in StarredProject table)
- Recent section (lastOpenedAt field updated on open)

**File Operations:**
- Rename (modal → `renameProject()` server action)
- Delete (modal → `deleteProject()` server action, hard delete)
- Star / Unstar (optimistic UI)
- No duplicate
- No move between teams
- No download / export from dashboard
- No version history
- No archive (soft delete)

**Search:**
- Client-side only (string match on loaded projects)
- No server-side search
- No filter by type or date

**Access Model:**
- Team membership grants access to all team projects
- Project-level RBAC schema exists (ProjectMember, ProjectRole) but server actions don't enforce it
- No link sharing

---

### Key Project Differences

| Dimension | Figma | Archly | Gap |
|-----------|-------|--------|-----|
| Personal drafts | Yes | No | Medium |
| Templates | 50+ | None | Medium |
| Thumbnail | Auto-generated (live) | Manual URL or none | High |
| Duplicate file | Yes | No | Medium |
| Move between teams | Yes | No | Medium |
| Version history | Yes (named saves) | No | High |
| Archive (soft delete) | Yes | No (hard delete only) | Medium |
| Link sharing | Yes (view/edit/comment) | No | High |
| Server-side search | Yes | No (client-side) | Medium |
| Export from dashboard | Yes | No | Low |
| Bulk operations | Yes | No | Low |
| Project RBAC enforcement | Enforced at every layer | Schema only, not enforced in actions | High |

---

## 3. TEAMS

### Figma

**Team Hierarchy:**
```
Organization (Enterprise/Team plan)
  └─ Team (has its own space)
      └─ Project (a folder of files)
          └─ File (individual design file)
```

**Roles:**
| Role | Can Do |
|------|--------|
| Owner | Billing, delete org, all admin |
| Admin | Manage members, teams, settings |
| Editor | Edit files, create new files |
| Viewer | View files only (no edit) |
| Viewer (restricted) | Can only see files explicitly shared |

**Team Creation:**
- Create from sidebar
- Name, optional icon
- Invite by email or shareable invite link
- Can create multiple teams under one org

**Invitations:**
- Email invite sent immediately (SMTP)
- Invite link (joinable by anyone with link, configurable)
- Invitee gets email even if they don't have Figma account → sign-up flow with team auto-join
- Guest access available (outside org, file-by-file)
- No token expiry shown in UI (Figma manages internally)

**Member Management:**
- Change roles inline on member list (no page reload)
- Remove member (confirmation)
- Transfer ownership
- Bulk remove / export member list
- View all files a member has access to

**Audit Log (Enterprise):**
- Full log: joins, role changes, file access, exports

**Notifications:**
- Email notification when invited
- Email notification on role change
- In-app notification bell

---

### Archly (Our System)

**Team Hierarchy:**
```
Organization (required wrapper)
  └─ Team
      └─ Project (flat list per team)
```

**Roles:**
| Role | Can Do |
|------|--------|
| OWNER | Manage members, change roles, remove, create projects |
| ADMIN | Same as OWNER minus... (no explicit distinction yet) |
| EDITOR | Create/edit projects |
| COMMENTER | Comment on projects (enforced at schema level only) |
| VIEWER | View only (schema only; no UI enforcement) |

**Team Creation:**
- CreateTeamModal: name + optional avatar URL
- Auto-assigns creator as OWNER
- Appears in sidebar immediately

**Invitations:**
- OWNER/ADMIN can generate invite via InviteMemberModal
- Email + role → POST /api/teams/invite → returns invite URL
- URL returned in response (no email sent — v1)
- Invitee must already have an account (no pre-signup flow)
- Invite is email-specific (wrong account → rejected)
- 48h expiry, single-use token

**Member Management:**
- Members page at `/dashboard/teams/[teamId]/members`
- Role change via dropdown (RoleSelect) → router.refresh()
- Remove member via RemoveMemberButton with confirmation
- OWNER row protected (no dropdown, no remove)
- No self-remove, no ownership transfer

**Notifications:**
- None (no email, no in-app)

**Audit Log:**
- None

---

### Key Team Differences

| Dimension | Figma | Archly | Gap |
|-----------|-------|--------|-----|
| Hierarchy depth | Org → Team → Project → File | Org → Team → Project | Low |
| Pre-signup invite | Yes (new user completes signup + joins) | No (must have account) | High |
| Email on invite | Yes (immediate SMTP) | No (URL in response) | High |
| Invite link (open) | Yes (anyone with link joins) | No (email-specific only) | Medium |
| Guest access | Yes (file-by-file, outside org) | No | Medium |
| Ownership transfer | Yes | No | Medium |
| Bulk member management | Yes | No | Low |
| Role enforcement | Full (every API) | Partial (schema only; actions miss project-level) | High |
| Notifications | Email + in-app | None | High |
| Audit log | Enterprise | None | Medium |
| No. of roles | 4 (Owner/Admin/Editor/Viewer) | 5 (+ Commenter) | Parity+ |
| ADMIN vs OWNER distinction | Clear (billing, delete) | Unclear in actions | Medium |

---

## 4. UI COMPONENTS

### Figma Dashboard

**Layout:**
```
Left sidebar (fixed, 240px)
  ├─ Org switcher (dropdown — multiple orgs)
  ├─ Recents
  ├─ Drafts
  ├─ Teams list (with sub-items per team)
  └─ Plugins / Explore community (footer links)

Top bar (within team/project view)
  ├─ Breadcrumb (Org → Team → Project)
  ├─ Search (global, server-side)
  ├─ Invite button
  ├─ Notifications bell
  └─ User avatar (settings dropdown)

Main content
  ├─ Grid / List toggle
  ├─ Sort: last modified / name / last opened
  ├─ Filter: file type, date
  └─ File cards (auto-thumbnail, name, last modified, shared count)
```

**File Card:**
- Auto-generated thumbnail (live canvas snapshot)
- Hover: animated thumbnail update
- Right-click context menu: Duplicate, Move, Rename, Share, Delete, Add to favorites
- Share modal: invite by email or get link with permission level

**Sidebar Behavior:**
- Collapsible (can hide teams sub-list)
- Drag-and-drop reordering of teams
- Active item highlighted
- Team color coding

**Modals:**
- Share file: email + permission picker + link sharing toggle
- New team: name + icon
- Invite member: email + role + send button
- Delete confirmation: type project name to confirm

---

### Archly (Our System)

**Layout:**
```
Left sidebar (fixed, 220px — DashboardSidebar)
  ├─ Org header (avatar + name, no switcher)
  ├─ Library section
  │   ├─ All projects (count badge)
  │   ├─ Recent
  │   ├─ Starred (count badge)
  │   ├─ Shared with me (placeholder)
  │   └─ Drafts (placeholder)
  ├─ Teams section
  │   ├─ Team items (colored dot + count)
  │   └─ + New team button
  └─ Footer
      ├─ Storage indicator (progress bar)
      ├─ Settings link (not implemented)
      ├─ Sign out
      └─ User profile card

Main content (ml-[220px])
  ├─ Top bar: greeting + "+ New project"
  ├─ Live now banner (last 3 modified)
  └─ Project grid (6 recents + starred)
```

**Project Card:**
- Static thumbnail (URL or fallback wireframe grid)
- Hover: ProjectPreviewCanvas lazy-loads
- Status badge: live/review/draft (time-based)
- Member avatars (first 3)
- Hover overlay: StarButton + ProjectContextMenu (rename, delete)
- No right-click menu (left-click opens editor)

**Sidebar Behavior:**
- Non-collapsible
- Active team highlighted via `usePathname()`
- Team color: 5 hardcoded colors cycling
- No drag-and-drop

**Modals:**
- CreateProjectModal: name + team selector + description
- CreateTeamModal: name + avatar URL
- RenameModal: new name input
- DeleteConfirmModal: "are you sure" text
- InviteMemberModal: email + role + invite URL result view

**Missing UI Patterns:**
- No org switcher
- No global search bar in top bar
- No breadcrumb navigation
- No notifications bell
- No view toggle (grid/list)
- No sort options
- No filter options
- No drag-and-drop reorder
- Settings page linked but not built

---

### Key UI Differences

| Dimension | Figma | Archly | Gap |
|-----------|-------|--------|-----|
| Org switcher | Yes (dropdown, multi-org) | No (single org) | Medium |
| Sidebar collapse | Yes | No | Low |
| Breadcrumb navigation | Yes | No | Medium |
| Global search | Server-side, top bar | Client-side, projects page only | High |
| Notifications bell | Yes | No | High |
| View toggle (grid/list) | Yes | Partial (buttons exist, no list view) | Medium |
| Sort options | Yes (name, date, last opened) | No | Medium |
| Filter options | Yes (type, date, team) | No | Medium |
| Right-click context menu | Yes (full) | No (hover overlay only) | Medium |
| Drag-and-drop | Yes (teams, files) | No | Low |
| File card thumbnail | Auto-generated, live | Static URL or placeholder | High |
| Share from card | Yes (modal + link) | No | High |
| Delete confirmation | Type name to confirm | "Are you sure" click | Low |
| Onboarding flow | Minimal (just name workspace) | 4-step (role, use case, team, project) | Archly leads |
| Dark mode only | No (light default) | Yes (dark default, no toggle) | Low |

---

## 5. CONSOLIDATED GAP ANALYSIS

### Critical (block production launch)

| # | Gap | Area | Fix |
|---|-----|------|-----|
| 1 | Reset URL returned in API response | Auth | Add transactional email (Resend / Postmark) |
| 2 | No email verification | Auth | Verify email on signup (credentials) |
| 3 | No rate limiting on auth endpoints | Auth | Middleware or Upstash rate limiter |
| 4 | Project RBAC not enforced in server actions | Projects | Add ownership check to renameProject, deleteProject |
| 5 | No email sent on team invite | Teams | Add email provider; send invite link via email |

### High (degrade UX significantly)

| # | Gap | Area | Fix |
|---|-----|------|-----|
| 6 | Pre-signup invite flow | Teams | If invitee has no account, redirect to signup with auto-join |
| 7 | Auto-generated thumbnails | Projects | Canvas screenshot or server-side thumbnail generation |
| 8 | Server-side search | Projects | Prisma full-text search or Meilisearch |
| 9 | No notifications | Teams/Auth | Email notifications for invites, role changes |
| 10 | Version history | Projects | Event log or state snapshots per save |
| 11 | Link sharing | Projects | Signed URL or access token per-file |

### Medium (notable gaps vs Figma)

| # | Gap | Area | Fix |
|---|-----|------|-----|
| 12 | No duplicate file | Projects | Copy project record + state |
| 13 | No move between teams | Projects | Update project.teamId + revalidate |
| 14 | No archive / soft delete | Projects | Add deletedAt field; filter from default views |
| 15 | No ownership transfer | Teams | Transfer OWNER role atomically |
| 16 | No audit log | Teams | Append-only event table |
| 17 | ADMIN vs OWNER distinction unclear | Teams | Define what ADMIN can't do vs OWNER |
| 18 | No global search bar | UI | Top bar search input wired to server action |
| 19 | No breadcrumb | UI | Derive from pathname + DB lookup for names |
| 20 | No sort / filter on project grid | UI | Add sort controls, filter by team/date |
| 21 | Settings page not built | UI | Implement /dashboard/settings |

### Low (polish, non-blocking)

| # | Gap | Area | Fix |
|---|-----|------|-----|
| 22 | No MFA | Auth | TOTP (speakeasy/otplib) |
| 23 | No org switcher | UI | Multi-org support in sidebar |
| 24 | No sidebar collapse | UI | Add toggle + localStorage persist |
| 25 | No list view | UI | Implement list layout in ProjectsGrid |
| 26 | No drag-and-drop team ordering | UI | dnd-kit |
| 27 | No notifications bell | UI | In-app notifications table + polling |
| 28 | Hardcoded team colors | UI | User-selectable team color |
| 29 | No dark/light toggle | UI | Tailwind class strategy + localStorage |
| 30 | No bulk project operations | Projects | Multi-select + bulk delete/move |

---

## 6. WHAT ARCHLY DOES DIFFERENTLY (Advantages)

| Dimension | Archly Advantage |
|-----------|-----------------|
| Onboarding | Detailed 4-step onboarding (Figma's is minimal) |
| 3D native | Built-in 3D WebGPU editor (Figma is 2D only) |
| Role granularity | 5 roles including COMMENTER (Figma has 4) |
| Invite security | Email-specific tokens, wrong-account rejection |
| Atomic invite accept | Transaction ensures no partial state |
| Open stack | NextAuth + Prisma + Next.js (fully self-hostable) |
| Marketplace schema | Pre-built data model for community sharing |

---

## 7. ARCHITECTURE SUMMARY

```
FIGMA                              ARCHLY
─────────────────────              ──────────────────────
React (custom renderer)            Next.js 15 App Router
WebSocket (CRDT real-time)         HTTP (server actions + route handlers)
AWS (proprietary infra)            Self-hostable (PostgreSQL + Vercel)
Electron desktop app               Web-only
HttpOnly cookie session            NextAuth JWT in cookie
Email invite (immediate)           Token URL returned in response (v1)
Auto thumbnail (canvas)            Static URL or placeholder
Server-side search                 Client-side search
Enterprise SAML SSO               None
Audit logs                         None
Version history                    None
```

---

*Last updated: 2026-04-30*
*Covers: Phase 5 (Teamspaces) — plans 01–03 complete*
