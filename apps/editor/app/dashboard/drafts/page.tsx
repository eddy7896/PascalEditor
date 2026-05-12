import { Search } from 'lucide-react'

export default function DraftsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#1e1e1e] text-zinc-300 font-sans">
      <header className="px-8 py-3 border-b border-[#3b3b3b]">
        <h1 className="text-[14px] font-semibold text-white">Drafts</h1>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-16 h-16 rounded-full bg-[#2c2c2c] flex items-center justify-center mb-4">
          <Search size={32} className="text-zinc-600" />
        </div>
        <h2 className="text-lg font-medium text-white">No drafts found</h2>
        <p className="text-zinc-500 mt-1">Files you haven't assigned to a team will appear here.</p>
      </main>
    </div>
  )
}
