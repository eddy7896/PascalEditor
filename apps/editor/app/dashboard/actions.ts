"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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
                  projects: {
                    where: { deletedAt: null }
                  },
                  members: true,
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
    },
  });

  return user;
}

export async function createTeam(organizationId: string, name: string, description: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User not found");

  const team = await prisma.team.create({
    data: {
      organizationId,
      name,
      description,
      members: {
        create: {
          userId: user.id,
        },
      },
    },
  });

  revalidatePath("/dashboard/teams");
  return { success: true, team };
}

export async function createProject(teamId: string, name: string, description: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User not found");

  const project = await prisma.project.create({
    data: {
      teamId,
      userId: user.id,
      name,
      description,
    },
  });

  revalidatePath("/dashboard/projects");
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/teams/${teamId}`);
  return { success: true, project };
}

export async function createDraft(name: string, description?: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User not found");

  const project = await prisma.project.create({
    data: {
      userId: user.id,
      name,
      description,
    },
  });

  revalidatePath("/dashboard/drafts");
  revalidatePath("/dashboard");
  return { success: true, project };
}

export async function getDrafts() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return [];

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return [];

  return prisma.project.findMany({
    where: {
      userId: user.id,
      teamId: null,
      deletedAt: null,
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getTrash() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return [];

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return [];

  return prisma.project.findMany({
    where: {
      userId: user.id,
      deletedAt: { not: null },
    },
    orderBy: { deletedAt: "desc" },
  });
}

export async function deleteProject(projectId: string) {
  await prisma.project.update({
    where: { id: projectId },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
  revalidatePath("/dashboard/drafts");
  revalidatePath("/dashboard/trash");
  return { success: true };
}

export async function inviteMember(organizationId: string, email: string, name: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  try {
    const invitedUser = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, name },
    });

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
    return { success: false, error: "Failed to invite member." };
  }
}

export async function restoreProject(projectId: string) {
  await prisma.project.update({
    where: { id: projectId },
    data: { deletedAt: null },
  });

  revalidatePath("/dashboard/trash");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getTeamData(teamId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      projects: {
        where: { deletedAt: null },
        orderBy: { updatedAt: 'desc' }
      },
      members: {
        include: {
          user: true
        }
      }
    }
  });

  return team;
}
