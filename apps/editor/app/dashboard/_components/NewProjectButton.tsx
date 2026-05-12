'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { CreateProjectModal } from './CreateProjectModal'

export function NewProjectButton({ 
  teamId, 
  label = 'Design file' 
}: { 
  teamId?: string; 
  label?: string 
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 bg-[#0d99ff] hover:bg-[#0b85de] text-white text-[13px] font-medium rounded transition-colors"
      >
        <Plus size={16} />
        <span>{label}</span>
      </button>
      
      <CreateProjectModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        teamId={teamId}
      />
    </>
  )
}
