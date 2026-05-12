import { getDashboardData, getDrafts } from './actions'
import { ProjectCard } from './_components/ProjectCard'
import { Search, ListFilter, LayoutGrid, ChevronDown } from 'lucide-react'
import { NewProjectButton } from './_components/NewProjectButton'

export default async function DashboardOverview() {
  const data = (await getDashboardData()) as any

  if (!data || data.organizations.length === 0) {
    return null // Handled by layout or onboarding
  }

  const org = data.organizations[0]!.organization
  
  // Also include drafts in Recents
  const drafts = await getDrafts()
  
  const allProjects = [
    ...org.teams.flatMap((team: any) =>
      team.projects.map((proj: any) => ({ ...proj, teamName: team.name }))
    ),
    ...drafts.map(d => ({ ...d, teamName: 'Draft' }))
  ]

  const sortedProjects = [...allProjects].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )

  const groups = groupProjects(sortedProjects)

  return (
    <div className="flex flex-col min-h-screen bg-background text-zinc-300 font-sans">
      {/* Header / Toolbar */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-2xl border-b border-border/40 px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <h1 className="text-[17px] font-bold text-white tracking-tight">Recent Files</h1>
            <div className="flex items-center gap-1.5 text-[13px] font-semibold text-zinc-500 hover:text-white cursor-pointer transition-colors group">
              <span>All files</span>
              <ChevronDown size={14} className="text-zinc-600 group-hover:text-white transition-colors" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white/5 border border-white/5 rounded-xl p-1">
              <button className="p-1.5 bg-white/10 text-white rounded-lg shadow-sm">
                <LayoutGrid size={16} />
              </button>
              <button className="p-1.5 text-zinc-600 hover:text-zinc-300">
                <ListFilter size={16} />
              </button>
            </div>
            <NewProjectButton />
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
                    <ProjectCard 
                      key={project.id} 
                      project={{ 
                        ...project, 
                        updatedAt: project.updatedAt instanceof Date ? project.updatedAt.toISOString() : project.updatedAt 
                      }} 
                    />
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
