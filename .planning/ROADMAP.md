# Roadmap: PascalEditor

## Overview

The editor core is complete. This roadmap builds the surrounding platform: marketing, auth polish, onboarding, a Figma-styled dashboard, teamspace management, a community marketplace, and public designer profiles. Each phase delivers a coherent, independently verifiable capability before the next unlocks.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Landing** - Visitor-facing marketing page that converts to sign-up ✓ 2026-04-29
- [x] **Phase 2: Authentication** - Email/password polish + Google OAuth + password reset ✓ 2026-04-29
- [ ] **Phase 3: Onboarding** - Multi-step first-run flow that contextualizes the product
- [ ] **Phase 4: Dashboard** - Figma-styled project home with grid, recents, starred, and sidebar
- [x] **Phase 5: Teamspaces** - Create teams, invite members by role, and switch between them ✓ 2026-04-30
- [ ] **Phase 5.1: Email + Auth Hardening** [INSERTED] - Resend email provider, email verification, rate limiting on auth endpoints
- [ ] **Phase 5.2: RBAC Enforcement + Soft Delete** [INSERTED] - Enforce roles in all server actions, archive/soft-delete for projects
- [ ] **Phase 5.3: Search, Navigation + Settings** [INSERTED] - Server-side search, sort/filter on project grid, breadcrumbs, settings page
- [ ] **Phase 5.4: Audit Log + Notifications** [INSERTED] - Append-only audit events table, in-app notification bell + email notifications
- [ ] **Phase 6: Marketplace** - Browse, publish, and duplicate public 3D+2D scenes
- [ ] **Phase 7: Designer Profiles** - Public Dribbble-style portfolio pages with contact

## Phase Details

### Phase 1: Landing
**Goal**: Visitors understand the product value and can reach sign-up or login in one click
**Depends on**: Nothing (first phase)
**Requirements**: LAND-01, LAND-02, LAND-03
**Success Criteria** (what must be TRUE):
  1. Visitor lands on the page and sees a clear product headline, feature highlights, and a call-to-action button within the viewport
  2. Visitor can click "Sign Up" or "Log In" from the landing page and reach the correct auth form
  3. Sharing the landing URL on Slack/Twitter produces a populated preview card (OG image + title + description)
**Plans**: 2 plans

Plans:
- [ ] 01-01-PLAN.md — Audit & polish landing UI; standardize CTAs to /signup; verify responsive
- [ ] 01-02-PLAN.md — Add app/opengraph-image.tsx and twitter-image.tsx via next/og ImageResponse

---

### Phase 2: Authentication
**Goal**: Users can securely create accounts, sign in via email or Google, reset passwords, and stay signed in
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04
**Success Criteria** (what must be TRUE):
  1. New user can create an account with email and password and is redirected into the app
  2. Existing user can sign in with their Google account via OAuth without creating a separate password
  3. User who forgot their password receives a reset link by email and can set a new password
  4. Signed-in user refreshes the page or reopens the tab and remains authenticated without re-entering credentials
**Plans**: 2 plans

Plans:
- [ ] 02-01-PLAN.md — Google OAuth provider with signIn upsert callback (no Prisma adapter); Continue with Google buttons on /login & /signup; verifies AUTH-04
- [ ] 02-02-PLAN.md — Password reset flow: PasswordResetToken model, forgot-password & reset-password API routes and pages (v1: URL shown in UI, no email)

---

### Phase 3: Onboarding
**Goal**: First-time users are guided through role, use-case, and team setup so they arrive at the dashboard with context and a project ready
**Depends on**: Phase 2
**Requirements**: ONBD-01, ONBD-02, ONBD-03, ONBD-04, ONBD-05, ONBD-06, ONBD-07
**Success Criteria** (what must be TRUE):
  1. After creating an account, user is automatically routed to onboarding (not the dashboard)
  2. User can select their role (architect / designer / homeowner / student) and a use case, and choices are visible on later steps
  3. User can navigate back to a previous step and their earlier selections are still present
  4. User who refreshes mid-onboarding is returned to the step they were on, not step 1
  5. User completes onboarding and lands on the dashboard (or editor if they created a first project)
**Plans**: 2 plans

Plans:
- [ ] 03-01-PLAN.md — Schema additions (onboardingComplete, OnboardingProgress, OrganizationInviteToken) + JWT callback + middleware gate + signup redirects
- [ ] 03-02-PLAN.md — 4-step onboarding UI (Role, Use Case, Team, First Project) + /invite/[token] route + remove WorkspaceSetupModal

---

