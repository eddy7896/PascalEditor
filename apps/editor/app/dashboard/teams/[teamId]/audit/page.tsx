// TODO: Add "View audit log" link in /dashboard/teams/[teamId]/page.tsx pointing to this route.
// URL pattern: /dashboard/teams/[teamId]/audit

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireTeamRole, PermissionError } from "@/lib/rbac-guards";
import type { AuditEventType } from "@/prisma/generated-client";

interface AuditPageProps {
  params: Promise<{ teamId: string }>;
}

function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function displayName(
  userId: string | null | undefined,
  userMap: Map<string, { name: string | null; email: string | null }>
): string {
  if (!userId) return "System";
  const user = userMap.get(userId);
  if (!user) return userId;
  return user.name ?? user.email ?? userId;
}

function formatEvent(
  event: AuditEventType,
  meta: Record<string, unknown>,
  actorName: string,
  targetName: string
): string {
  switch (event) {
    case "MEMBER_JOINED":
      return `${actorName} joined as ${String(meta.role ?? "member")}`;
    case "MEMBER_REMOVED":
      return `${actorName} removed ${targetName}`;
    case "ROLE_CHANGED":
      return `${actorName} changed ${targetName}'s role from ${String(meta.oldRole ?? "?")} to ${String(meta.newRole ?? "?")}`;
    case "PROJECT_CREATED":
      return `${actorName} created project ${String(meta.projectName ?? "unknown")}`;
    case "PROJECT_DELETED":
      return `${actorName} deleted project ${String(meta.projectName ?? "unknown")}`;
    default:
      return `${actorName} performed ${event}`;
  }
}

function eventBadgeColor(event: AuditEventType): string {
  switch (event) {
    case "MEMBER_JOINED":
      return "bg-green-500/10 text-green-400 border-green-500/20";
    case "MEMBER_REMOVED":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    case "ROLE_CHANGED":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    case "PROJECT_CREATED":
      return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
    case "PROJECT_DELETED":
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    default:
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  }
}

export default async function AuditLogPage({ params }: AuditPageProps) {
  const { teamId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;

  // RBAC guard: ADMIN and above only
  try {
    await requireTeamRole(teamId, userId, "ADMIN");
  } catch (error) {
    if (error instanceof PermissionError) {
      return (
        <div className="p-8">
          <div className="max-w-xl mx-auto mt-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Access Denied</h2>
            <p className="text-zinc-400 text-sm mb-6">You need ADMIN or OWNER role to view the audit log.</p>
            <Link
              href={`/dashboard/teams/${teamId}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-300 hover:text-white hover:border-zinc-600 transition-colors"
            >
              Back to team
            </Link>
          </div>
        </div>
      );
    }
    throw error;
  }

  // Verify team exists
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { id: true, name: true, avatarUrl: true },
  });
  if (!team) notFound();

  // Fetch last 100 audit entries
  const entries = await prisma.teamAuditLog.findMany({
    where: { teamId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Batch-fetch all referenced users
  const userIds = new Set<string>();
  for (const entry of entries) {
    if (entry.actorId) userIds.add(entry.actorId);
    if (entry.targetId) userIds.add(entry.targetId);
  }

  const users = await prisma.user.findMany({
    where: { id: { in: Array.from(userIds) } },
    select: { id: true, name: true, email: true },
  });

  const userMap = new Map(users.map((u) => [u.id, u]));

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        {team.avatarUrl ? (
          <img
            src={team.avatarUrl}
            alt={team.name}
            className="w-10 h-10 rounded-xl object-cover border border-white/10"
          />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-base font-bold text-indigo-300">
            {team.name[0]?.toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <Link
              href={`/dashboard/teams/${teamId}`}
              className="text-zinc-400 hover:text-white text-sm transition-colors"
            >
              {team.name}
            </Link>
            <span className="text-zinc-600">/</span>
            <span className="text-white text-sm font-medium">Audit Log</span>
          </div>
          <p className="text-xs text-zinc-500">Last 100 events</p>
        </div>
        <Link
          href={`/dashboard/teams/${teamId}`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-300 hover:text-white hover:border-zinc-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </Link>
      </div>

      {/* Audit timeline */}
      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800/60 border border-zinc-700 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <p className="text-zinc-400 font-medium mb-1">No audit events yet</p>
          <p className="text-zinc-600 text-sm">Events will appear here as team members take actions.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
          <div className="divide-y divide-zinc-800">
            {entries.map((entry) => {
              const actor = displayName(entry.actorId, userMap);
              const target = displayName(entry.targetId, userMap);
              const meta = (entry.meta ?? {}) as Record<string, unknown>;
              const description = formatEvent(entry.event, meta, actor, target);
              const badgeClasses = eventBadgeColor(entry.event);

              return (
                <div key={entry.id} className="flex items-start gap-4 px-5 py-4 hover:bg-zinc-800/30 transition-colors">
                  {/* Event type badge */}
                  <span
                    className={`mt-0.5 shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${badgeClasses}`}
                  >
                    {entry.event.replace("_", " ")}
                  </span>

                  {/* Description */}
                  <p className="flex-1 text-sm text-zinc-200 leading-relaxed">{description}</p>

                  {/* Timestamp */}
                  <time
                    dateTime={entry.createdAt.toISOString()}
                    className="shrink-0 text-xs text-zinc-500 mt-0.5 whitespace-nowrap"
                  >
                    {formatTimestamp(entry.createdAt)}
                  </time>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
