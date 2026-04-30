"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { removeTeamMember } from "@/app/dashboard/actions"

interface RemoveMemberButtonProps {
  teamId: string
  userId: string
  userName: string
}

export function RemoveMemberButton({
  teamId,
  userId,
  userName,
}: RemoveMemberButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleClick() {
    setConfirming(true)
    setError(null)
  }

  function handleCancel() {
    setConfirming(false)
    setError(null)
  }

  function handleConfirm() {
    startTransition(async () => {
      try {
        await removeTeamMember(teamId, userId)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to remove member")
        setConfirming(false)
      }
    })
  }

  if (confirming) {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-300">
            Remove{" "}
            <span className="font-medium text-white">
              {userName}
            </span>
            ?
          </span>
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className="px-2 py-1 text-xs rounded-md bg-red-600 hover:bg-red-500 text-white font-medium disabled:opacity-50"
          >
            {isPending ? "Removing…" : "Confirm"}
          </button>
          <button
            onClick={handleCancel}
            disabled={isPending}
            className="px-2 py-1 text-xs rounded-md bg-zinc-700 hover:bg-zinc-600 text-white disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    )
  }

  return (
    <button
      onClick={handleClick}
      className="px-3 py-1.5 text-xs rounded-md bg-zinc-800 hover:bg-red-900/40 border border-zinc-700 hover:border-red-700 text-zinc-300 hover:text-red-300 transition-colors font-medium"
    >
      Remove
    </button>
  )
}
