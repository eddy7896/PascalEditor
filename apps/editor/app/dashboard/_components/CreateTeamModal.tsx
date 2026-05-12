'use client'

import { useState } from 'react'
import { X, Users } from 'lucide-react'
import { createTeam } from '../actions'
import { useRouter } from 'next/navigation'

export function CreateTeamModal({ 
  orgId, 
  isOpen, 
  onClose 
}: { 
  orgId: string; 
  isOpen: boolean; 
  onClose: () => void 
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await createTeam(orgId, name, description)
      if (res.success) {
        onClose()
        router.push(`/dashboard/teams/${res.team.id}`)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#2c2c2c] border border-[#3b3b3b] rounded-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#3b3b3b]">
          <h2 className="text-[14px] font-semibold text-white">Create new team</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <X size={16} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="flex items-center justify-center w-12 h-12 rounded bg-indigo-500/10 border border-indigo-500/20 mb-2">
            <Users className="text-indigo-400" size={24} />
          </div>
          
          <div>
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Team Name</label>
            <input
              autoFocus
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Design Team"
              className="w-full bg-[#1e1e1e] border border-[#3b3b3b] rounded px-3 py-2 text-[13px] text-white focus:outline-none focus:border-[#0d99ff] transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this team working on?"
              rows={3}
              className="w-full bg-[#1e1e1e] border border-[#3b3b3b] rounded px-3 py-2 text-[13px] text-white focus:outline-none focus:border-[#0d99ff] transition-colors resize-none"
            />
          </div>
          
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name || isLoading}
              className="px-4 py-2 bg-[#0d99ff] hover:bg-[#0b85de] disabled:opacity-50 disabled:hover:bg-[#0d99ff] text-white text-[13px] font-medium rounded transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
