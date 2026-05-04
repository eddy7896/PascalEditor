"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { TeamRole, Prisma } from "@/prisma/generated-client";
import { requireTeamRole, assertTeamMember, PermissionError } from "@/lib/rbac-guards";
import { writeAuditLog } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";
import { sendRoleChangedEmail } from "@/lib/emails/role-changed";

export async function getDashboardData() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      organizations: {
        include: {
          organization: {
            include: {
              teams: {
                include: {
                  projects: true,
                  members: { include: { user: { select: { id: true, name: true, image: true } } } },
                },
              },
              members: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      },
      starredProjects: { select: { projectId: true } },
    },
  });

  if (!user) return null;

  return {
    ...user,
    starredProjectIds: user.starredProjects.map((sp) => sp.projectId),
  };
}

/**
 * Creates a new team and automatically makes the creator the OWNER.
 *
 * The creator is the only way to become OWNER — the role cannot be assigned or transferred
 * via any other action. OWNER status is set once at creation and is immutable thereafter.
 *
 * Role Hierarchy: OWNER > ADMIN > EDITOR > COMMENTER > VIEWER
 *
 * @param input - Team creation input (name, optional avatarUrl, optional organizationId)
 * @returns Newly created team's ID
 */
export async function createTeam(input: { name: string; avatarUrl?: string; organizationId?: string }): Promise<{ id: string }> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) throw new Error("Unauthorized");

  const name = input.name.trim();
  if (!name || name.length > 50) throw new Error("Team name must be 1-50 characters");

  let organizationId = input.organizationId;
  if (!organizationId) {
    const membership = await prisma.organizationMember.findFirst({ where: { userId } });
    if (!membership) throw new Error("No organization — create one first");
    organizationId = membership.organizationId;
  }

  const [team] = await prisma.$transaction([
    prisma.team.create({
      data: {
        organizationId,
        name,
        avatarUrl: input.avatarUrl,
        members: {
          create: { userId, role: "OWNER" },
        },
      },
    }),
  ]);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/teams");
  return { id: team.id };
}

export async function createProject(teamId: string, name: string, description: string): Promise<{ id: string; success: boolean }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) throw new Error("Unauthorized");

  // Check caller is on the team with at least EDITOR role
  try {
    await assertTeamMember(teamId, userId);
    await requireTeamRole(teamId, userId, "EDITOR");
  } catch (error) {
    if (error instanceof PermissionError) {
      throw new Error(error.message);
    }
    throw error;
  }

  const project = await prisma.project.create({
    data: {
      teamId,
      name,
      description,
    },
  });

  if (project.teamId) {
    writeAuditLog({
      teamId: project.teamId,
      actorId: userId,
      targetId: project.id,
      event: "PROJECT_CREATED",
      meta: { projectName: project.name },
    }).catch((err) => console.error("[audit] PROJECT_CREATED write failed:", err));
  }

  revalidatePath("/dashboard/projects");
  revalidatePath("/dashboard");
  return { id: project.id, success: true };
}

export async function getFirstTeamId(): Promise<string | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null
  const userId = (session.user as { id: string }).id
  const member = await prisma.organizationMember.findFirst({
    where: { userId },
    include: {
      organization: {
        include: { teams: { take: 1 } },
      },
    },
  })
  return member?.organization.teams[0]?.id ?? null
}

export async function inviteMember(organizationId: string, email: string, name: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  try {
    // Upsert user
    const invitedUser = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, name },
    });

    // Create org member
    await prisma.organizationMember.create({
      data: {
        organizationId,
        userId: invitedUser.id,
        role: "MEMBER",
      },
    });

    revalidatePath("/dashboard/members");
    return { success: true };
  } catch (error) {
    console.error("Invite error:", error);
    return { success: false, error: "Failed to invite member. They may already be in the organization." };
  }
}

export async function renameProject(projectId: string, name: string) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) throw new Error("Unauthorized");

  // Fetch project to get teamId
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error("Project not found");

  // Check caller has EDITOR+ role in the project's team
  try {
    await requireTeamRole(project.teamId, userId, "EDITOR");
  } catch (error) {
    if (error instanceof PermissionError) {
      throw new Error(error.message);
    }
    throw error;
  }

  await prisma.project.update({
    where: { id: projectId },
    data: { name: name.trim() },
  });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
}

