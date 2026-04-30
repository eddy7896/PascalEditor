import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ProjectsGrid } from '../../_components/ProjectsGrid'

interface TeamPageProps {
  params: Promise<{ teamId: string }>
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { teamId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const userId = (session.user as { id: string }).id

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      projects: {
        orderBy: { updatedAt: 'desc' },
      },
      members: {
        include: { user: { select: { id: true, name: true, image: true } } },
      },
    },
  })

  if (!team) notFound()

  const isMember = team.members.some((m) => m.userId === userId)
  if (!isMember) redirect('/dashboard?error=not_member')

  const starredData = await prisma.starredProject.findMany({
    where: { userId },
    select: { projectId: true },
  })
  const starredProjectIds = starredData.map((s) => s.projectId)

  const projects = team.projects.map((p) => ({
    id: p.id,
    name: p.name,
    updatedAt: p.updatedAt,
    lastOpenedAt: p.lastOpenedAt ?? null,
    teamName: team.name,
    description: p.description ?? null,
    thumbnailUrl: p.thumbnailUrl ?? null,
  }))

  return (
    <div className="p-8">
      {/* Team header */}
      <div className="flex items-center gap-4 mb-8">
        {team.avatarUrl ? (
          <img
            src={team.avatarUrl}
            alt={team.name}
            className="w-12 h-12 rounded-xl object-cover border border-white/10"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-lg font-bold text-indigo-300">
            {team.name[0]?.toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{team.name}</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {team.members.length} {team.members.length === 1 ? 'member' : 'members'} &middot; {team.projects.length} {team.projects.length === 1 ? 'project' : 'projects'}
          </p>
        </div>
        <Link
          href={`/dashboard/teams/${teamId}/members`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-300 hover:text-white hover:border-zinc-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Members
        </Link>
      </div>

      {/* Projects */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800/60 border border-zinc-700 flex items-center justify-center mb-4">
            <div className="w-8 h-8 border-2 border-zinc-600 rounded-md" />
          </div>
          <p className="text-zinc-400 font-medium mb-1">No projects yet</p>
          <p className="text-zinc-600 text-sm">Create a project to get started with this team.</p>
        </div>
      ) : (
        <ProjectsGrid projects={projects} starredProjectIds={starredProjectIds} />
      )}
    </div>
  )
}
