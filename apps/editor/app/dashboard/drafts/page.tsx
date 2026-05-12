import { getDrafts } from '../actions'
import { ProjectCard } from '../_components/ProjectCard'
import { Search } from 'lucide-react'
import { NewProjectButton } from '../_components/NewProjectButton'

export default async function DraftsPage() {
  const drafts = await getDrafts()

  return (
    <div className="flex flex-col min-h-screen bg-background text-zinc-300 font-sans">
      <header className="px-8 py-4 border-b border-border/40 sticky top-0 bg-background/80 backdrop-blur-2xl z-30">
        <div className="flex items-center justify-between">
          <h1 className="text-[17px] font-bold text-white tracking-tight">My Drafts</h1>
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
            {drafts.map((draft: any) => (
              <ProjectCard 
                key={draft.id} 
                project={{ 
                  ...draft, 
                  updatedAt: draft.updatedAt instanceof Date ? draft.updatedAt.toISOString() : draft.updatedAt,
                  teamName: 'Draft' 
                }} 
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
