"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { changeTeamMemberRole } from "@/app/dashboard/actions"
import type { TeamRole } from "@/prisma/generated-client"

const ASSIGNABLE_ROLES: TeamRole[] = ["ADMIN", "EDITOR", "COMMENTER", "VIEWER"]

interface RoleSelectProps {
  teamId: string
  userId: string
  currentRole: TeamRole
}

export function RoleSelect({ teamId, userId, currentRole }: RoleSelectProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value as TeamRole
    setError(null)
    startTransition(async () => {
      try {
        await changeTeamMemberRole(teamId, userId, newRole)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to change role")
      }
    })
  }

  return (
    <div className="flex flex-col gap-1">
      <select
        value={currentRole}
        onChange={handleChange}
        disabled={isPending}
        className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {ASSIGNABLE_ROLES.map((role) => (
          <option key={role} value={role}>
            {role.charAt(0) + role.slice(1).toLowerCase()}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-xs text-red-400">{error}</span>
      )}
      {isPending && (
        <span className="text-xs text-zinc-500">Saving…</span>
      )}
    </div>
  )
}
