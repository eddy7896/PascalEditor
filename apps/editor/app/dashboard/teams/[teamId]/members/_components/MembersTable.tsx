"use client"

import type { TeamRole } from "@/prisma/generated-client"
import { RoleSelect } from "./RoleSelect"
import { RemoveMemberButton } from "./RemoveMemberButton"

interface Member {
  id: string
  userId: string
  role: TeamRole
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  }
}

interface MembersTableProps {
  members: Member[]
  teamId: string
  currentUserRole: TeamRole
  currentUserId: string
}

const ROLE_BADGE: Record<TeamRole, string> = {
  OWNER: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  ADMIN: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  EDITOR: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  COMMENTER: "bg-zinc-700 text-zinc-300 border-zinc-600",
  VIEWER: "bg-zinc-700 text-zinc-300 border-zinc-600",
}

function Avatar({
  name,
  image,
}: {
  name: string | null
  image: string | null
}) {
  if (image) {
    return (
      <img
        src={image}
        alt={name ?? "User"}
        className="w-8 h-8 rounded-full object-cover border border-white/10"
      />
    )
  }
  const initials = (name ?? "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
  return (
    <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-300">
      {initials}
    </div>
  )
}

export function MembersTable({
  members,
  teamId,
  currentUserRole,
  currentUserId,
}: MembersTableProps) {
  const canManage =
    currentUserRole === "OWNER" || currentUserRole === "ADMIN"

  return (
    <div className="rounded-xl border border-zinc-800 overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[1fr_1fr_160px_120px] gap-4 px-5 py-3 bg-zinc-900 border-b border-zinc-800 text-xs font-medium text-zinc-500 uppercase tracking-wider">
        <span>Member</span>
        <span>Email</span>
        <span>Role</span>
        {canManage && <span>Actions</span>}
      </div>

      {/* Rows */}
      <div className="divide-y divide-zinc-800/60">
        {members.map((member) => {
          const isOwner = member.role === "OWNER"
          const isSelf = member.userId === currentUserId
          const showControls = canManage && !isOwner && !isSelf

          return (
            <div
              key={member.id}
              className="grid grid-cols-[1fr_1fr_160px_120px] gap-4 px-5 py-4 items-center bg-zinc-950 hover:bg-zinc-900/60 transition-colors"
            >
              {/* Avatar + Name */}
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={member.user.name} image={member.user.image} />
                <span className="text-sm font-medium text-white truncate">
                  {member.user.name ?? "—"}
                  {isSelf && (
                    <span className="ml-1.5 text-xs text-zinc-500">(you)</span>
                  )}
                </span>
              </div>

              {/* Email */}
              <span className="text-sm text-zinc-400 truncate">
                {member.user.email ?? "—"}
              </span>

              {/* Role */}
              <div>
                {showControls ? (
                  <RoleSelect
                    teamId={teamId}
                    userId={member.userId}
                    currentRole={member.role}
                  />
                ) : (
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${ROLE_BADGE[member.role]}`}
                  >
                    {member.role.charAt(0) + member.role.slice(1).toLowerCase()}
                  </span>
                )}
              </div>

              {/* Actions */}
              {canManage && (
                <div>
                  {showControls ? (
                    <RemoveMemberButton
                      teamId={teamId}
                      userId={member.userId}
                      userName={member.user.name ?? member.user.email ?? "this member"}
                    />
                  ) : (
                    <span className="text-xs text-zinc-700">
                      {isOwner ? "Owner" : ""}
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