export async function deleteProject(projectId: string) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) throw new Error("Unauthorized");

  // Fetch project to get teamId and verify existence
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error("Project not found");

  // Check caller has EDITOR+ role in the project's team
  try {
    await requireTeamRole(project.teamId, userId, "EDITOR");
  } catch (error) {
    if (error instanceof PermissionError) {
      throw new Error(error.message);
    }
    throw error;
  }

  // Soft delete: set deletedAt timestamp instead of hard-deleting
  await prisma.project.update({
    where: { id: projectId },
    data: { deletedAt: new Date() },
  });

  if (project.teamId) {
    writeAuditLog({
      teamId: project.teamId,
      actorId: userId,
      targetId: projectId,
      event: "PROJECT_DELETED",
      meta: { projectName: project.name },
    }).catch((err) => console.error("[audit] PROJECT_DELETED write failed:", err));
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
}

export async function starProject(projectId: string) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) throw new Error("Unauthorized");
  await prisma.starredProject.create({
    data: { userId, projectId },
  });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
}

export async function unstarProject(projectId: string) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) throw new Error("Unauthorized");
  await prisma.starredProject.delete({
    where: { userId_projectId: { userId, projectId } },
  });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
}

/**
 * Searches projects scoped to the calling user's team memberships.
 *
 * Filters:
 * - Team membership: only projects on teams the user belongs to
 * - Soft-delete: excludes deleted projects unless filter === 'archived'
 * - Case-insensitive name contains match (PostgreSQL mode: 'insensitive')
 * - Optional teamId narrows to a single team
 *
 * @param input.query - Partial name to match (case-insensitive)
 * @param input.sort  - 'name' (asc) | 'modified' (updatedAt desc) | 'opened' (lastOpenedAt desc)
 * @param input.filter - 'all' | 'recent' | 'starred' | 'archived'
 * @param input.teamId - Narrow results to a single team
 */
export async function searchProjects(input: {
  query?: string;
  sort?: "name" | "modified" | "opened";
  filter?: "all" | "recent" | "starred" | "archived";
  teamId?: string | null;
}) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) throw new Error("Unauthorized");

  const where: Prisma.ProjectWhereInput = {
    team: {
      members: {
        some: { userId },
      },
    },
  };

  // Narrow to a single team if requested
  if (input.teamId) {
    where.teamId = input.teamId;
  }

  // Soft-delete: archived filter shows deleted projects; all others hide them
  if (input.filter === "archived") {
    where.deletedAt = { not: null };
  } else {
    where.deletedAt = null;
  }

  // Case-insensitive name search (PostgreSQL supports mode: 'insensitive')
  if (input.query?.trim()) {
    where.name = { contains: input.query.trim(), mode: "insensitive" };
  }

  // Sort mapping
  let orderBy: Prisma.ProjectOrderByWithRelationInput | Prisma.ProjectOrderByWithRelationInput[];
  if (input.sort === "modified") {
    orderBy = { updatedAt: "desc" };
  } else if (input.sort === "opened") {
    // lastOpenedAt exists on Project model; nulls sorted last via desc with null coalescing by Prisma
    orderBy = [{ lastOpenedAt: { sort: "desc", nulls: "last" } }];
  } else {
    // Default: name ascending
    orderBy = { name: "asc" };
  }

  const projects = await prisma.project.findMany({
    where,
    orderBy,
    select: {
      id: true,
      name: true,
      teamId: true,
      team: { select: { id: true, name: true } },
      thumbnailUrl: true,
      updatedAt: true,
      lastOpenedAt: true,
      deletedAt: true,
      createdAt: true,
    },
  });

  return projects;
}

export async function updateLastOpened(projectId: string) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return; // fire-and-forget, no throw
  await prisma.project.update({
    where: { id: projectId },
    data: { lastOpenedAt: new Date() },
  });
  revalidatePath("/dashboard");
}

/**
 * Changes a team member's role within the team.
 *
 * Role Hierarchy: OWNER > ADMIN > EDITOR > COMMENTER > VIEWER
 *
 * Constraints:
 * - OWNER role CANNOT be assigned via UI (owner is only set at team creation)
 * - OWNER role CANNOT be demoted (if the target is OWNER, this throws an error)
 * - Only OWNER and ADMIN can change roles
 * - ADMIN can change roles of EDITOR, COMMENTER, and VIEWER members
 * - Only OWNER can effectively manage ADMIN-level members (ADMIN cannot demote other ADMINs)
 *
 * @param teamId - The team to change the member's role in
 * @param targetUserId - The user whose role is being changed
 * @param role - The new role to assign (cannot be OWNER)
 * @throws {Error} if caller is not OWNER/ADMIN
 * @throws {Error} if trying to assign OWNER role (OWNER is immutable post-creation)
 * @throws {Error} if trying to demote the OWNER
 */
