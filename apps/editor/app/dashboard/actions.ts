"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { TeamRole } from "@/prisma/generated-client";

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

  const project = await prisma.project.create({
    data: {
      teamId,
      name,
      description,
    },
  });

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
  await prisma.project.delete({ where: { id: projectId } });
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

export async function changeTeamMemberRole(
  teamId: string,
  targetUserId: string,
  role: TeamRole,
) {
  const session = await getServerSession(authOptions);
  const actorId = (session?.user as { id?: string } | undefined)?.id;
  if (!actorId) throw new Error("Unauthorized");

  // Disallow assigning OWNER via this action — owner only set at team creation
  if (role === "OWNER") throw new Error("Cannot assign OWNER role via UI");

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

  // Disallow demoting an OWNER
  if (targetMembership.role === "OWNER") {
    throw new Error("Cannot change OWNER role");
  }

  await prisma.teamMember.update({
    where: { teamId_userId: { teamId, userId: targetUserId } },
    data: { role },
  });

  revalidatePath(`/dashboard/teams/${teamId}/members`);
  revalidatePath(`/dashboard/teams/${teamId}`);
  revalidatePath(`/dashboard`);
}

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

  // Cannot remove the OWNER
  if (targetMembership.role === "OWNER") {
    throw new Error("Cannot remove team owner");
  }

  // Cannot remove yourself via this action
  if (targetUserId === actorId) {
    throw new Error("Cannot remove yourself");
  }

  await prisma.teamMember.delete({
    where: { teamId_userId: { teamId, userId: targetUserId } },
  });

  revalidatePath(`/dashboard/teams/${teamId}/members`);
  revalidatePath(`/dashboard/teams/${teamId}`);
  revalidatePath(`/dashboard`);
}
