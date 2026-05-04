"use client"

import { useState } from "react"
import { InviteMemberModal } from "./InviteMemberModal"

interface Props {
  teamId: string
}

export function InviteMemberModalWrapper({ teamId }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
      >
        + Invite member
      </button>
      <InviteMemberModal
        teamId={teamId}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
