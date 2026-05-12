'use client'

import { useState, Suspense, lazy } from 'react'
import Link from 'next/link'
import type { ProjectRole } from '@/lib/rbac'

const ProjectPreviewCanvas = lazy(() => import('./ProjectPreviewCanvas'))

type Project = {
  id: string
  name: string
  description: string | null
  thumbnailUrl: string | null
  updatedAt: Date | string
  teamName: string
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

  return (
    <Link href={`/editor/${project.id}`} className="block group">
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="w-full"
      >
        {/* Thumbnail Area */}
        <div className={`relative aspect-[16/10] bg-[#0c0c0c] rounded-lg border transition-all duration-150 overflow-hidden ${
          hovered ? 'border-[#0d99ff] ring-1 ring-[#0d99ff]' : 'border-[#3b3b3b]'
        }`}>
          {hovered ? (
            <Suspense fallback={<ThumbnailFallback thumbnailUrl={project.thumbnailUrl} />}>
              <ProjectPreviewCanvas />
            </Suspense>
          ) : (
            <ThumbnailFallback thumbnailUrl={project.thumbnailUrl} />
          )}

          {/* Role badge overlay */}
          {project.role && (
            <div className="absolute top-2 left-2 z-20 px-1.5 py-0.5 rounded bg-black/50 backdrop-blur-md border border-white/10 text-[10px] font-bold text-zinc-300 uppercase tracking-tight">
              {project.role}
            </div>
          )}
        </div>

        {/* Info Area */}
        <div className="mt-3 px-1">
          <h3 className="text-[13px] font-medium text-white truncate group-hover:text-[#0d99ff] transition-colors leading-tight">
            {project.name}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-500 font-medium">
            <span>Modified {timeAgo(project.updatedAt)}</span>
            <span>·</span>
            <span className="truncate">{project.teamName}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function ThumbnailFallback({ thumbnailUrl }: { thumbnailUrl: string | null }) {
  if (thumbnailUrl) {
    return <img src={thumbnailUrl} alt="" className="w-full h-full object-cover opacity-80" />
  }
  return (
    <div className="w-full h-full flex items-center justify-center bg-[#1e1e1e]">
      <div className="w-10 h-10 rounded-md border border-[#3b3b3b] bg-[#2c2c2c] flex items-center justify-center">
        <div className="w-5 h-5 border border-zinc-600 rounded-sm" />
      </div>
    </div>
  )
}
