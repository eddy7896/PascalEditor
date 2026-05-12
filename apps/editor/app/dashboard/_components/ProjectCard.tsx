'use client'

import { useState, Suspense, lazy } from 'react'
import Link from 'next/link'
import type { ProjectRole } from '@/lib/rbac'
import { MoreHorizontal, Trash2, RotateCcw, Layout } from 'lucide-react'
import { deleteProject, restoreProject } from '../actions'

const ProjectPreviewCanvas = lazy(() => import('./ProjectPreviewCanvas'))

type Project = {
  id: string
  name: string
  description: string | null
  thumbnailUrl: string | null
  updatedAt: Date | string
  teamName?: string
  role?: ProjectRole
}

function timeAgo(date: Date | string): string {
  const d = new Date(date)
  const diff = (Date.now() - d.getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export function ProjectCard({ project }: { project: Project }) {
  const [hovered, setHovered] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const isDeleted = project.teamName === 'Deleted'

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await deleteProject(project.id)
    setMenuOpen(false)
  }

  const handleRestore = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await restoreProject(project.id)
    setMenuOpen(false)
  }

  return (
    <div className="group relative flex flex-col gap-3 select-none active:scale-[0.98] transition-transform duration-200">
      <Link href={isDeleted ? '#' : `/editor/${project.id}`} className="block">
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => { setHovered(false); setMenuOpen(false) }}
          className="relative w-full"
        >
          {/* Thumbnail Area */}
          <div className={`relative aspect-[16/10] bg-[#0c0c0c] rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm group-hover:shadow-2xl group-hover:shadow-primary/10 ${
            hovered ? 'border-primary/50 -translate-y-1' : 'border-white/5'
          }`}>
            {hovered && !isDeleted ? (
              <Suspense fallback={<ThumbnailFallback project={project} />}>
                <ProjectPreviewCanvas />
              </Suspense>
            ) : (
              <ThumbnailFallback project={project} />
            )}

            {/* Role badge overlay */}
            {project.role && (
              <div className="absolute top-3 left-3 z-20 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-xl border border-white/10 text-[9px] font-bold text-white uppercase tracking-widest">
                {project.role}
              </div>
            )}

            {/* Context Menu Trigger */}
            <div className={`absolute top-3 right-3 z-30 transition-all duration-300 ${hovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(!menuOpen) }}
                className={`w-7 h-7 flex items-center justify-center backdrop-blur-xl border border-white/10 rounded-full transition-all ${
                  menuOpen ? 'bg-primary border-primary text-white' : 'bg-black/40 hover:bg-black/60 text-white/70 hover:text-white'
                }`}
              >
                <MoreHorizontal size={14} />
              </button>
            </div>

            {/* Custom Dropdown Menu (Apple Style) */}
            {menuOpen && (
              <div className="absolute top-11 right-3 z-40 w-44 bg-[#1c1c1e]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl py-1.5 animate-in fade-in zoom-in duration-200">
                {isDeleted ? (
                  <button 
                    onClick={handleRestore}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-primary text-left text-[13px] font-medium text-white transition-colors"
                  >
                    <RotateCcw size={14} className="opacity-70" /> Restore File
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={(e) => { e.preventDefault(); window.location.href = `/editor/${project.id}` }}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-primary text-left text-[13px] font-medium text-white transition-colors"
                    >
                      <Layout size={14} className="opacity-70" /> Open in Editor
                    </button>
                    <div className="h-px bg-white/5 my-1" />
                    <button 
                      onClick={handleDelete}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-red-500 text-left text-[13px] font-medium text-white transition-colors"
                    >
                      <Trash2 size={14} className="opacity-70" /> Move to Trash
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Info Area */}
          <div className="mt-3 px-1">
            <h3 className="text-[14px] font-semibold text-white truncate group-hover:text-primary transition-colors leading-tight tracking-tight">
              {project.name}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-500 font-medium">
              <span>{isDeleted ? 'Deleted' : `${timeAgo(project.updatedAt)}`}</span>
              {!isDeleted && project.teamName && (
                <>
                  <span className="text-zinc-800">·</span>
                  <span className="truncate max-w-[100px]">{project.teamName}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

function ThumbnailFallback({ project }: { project: Project }) {
  if (project.thumbnailUrl) {
    return (
      <div className="relative w-full h-full">
        <img src={project.thumbnailUrl} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
    )
  }
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-950">
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 shadow-inner">
        <Layout className="w-8 h-8 text-zinc-700" />
      </div>
    </div>
  )
}
