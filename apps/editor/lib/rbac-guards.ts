import { prisma } from "@/lib/prisma";
import type { TeamRole, ProjectRole } from "@/prisma/generated-client";

/**
 * Custom error thrown when a user lacks the required role or team membership.
 * Callers should catch PermissionError separately from generic errors to return 403 responses.
 */
export class PermissionError extends Error {
  name = "PermissionError";

  constructor(message = "Insufficient permissions") {
    super(message);
    // Restore prototype chain (required when extending built-ins in TS/ES5 targets)
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Team role hierarchy — higher rank means more permissions.
 *
 * OWNER(5) > ADMIN(4) > EDITOR(3) > COMMENTER(2) > VIEWER(1)
 */
const teamRoleHierarchy: Record<TeamRole, number> = {
  OWNER: 5,
  ADMIN: 4,
  EDITOR: 3,
  COMMENTER: 2,
  VIEWER: 1,
};

/**
 * Project role hierarchy — higher rank means more permissions.
 *
 * OWNER(4) > EDITOR(3) > COMMENTER(2) > VIEWER(1)
 */
const projectRoleHierarchy: Record<ProjectRole, number> = {
  OWNER: 4,
  EDITOR: 3,
  COMMENTER: 2,
  VIEWER: 1,
};

/**
 * Assert that the user is a member of the team AND holds at least `requiredRole`.
 *
 * @param teamId       - The team to check membership in.
 * @param userId       - The user whose role to evaluate.
 * @param requiredRole - Minimum role needed (inclusive). Use "EDITOR" for mutation access.
 * @returns The user's actual TeamRole on success.
 * @throws PermissionError if the user is not a member or their role rank is too low.
 *
 * Usage example:
 *   await requireTeamRole(teamId, userId, "EDITOR"); // renameProject, deleteProject
 */
export async function requireTeamRole(
  teamId: string,
  userId: string,
  requiredRole: TeamRole,
): Promise<TeamRole> {
  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
    select: { role: true },
  });

  if (!membership) {
    throw new PermissionError("Not a team member");
  }

  const actualRank = teamRoleHierarchy[membership.role];
  const requiredRank = teamRoleHierarchy[requiredRole];

  if (actualRank < requiredRank) {
    throw new PermissionError(`Requires ${requiredRole} role`);
  }

  return membership.role;
}

/**
 * Assert that the user is a member of the project AND holds at least `requiredRole`.
 *
 * @param projectId    - The project to check membership in.
 * @param userId       - The user whose role to evaluate.
 * @param requiredRole - Minimum role needed (inclusive). Use "EDITOR" for write access.
 * @returns The user's actual ProjectRole on success.
 * @throws PermissionError if the project does not exist, the user is not a member,
 *         or their role rank is too low.
 *
 * Usage example:
 *   await requireProjectRole(projectId, userId, "EDITOR");
 */
export async function requireProjectRole(
  projectId: string,
  userId: string,
  requiredRole: ProjectRole,
): Promise<ProjectRole> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      members: {
        where: { userId },
        select: { role: true },
      },
    },
  });

  if (!project) {
    throw new PermissionError("Project not found");
  }

  const memberRecord = project.members[0];
  if (!memberRecord) {
    throw new PermissionError("Not a project member");
  }

  const actualRank = projectRoleHierarchy[memberRecord.role];
  const requiredRank = projectRoleHierarchy[requiredRole];

  if (actualRank < requiredRank) {
    throw new PermissionError(`Requires ${requiredRole} role`);
  }

  return memberRecord.role;
}

/**
 * Assert that the user is a member of the team (any role).
 *
 * Lighter alternative to requireTeamRole when you only need to verify membership
 * without a minimum role requirement — e.g., before creating a project in the team.
 *
 * @param teamId  - The team to check membership in.
 * @param userId  - The user to verify.
 * @returns void on success.
 * @throws PermissionError("Not a team member") if no matching TeamMember record exists.
 *
 * Usage example:
 *   await assertTeamMember(teamId, userId); // createProject gating
 */
export async function assertTeamMember(
  teamId: string,
  userId: string,
): Promise<void> {
  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
    select: { id: true },
  });

  if (!membership) {
    throw new PermissionError("Not a team member");
  }
}
