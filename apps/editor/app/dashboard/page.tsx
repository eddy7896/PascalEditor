import { getDashboardData } from './actions'
import { ProjectCard } from './_components/ProjectCard'
import { Plus, Search, ListFilter, LayoutGrid, ChevronDown } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardOverview() {
  const data = await getDashboardData()

  if (!data || data.organizations.length === 0) {
    return null // Handled by layout or onboarding
  }

  const org = data.organizations[0]!.organization
  const allProjects = org.teams.flatMap((team) =>
    team.projects.map((proj) => ({ ...proj, teamName: team.name }))
  )

  const sortedProjects = [...allProjects].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )

  const groups = groupProjects(sortedProjects)

  return (
    <div className="flex flex-col min-h-screen bg-[#1e1e1e] text-zinc-300 font-sans">
      {/* Header / Toolbar */}
      <header className="sticky top-0 z-30 bg-[#1e1e1e]/80 backdrop-blur-md border-b border-[#3b3b3b] px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <h1 className="text-[14px] font-semibold text-white">Recently viewed</h1>
            <div className="flex items-center gap-1 text-[13px] text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors">
              <span>All files</span>
              <ChevronDown size={14} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-[#2c2c2c] border border-[#3b3b3b] rounded p-0.5">
              <button className="p-1.5 bg-[#3b3b3b] text-white rounded-sm shadow-sm">
                <LayoutGrid size={14} />
              </button>
              <button className="p-1.5 text-zinc-500 hover:text-zinc-300">
                <ListFilter size={14} />
              </button>
            </div>
            <Link
              href="/editor/new"
              className="flex items-center gap-2 px-3 py-1.5 bg-[#0d99ff] hover:bg-[#0b85de] text-white text-[13px] font-medium rounded transition-colors"
            >
              <Plus size={16} />
              <span>Design file</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-8">
        {sortedProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="w-16 h-16 rounded-full bg-[#2c2c2c] flex items-center justify-center mb-4">
              <Search size={32} className="text-zinc-600" />
            </div>
            <h2 className="text-lg font-medium text-white">No recently viewed files</h2>
            <p className="text-zinc-500 mt-1">Files you open will appear here.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {groups.map((group) => (
              <section key={group.label}>
                <h2 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-6 px-1">
                  {group.label}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
                  {group.projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function groupProjects(projects: any[]) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const lastWeek = new Date(today)
  lastWeek.setDate(lastWeek.getDate() - 7)

  return [
    {
      label: 'Today',
      projects: projects.filter((p) => new Date(p.updatedAt) >= today),
    },
    {
      label: 'Yesterday',
      projects: projects.filter((p) => {
        const d = new Date(p.updatedAt)
        return d >= yesterday && d < today
      }),
    },
    {
      label: 'Last 7 days',
      projects: projects.filter((p) => {
        const d = new Date(p.updatedAt)
        return d >= lastWeek && d < yesterday
      }),
    },
    {
      label: 'Older',
      projects: projects.filter((p) => new Date(p.updatedAt) < lastWeek),
    },
  ].filter((group) => group.projects.length > 0)
}
