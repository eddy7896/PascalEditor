import { getTeamData } from '../../actions'
import { ProjectCard } from '../../_components/ProjectCard'
import { Users, LayoutGrid, UserPlus, Plus } from 'lucide-react'
import Link from 'next/link'
import { NewProjectButton } from '../../_components/NewProjectButton'

export default async function TeamPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ teamId: string }>,
  searchParams: Promise<{ tab?: string }>
}) {
  const { teamId } = await params
  const { tab } = await searchParams
  const team = (await getTeamData(teamId)) as any
  if (!team) return <div>Team not found</div>

  const activeTab = tab || 'projects'

  return (
    <div className="flex flex-col min-h-screen bg-background text-zinc-300 font-sans">
      {/* Team Header */}
      <header className="px-8 pt-10 pb-0 border-b border-border/40 sticky top-0 bg-background/80 backdrop-blur-2xl z-30">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-2xl font-bold text-white shadow-2xl shadow-primary/20">
              {team.name[0]?.toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">{team.name}</h1>
              </div>
              <p className="text-[13px] font-medium text-zinc-500 mt-1">{team.members.length} members · {team.projects.length} projects</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 hover:bg-white/10 active:scale-95 text-[13px] font-semibold text-white rounded-xl transition-all">
              <UserPlus size={16} className="text-zinc-400" />
              <span>Invite</span>
            </button>
            <NewProjectButton teamId={teamId} label="New file" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-8">
          <TabLink 
            href={`?tab=projects`} 
            label="Projects" 
            active={activeTab === 'projects'} 
            icon={<LayoutGrid size={16} />} 
          />
          <TabLink 
            href={`?tab=members`} 
            label="Members" 
            active={activeTab === 'members'} 
            icon={<Users size={16} />} 
          />
        </div>
      </header>

      {/* Tab Content */}
      <main className="flex-1 p-8 max-w-[1600px] mx-auto w-full">
        {activeTab === 'projects' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-8 gap-y-12">
            {team.projects.map((project: any) => (
              <ProjectCard 
                key={project.id} 
                project={{ 
                  ...project, 
                  updatedAt: project.updatedAt instanceof Date ? project.updatedAt.toISOString() : project.updatedAt,
                  teamName: team.name 
                }} 
              />
            ))}
            {team.projects.length === 0 && (
              <div className="col-span-full py-32 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl text-zinc-500 bg-white/[0.01]">
                <Plus size={48} className="text-zinc-800 mb-4" />
                <p className="text-lg font-medium text-zinc-400">No projects yet</p>
                <p className="text-sm mt-1">Create a new file to get started.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-5xl bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-white/[0.03] border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 font-bold text-zinc-400 uppercase tracking-widest text-[10px]">Name</th>
                  <th className="px-6 py-4 font-bold text-zinc-400 uppercase tracking-widest text-[10px]">Email</th>
                  <th className="px-6 py-4 font-bold text-zinc-400 uppercase tracking-widest text-[10px]">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {team.members.map((member: any) => (
                  <tr key={member.userId} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-6 py-5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-white/10 flex items-center justify-center text-xs font-bold text-white shadow-lg overflow-hidden">
                        {member.user.image ? <img src={member.user.image} alt="" className="w-full h-full object-cover" /> : member.user.name?.[0]}
                      </div>
                      <span className="font-semibold text-white tracking-tight">{member.user.name}</span>
                    </td>
                    <td className="px-6 py-5 text-zinc-500 font-medium">{member.user.email}</td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        Member
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}

function TabLink({ href, label, active, icon }: { href: string; label: string; active: boolean; icon: React.ReactNode }) {
  return (
    <Link 
      href={href}
      className={`flex items-center gap-2 pb-3 text-[13px] font-medium border-b-2 transition-colors ${
        active 
          ? 'border-[#0d99ff] text-white' 
          : 'border-transparent text-zinc-500 hover:text-zinc-300'
      }`}
    >
      {icon}
      {label}
    </Link>
  )
}
