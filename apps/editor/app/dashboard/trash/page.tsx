import { getTrash } from '../actions'
import { ProjectCard } from '../_components/ProjectCard'
import { Trash2, RotateCcw } from 'lucide-react'
import Link from 'next/link'

export default async function TrashPage() {
  const trash = await getTrash()

  return (
    <div className="flex flex-col min-h-screen bg-[#1e1e1e] text-zinc-300 font-sans">
      <header className="px-8 py-3 border-b border-[#3b3b3b] sticky top-0 bg-[#1e1e1e]/80 backdrop-blur-md z-30">
        <div className="flex items-center justify-between">
          <h1 className="text-[14px] font-semibold text-white">Trash</h1>
        </div>
      </header>
      
      <main className="flex-1 p-8">
        {trash.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="w-16 h-16 rounded-full bg-[#2c2c2c] flex items-center justify-center mb-4">
              <Trash2 size={32} className="text-zinc-600" />
            </div>
            <h2 className="text-lg font-medium text-white">Trash is empty</h2>
            <p className="text-zinc-500 mt-1">Deleted files will appear here for 30 days.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {trash.map((project) => (
              <div key={project.id} className="relative group">
                <ProjectCard project={{ ...project, teamName: 'Deleted' }} />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   {/* We could add a restore button here, but for now just viewing is fine or handled by a context menu */}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
