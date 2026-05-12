'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  Clock,
  FileText,
  Trash2,
  Users2,
  ChevronDown,
  Check,
  Plus,
  Search,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { CreateTeamModal } from './CreateTeamModal'

type Team = { id: string; name: string }
type Org = { 
  id: string; 
  name: string; 
  slug: string; 
  logoUrl: string | null; 
  role: string;
  teams: Team[];
}
type User = { name: string | null; email: string | null; image: string | null }

export function DashboardSidebar({ orgs, user }: { orgs: Org[]; user: User }) {
  const pathname = usePathname()
  const [activeOrg, setActiveOrg] = useState(orgs[0]!)
  const [orgMenuOpen, setOrgMenuOpen] = useState(false)
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false)

  return (
    <aside className="fixed left-0 top-0 h-full w-64 z-40 flex flex-col bg-sidebar/80 backdrop-blur-2xl border-r border-border/40 text-zinc-400 select-none font-sans transition-all duration-300">
      {/* User & Org Selector (Top) */}
      <div className="relative p-3">
        <button
          onClick={() => setOrgMenuOpen(!orgMenuOpen)}
          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 active:scale-[0.98] transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-[12px] font-bold text-white shadow-lg shadow-primary/20 flex-shrink-0">
            {activeOrg.name[0]?.toUpperCase()}
          </div>
          <div className="flex-1 text-left">
            <div className="text-[13px] font-semibold text-white truncate leading-tight">{activeOrg.name}</div>
            <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-tight">Workspace</div>
          </div>
          <ChevronDown className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
        </button>

        {orgMenuOpen && (
          <div className="absolute top-full left-3 right-3 mt-1 z-50 bg-[#1c1c1e]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2 animate-in fade-in zoom-in duration-150">
            <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Workspaces</div>
            {orgs.map((org) => (
              <button
                key={org.id}
                onClick={() => { setActiveOrg(org); setOrgMenuOpen(false) }}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-primary/10 transition-colors group"
              >
                <div className="w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 group-hover:bg-primary transition-colors">
                  {org.name[0]?.toUpperCase()}
                </div>
                <span className="text-xs font-medium text-zinc-300 truncate flex-1 text-left">{org.name}</span>
                {org.id === activeOrg.id && <Check className="w-3.5 h-3.5 text-primary" />}
              </button>
            ))}
            <div className="h-px bg-white/5 my-2" />
            <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 text-xs font-medium text-zinc-300 transition-colors">
              <Settings className="w-4 h-4 text-zinc-500" /> Settings
            </Link>
            <button 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-red-500/10 text-xs font-medium text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="px-4 mb-6">
        <button className="w-full flex items-center gap-2.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-zinc-500 text-xs font-medium transition-all group">
          <Search className="w-4 h-4 group-hover:text-zinc-300 transition-colors" />
          <span>Search...</span>
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar">
        <SidebarItem 
          href="/dashboard" 
          icon={<Clock className="w-4 h-4" />} 
          label="Recent Files" 
          active={pathname === '/dashboard'} 
        />
        <SidebarItem 
          href="/dashboard/drafts" 
          icon={<FileText className="w-4 h-4" />} 
          label="My Drafts" 
          active={pathname === '/dashboard/drafts'} 
        />
        <SidebarItem 
          href="/dashboard/trash" 
          icon={<Trash2 className="w-4 h-4" />} 
          label="Recently Deleted" 
          active={pathname === '/dashboard/trash'} 
        />

        {/* Teams Section */}
        <div className="mt-8 mb-2 px-3 flex items-center justify-between group">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Shared Teams</span>
          <button 
            onClick={() => setShowCreateTeamModal(true)}
            className="p-1 hover:bg-white/10 rounded-md transition-all active:scale-90"
          >
            <Plus className="w-4 h-4 text-zinc-600 hover:text-primary transition-colors" />
          </button>
        </div>

        {activeOrg.teams.map((team) => (
          <SidebarItem 
            key={team.id}
            href={`/dashboard/teams/${team.id}`} 
            icon={<Users2 className="w-4 h-4" />} 
            label={team.name} 
            active={pathname === `/dashboard/teams/${team.id}`} 
          />
        ))}
      </nav>

      {/* Bottom User Profile */}
      <div className="p-3 mt-auto">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-white/10 flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0 shadow-lg overflow-hidden group-hover:border-primary/50 transition-colors">
            {user.image ? <img src={user.image} alt="" className="w-full h-full object-cover" /> : (user.name?.[0] ?? 'U')}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-white truncate">{user.name ?? 'Guest User'}</div>
            <div className="text-[10px] font-medium text-zinc-500 truncate">{user.email ?? 'Pro Account'}</div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400 transition-colors" />
        </div>
      </div>

      <CreateTeamModal 
        isOpen={showCreateTeamModal} 
        onClose={() => setShowCreateTeamModal(false)} 
        orgId={activeOrg.id}
      />
    </aside>
  )
}

function SidebarItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link href={href}>
      <div className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 ${
        active 
          ? 'bg-primary text-white shadow-lg shadow-primary/20' 
          : 'text-zinc-400 hover:bg-white/5 hover:text-white'
      }`}>
        <span className={`${active ? 'text-white' : 'text-zinc-500'}`}>{icon}</span>
        <span className="truncate">{label}</span>
      </div>
    </Link>
  )
}
