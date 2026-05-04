"use client"
import { useState, useTransition } from "react"
import { X, Copy, Check } from "lucide-react"

interface InviteMemberModalProps {
  teamId: string
  open: boolean
  onClose: () => void
}

type View = "form" | "result"

const ROLE_OPTIONS = [
  { value: "VIEWER", label: "Viewer", description: "Can view projects and comments" },
  { value: "COMMENTER", label: "Commenter", description: "Can view and leave comments" },
  { value: "EDITOR", label: "Editor", description: "Can edit projects" },
  { value: "ADMIN", label: "Admin", description: "Full access, can manage members" },
]

export function InviteMemberModal({ teamId, open, onClose }: InviteMemberModalProps) {
  const [view, setView] = useState<View>("form")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("VIEWER")
  const [error, setError] = useState<string | null>(null)
  const [inviteUrl, setInviteUrl] = useState("")
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (!open) return null

  const resetForm = () => {
    setView("form")
    setEmail("")
    setRole("VIEWER")
    setError(null)
    setInviteUrl("")
    setCopied(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address.")
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/teams/invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ teamId, email: trimmedEmail, role }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error ?? "Failed to generate invite link.")
          return
        }
        setInviteUrl(data.inviteUrl)
        setView("result")
      } catch {
        setError("Network error. Please try again.")
      }
    })
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: select the input text
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Invite Team Member</h2>
          <button
            onClick={handleClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {view === "form" ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Email address <span className="text-red-400">*</span>
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="colleague@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-zinc-500">
                {ROLE_OPTIONS.find((o) => o.value === role)?.description}
              </p>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2.5 rounded-xl disabled:opacity-50 transition-colors"
            >
              {isPending ? "Generating..." : "Generate invite link"}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-zinc-400">
              Invite link generated. Share it with the invitee.{" "}
              <span className="text-zinc-500">Expires in 48 hours.</span>
            </p>

            <div className="flex gap-2">
              <input
                readOnly
                value={inviteUrl}
                className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none truncate"
              />
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-white px-3 py-2 rounded-xl transition-colors text-sm whitespace-nowrap"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-green-400" />
                    <span className="text-green-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    Copy
                  </>
                )}
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={resetForm}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-white font-medium py-2.5 rounded-xl transition-colors"
              >
                Send another
              </button>
              <button
                onClick={handleClose}
                className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2.5 rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