export async function changeTeamMemberRole(
  teamId: string,
  targetUserId: string,
  role: TeamRole,
) {
  const session = await getServerSession(authOptions);
  const actorId = (session?.user as { id?: string } | undefined)?.id;
  if (!actorId) throw new Error("Unauthorized");

  // OWNER role is immutable — can only be set at team creation, never reassigned via UI
  if (role === "OWNER") {
    throw new Error("Cannot assign OWNER role via UI");
  }

  const actorMembership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: actorId } },
  });
  if (!actorMembership || !["OWNER", "ADMIN"].includes(actorMembership.role)) {
    throw new Error("Forbidden");
  }

  const targetMembership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: targetUserId } },
  });
  if (!targetMembership) throw new Error("Member not found");

  // Cannot demote the team OWNER — they hold this role for the team's lifetime
  // This prevents accidentally stranding a team without an owner
  if (targetMembership.role === "OWNER") {
    throw new Error("Cannot change OWNER role");
  }

  await prisma.teamMember.update({
    where: { teamId_userId: { teamId, userId: targetUserId } },
    data: { role },
  });

  writeAuditLog({
    teamId,
    actorId,
    targetId: targetUserId,
    event: "ROLE_CHANGED",
    meta: { oldRole: targetMembership.role, newRole: role },
  }).catch((err) => console.error("[audit] ROLE_CHANGED write failed:", err));

  // Fire-and-forget: email + in-app notification for role change
  const [target, team, actor] = await Promise.all([
    prisma.user.findUnique({ where: { id: targetUserId }, select: { email: true, name: true } }),
    prisma.team.findUnique({ where: { id: teamId }, select: { name: true } }),
    prisma.user.findUnique({ where: { id: actorId }, select: { name: true } }),
  ]);

  const teamUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/dashboard/teams/${teamId}`;

  if (target?.email && team) {
    sendRoleChangedEmail({
      to: target.email,
      teamName: team.name,
      newRole: role,
      oldRole: targetMembership.role,
      changedByName: actor?.name ?? undefined,
      teamUrl,
    }).catch((err) => console.error("[role-changed] email send failed:", err));
  }

  createNotification({
    userId: targetUserId,
    type: "ROLE_CHANGED",
    meta: { teamName: team?.name, newRole: role, oldRole: targetMembership.role },
  }).catch((err) => console.error("[role-changed] notification failed:", err));

  revalidatePath(`/dashboard/teams/${teamId}/members`);
  revalidatePath(`/dashboard/teams/${teamId}`);
  revalidatePath(`/dashboard`);
}

/**
 * Removes a team member from the team.
 *
 * Constraints:
 * - OWNER cannot be removed (prevents leaving the team owner-less)
 * - A member cannot remove themselves (use a dedicated leave-team action for self-removal)
 * - Only OWNER and ADMIN can remove members
 * - ADMIN can remove EDITOR, COMMENTER, and VIEWER members but not the OWNER
 *
 * @param teamId - The team to remove the member from
 * @param targetUserId - The user to remove
 * @throws {Error} if caller is not OWNER/ADMIN
 * @throws {Error} if trying to remove the OWNER (OWNER is permanent for the team's lifetime)
 * @throws {Error} if trying to remove themselves (self-removal deferred to leave-team flow)
 */
export async function removeTeamMember(teamId: string, targetUserId: string) {
  const session = await getServerSession(authOptions);
  const actorId = (session?.user as { id?: string } | undefined)?.id;
  if (!actorId) throw new Error("Unauthorized");

  const actorMembership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: actorId } },
  });
  if (!actorMembership || !["OWNER", "ADMIN"].includes(actorMembership.role)) {
    throw new Error("Forbidden");
  }

  const targetMembership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: targetUserId } },
  });
  if (!targetMembership) throw new Error("Member not found");

  // Cannot remove the team OWNER — ensures the team always has an owner
  // OWNER is the only role that cannot be removed; all other roles (ADMIN, EDITOR, COMMENTER, VIEWER) can be removed
  if (targetMembership.role === "OWNER") {
    throw new Error("Cannot remove team owner");
  }

  // Prevent removing yourself — use dedicated leave-team action instead
  // Self-removal has different UX requirements (confirmation, data transfer prompts)
  if (targetUserId === actorId) {
    throw new Error("Cannot remove yourself");
  }

  await prisma.teamMember.delete({
    where: { teamId_userId: { teamId, userId: targetUserId } },
  });

  writeAuditLog({
    teamId,
    actorId,
    targetId: targetUserId,
    event: "MEMBER_REMOVED",
    meta: { removedRole: targetMembership.role },
  }).catch((err) => console.error("[audit] MEMBER_REMOVED write failed:", err));

  revalidatePath(`/dashboard/teams/${teamId}/members`);
  revalidatePath(`/dashboard/teams/${teamId}`);
  revalidatePath(`/dashboard`);
}
