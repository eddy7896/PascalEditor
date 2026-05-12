import { getTeamData } from '../../actions'
import { ProjectCard } from '../../_components/ProjectCard'
import { Users, LayoutGrid, UserPlus, Plus } from 'lucide-react'
import Link from 'next/link'
import { NewProjectButton } from '../../_components/NewProjectButton'

export default async function TeamPage({ 
  params,
  searchParams 
}: { 
  params: { teamId: string },
  searchParams: { tab?: string }
}) {
  const team = await getTeamData(params.teamId)
  if (!team) return <div>Team not found</div>

  const activeTab = searchParams.tab || 'projects'

  return (
    <div className="flex flex-col min-h-screen bg-[#1e1e1e] text-zinc-300 font-sans">
      {/* Team Header */}
      <header className="px-8 pt-8 pb-0 border-b border-[#3b3b3b] bg-[#1e1e1e]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded bg-indigo-500 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-indigo-500/10">
              {team.name[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{team.name}</h1>
              <p className="text-[13px] text-zinc-500">{team.members.length} members · {team.projects.length} projects</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#2c2c2c] border border-[#3b3b3b] hover:bg-[#3e3e3e] text-[13px] font-medium text-white rounded transition-colors">
              <UserPlus size={16} />
              <span>Invite</span>
            </button>
            <NewProjectButton teamId={params.teamId} label="New file" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-8">
          <TabLink 
            href={`?tab=projects`} 
            label="Projects" 
            active={activeTab === 'projects'} 
            icon={<LayoutGrid size={14} />} 
          />
          <TabLink 
            href={`?tab=members`} 
            label="Members" 
            active={activeTab === 'members'} 
            icon={<Users size={14} />} 
          />
        </div>
      </header>

      {/* Tab Content */}
      <main className="flex-1 p-8">
        {activeTab === 'projects' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {team.projects.map((project) => (
              <ProjectCard key={project.id} project={{ ...project, teamName: team.name }} />
            ))}
            {team.projects.length === 0 && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-[#3b3b3b] rounded-xl text-zinc-500">
                No projects in this team yet.
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-4xl border border-[#3b3b3b] rounded-lg overflow-hidden">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#2c2c2c] border-b border-[#3b3b3b]">
                <tr>
                  <th className="px-4 py-3 font-semibold text-zinc-400">Name</th>
                  <th className="px-4 py-3 font-semibold text-zinc-400">Email</th>
                  <th className="px-4 py-3 font-semibold text-zinc-400">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3b3b3b]">
                {team.members.map((member: any) => (
                  <tr key={member.userId} className="hover:bg-[#2c2c2c] transition-colors group">
                    <td className="px-4 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[10px] font-bold text-white">
                        {member.user.image ? <img src={member.user.image} alt="" className="w-full h-full rounded-full" /> : member.user.name?.[0]}
                      </div>
                      <span className="font-medium text-white">{member.user.name}</span>
                    </td>
                    <td className="px-4 py-4 text-zinc-500">{member.user.email}</td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 rounded bg-[#3b3b3b] text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
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