### Phase 4: Dashboard
**Goal**: Authenticated users can discover, organize, and open all their projects from a Figma-styled home screen
**Depends on**: Phase 3
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, DASH-06, DASH-07, DASH-08
**Success Criteria** (what must be TRUE):
  1. User sees all their projects displayed as cards with 2D/3D thumbnail previews in a grid layout
  2. A "Recent" section shows the last 6 opened or edited projects without any extra navigation
  3. User can star a project, see it appear in a "Starred" section, and remove the star to un-favourite it
  4. User can create a new blank project from the dashboard and be taken to the editor
  5. User can type in a search box and see only matching projects remain in the grid
  6. User can rename or delete a project from a right-click or kebab context menu on a card
**Plans**: TBD

Plans:
- [ ] 04-01: Dashboard layout — persistent sidebar (Home, Teams, Marketplace, Profile), top bar
- [ ] 04-02: Project grid — thumbnail rendering via viewer package, recent, starred sections
- [ ] 04-03: Project actions — create, rename, delete, search/filter

---

### Phase 5: Teamspaces
**Goal**: Users can create teams, invite collaborators by role, and switch between team workspaces from the sidebar
**Depends on**: Phase 4
**Requirements**: TEAM-01, TEAM-02, TEAM-03, TEAM-04, TEAM-05, TEAM-06
**Success Criteria** (what must be TRUE):
  1. User can create a new teamspace with a name (and optional avatar) and it appears in the sidebar
  2. Team owner can invite a member by email, assigning an Editor / Commenter / Viewer role, and invitee receives an email
  3. Invited user can accept the invitation and immediately sees the team's shared projects view
  4. Team owner or admin can change a member's role or remove them, and the change takes effect without a page reload
  5. User belonging to multiple teams can switch between them from the sidebar and each shows its own project grid
**Plans**: 3 plans

Plans:
- [ ] 05-01-PLAN.md — Schema migration + createTeam + sidebar active-team highlighting + team detail route
- [ ] 05-02-PLAN.md — Invite flow: POST /api/teams/invite, GET /api/teams/invite/accept, InviteMemberModal
- [ ] 05-03-PLAN.md — Member management: role change + remove actions, members page, OWNER protection, human-verify checkpoint

---

### Phase 5.1: Email + Auth Hardening [INSERTED]
**Goal**: Every auth touchpoint sends real email and is protected against abuse — password reset via Resend, email verification on signup, and rate limiting on all auth endpoints
**Depends on**: Phase 5
**Requirements**: AUTH-05, AUTH-06, AUTH-07
**Success Criteria** (what must be TRUE):
  1. User who resets their password receives an email with the reset link (not a URL in the API response)
  2. New user who signs up with email/password receives a verification email and must confirm before accessing the dashboard
  3. Auth endpoints (login, signup, forgot-password) return 429 after repeated failures within a time window
  4. Team invite email is sent to the invitee (not just a URL returned in the modal)
**Plans**: 3 plans

Plans:
- [ ] 05.1-01-PLAN.md � Resend integration + password reset email + team invite email (SHA-256 tokens)
- [ ] 05.1-02-PLAN.md � Email verification flow on credentials signup + verify-email endpoint + NextAuth gate
- [ ] 05.1-03-PLAN.md � Redis rate limiting on signup, forgot-password, and credentials login route handlers

---

### Phase 5.2: RBAC Enforcement + Soft Delete [INSERTED]
**Goal**: Every project mutation checks the caller's role before executing, and deleted projects are archived rather than permanently destroyed
**Depends on**: Phase 5.1
**Requirements**: RBAC-01, PROJ-01
**Success Criteria** (what must be TRUE):
  1. A VIEWER or COMMENTER who calls renameProject or deleteProject receives a 403 — not a silent success
  2. An EDITOR can rename and delete their own team's projects
  3. Deleted projects are moved to an "Archived" state (deletedAt timestamp) and hidden from default views, not hard-deleted
  4. Team OWNER and ADMIN distinction is clearly defined: ADMIN cannot delete the team or transfer ownership
**Plans**: TBD

Plans:
- [ ] 05.2-01: Add role guard helper + enforce in renameProject, deleteProject, createProject server actions
- [ ] 05.2-02: Soft delete — add deletedAt to Project schema, filter from all list queries, add archive/restore actions
- [ ] 05.2-03: Clarify OWNER vs ADMIN permissions in team server actions

---

