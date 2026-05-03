'use client'

import { useState, useTransition } from 'react'
import { updateUserProfile } from '../actions'

interface EditProfileFormProps {
  initialName: string | null
  initialImage: string | null
  // Email is read-only in v1 — displayed for reference only, not editable
  // (changing email would require re-verification flow, deferred to future phase)
  email: string
}

export function EditProfileForm({ initialName, initialImage, email }: EditProfileFormProps) {
  const [name, setName] = useState(initialName ?? '')
  const [image, setImage] = useState(initialImage ?? '')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    startTransition(async () => {
      try {
        await updateUserProfile({ name: name.trim(), image: image.trim() })
        setSuccess(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update profile')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email — read-only */}
      <div>
        <label className="block text-sm font-medium text-white/60 mb-1">Email</label>
        <input
          type="email"
          value={email}
          readOnly
          disabled
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/40 cursor-not-allowed"
        />
        <p className="mt-1 text-xs text-white/40">Email cannot be changed in v1.</p>
      </div>

      {/* Display Name */}
      <div>
        <label htmlFor="profile-name" className="block text-sm font-medium text-white/80 mb-1">
          Display Name
        </label>
        <input
          id="profile-name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={80}
          placeholder="Your name"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Avatar URL */}
      <div>
        <label htmlFor="profile-image" className="block text-sm font-medium text-white/80 mb-1">
          Avatar URL
        </label>
        <input
          id="profile-image"
          type="url"
          value={image}
          onChange={e => setImage(e.target.value)}
          maxLength={1024}
          placeholder="https://example.com/avatar.jpg"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <p className="mt-1 text-xs text-white/40">Leave blank to clear your avatar.</p>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {success && <p className="text-sm text-green-400">Profile updated successfully.</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? 'Saving…' : 'Save Profile'}
      </button>
    </form>
  )
}
