import { getDrafts } from '../actions'
import { ProjectCard } from '../_components/ProjectCard'
import { Search } from 'lucide-react'
import { NewProjectButton } from '../_components/NewProjectButton'

export default async function DraftsPage() {
  const drafts = await getDrafts()

  return (
    <div className="flex flex-col min-h-screen bg-[#1e1e1e] text-zinc-300 font-sans">
      <header className="px-8 py-3 border-b border-[#3b3b3b] sticky top-0 bg-[#1e1e1e]/80 backdrop-blur-md z-30">
        <div className="flex items-center justify-between">
          <h1 className="text-[14px] font-semibold text-white">Drafts</h1>
          <NewProjectButton label="New Draft" />
        </div>
      </header>
      
      <main className="flex-1 p-8">
        {drafts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="w-16 h-16 rounded-full bg-[#2c2c2c] flex items-center justify-center mb-4">
              <Search size={32} className="text-zinc-600" />
            </div>
            <h2 className="text-lg font-medium text-white">No drafts found</h2>
            <p className="text-zinc-500 mt-1">Files you haven't assigned to a team will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl2:grid-cols-5 gap-x-6 gap-y-10">
            {drafts.map((draft) => (
              <ProjectCard key={draft.id} project={{ ...draft, teamName: 'Draft' }} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