### Phase 5.3: Search, Navigation + Settings [INSERTED]
**Goal**: Users can find any project instantly via server-side search, navigate with breadcrumbs, sort/filter their project grid, and manage their account from a settings page
**Depends on**: Phase 5.2
**Requirements**: UI-01, UI-02, UI-03, UI-04
**Success Criteria** (what must be TRUE):
  1. Typing in the search bar returns matching projects from the server (not filtered from a client-side array)
  2. Team → Project navigation shows a breadcrumb trail that reflects the current location
  3. Project grid has working sort controls (name, last modified, last opened) and filter by team
  4. /dashboard/settings page exists and allows user to update display name, avatar URL, and password
**Plans**: TBD

Plans:
- [ ] 05.3-01: Server-side search — Prisma full-text or icontains, wired to top bar search input
- [ ] 05.3-02: Breadcrumb component derived from pathname + DB name lookups
- [ ] 05.3-03: Sort + filter controls on project grid
- [ ] 05.3-04: Settings page — profile edit (display name, avatar), password change

---

### Phase 5.4: Audit Log + Notifications [INSERTED]
**Goal**: Team owners have a full audit trail of membership and role changes, and users receive in-app and email notifications for events that affect them
**Depends on**: Phase 5.3
**Requirements**: AUDIT-01, NOTIF-01, NOTIF-02
**Success Criteria** (what must be TRUE):
  1. Team audit log page shows timestamped entries for: member joined, role changed, member removed, project created/deleted
  2. In-app notification bell shows unread count and a dropdown of recent notifications
  3. User receives an email when their team role is changed
  4. User receives an email when they are added to a new team
**Plans**: TBD

Plans:
- [ ] 05.4-01: AuditEvent model + appendAuditEvent helper + log writes in all team/project mutations
- [ ] 05.4-02: Audit log page at /dashboard/teams/[teamId]/audit
- [ ] 05.4-03: Notification model + in-app bell (unread count, dropdown, mark-read)
- [ ] 05.4-04: Email notifications for role change and team join via Resend (reuses 5.1 email setup)

---

### Phase 6: Marketplace
**Goal**: Users can publish their own scenes, browse the community's published work, and duplicate scenes they want into their own workspace
**Depends on**: Phase 5
**Requirements**: MKTPL-01, MKTPL-02, MKTPL-03, MKTPL-04, MKTPL-05, MKTPL-06, MKTPL-07
**Success Criteria** (what must be TRUE):
  1. User can browse a grid of published scenes with thumbnail previews without being logged in
  2. User can search by name or filter by category/tag and see results update
  3. User can open a scene detail page and see an embedded read-only 3D preview, author info, and stats
  4. Authenticated user can click "Duplicate" on a marketplace scene and find a copy in their own dashboard
  5. User can publish one of their own projects to the marketplace with title, description, category, and tags
  6. Publisher can unpublish a scene and it disappears from the marketplace browse grid
**Plans**: TBD

Plans:
- [ ] 06-01: Marketplace data model — publish/unpublish, categories, tags, likes/saves
- [ ] 06-02: Marketplace browse page — grid, search, filter
- [ ] 06-03: Scene detail page — embedded viewer, author info, duplicate action
- [ ] 06-04: Publish flow — publish modal/form from dashboard project card

---

### Phase 7: Designer Profiles
**Goal**: Every user has a public portfolio page discoverable without login, showcasing their published scenes and accepting contact from visitors
**Depends on**: Phase 6
**Requirements**: PROF-01, PROF-02, PROF-03, PROF-04, PROF-05
**Success Criteria** (what must be TRUE):
  1. Visiting /u/username while logged out shows the user's avatar, name, bio, and published scenes
  2. Visitor can click a "Contact" button, fill a message form, and the message is delivered to the designer
  3. Authenticated user can edit their own profile — avatar, display name, bio, social links — and changes appear on their public page immediately
  4. Profile page displays aggregate stats (number of published scenes, total likes) visible to any visitor
**Plans**: TBD

Plans:
- [ ] 07-01: Public profile page — vanity URL routing, avatar, bio, published scenes grid, stats
- [ ] 07-02: Profile edit — settings form for avatar upload, display name, bio, social links
- [ ] 07-03: Contact modal — message form, delivery to designer

---

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Landing | 0/2 | Not started | - |
| 2. Authentication | 0/2 | Not started | - |
| 3. Onboarding | 0/2 | Not started | - |
| 4. Dashboard | 0/2 | Not started | - |
| 5. Teamspaces | 0/3 | Not started | - |
| 6. Marketplace | 0/4 | Not started | - |
| 7. Designer Profiles | 0/3 | Not started | - |
