'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  Clock,
  FileText,
  Users2,
  ChevronDown,
  Check,
  Plus,
  Search,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react'

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

  return (
    <aside className="fixed left-0 top-0 h-full w-60 z-40 flex flex-col bg-[#2c2c2c] border-r border-[#3b3b3b] text-zinc-300 select-none font-sans">
      {/* User & Org Selector (Top) */}
      <div className="relative p-2">
        <button
          onClick={() => setOrgMenuOpen(!orgMenuOpen)}
          className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-[#3e3e3e] transition-colors group"
        >
          <div className="w-5 h-5 rounded bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
            {activeOrg.name[0]?.toUpperCase()}
          </div>
          <span className="flex-1 text-[13px] font-medium truncate text-left">{activeOrg.name}</span>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300" />
        </button>

        {orgMenuOpen && (
          <div className="absolute top-full left-2 right-2 mt-1 z-50 bg-[#2c2c2c] border border-[#3b3b3b] rounded shadow-xl overflow-hidden py-1">
            <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Workspaces</div>
            {orgs.map((org) => (
              <button
                key={org.id}
                onClick={() => { setActiveOrg(org); setOrgMenuOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#3e3e3e] transition-colors"
              >
                <div className="w-4 h-4 rounded bg-indigo-500 flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0">
                  {org.name[0]?.toUpperCase()}
                </div>
                <span className="text-xs truncate flex-1 text-left">{org.name}</span>
                {org.id === activeOrg.id && <Check className="w-3 h-3 text-indigo-400" />}
              </button>
            ))}
            <div className="h-px bg-[#3b3b3b] my-1" />
            <Link href="/dashboard/settings" className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#3e3e3e] text-xs transition-colors">
              <Settings className="w-3.5 h-3.5" /> Settings
            </Link>
            <button 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#3e3e3e] text-xs text-red-400 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="px-3 mb-4">
        <button className="w-full flex items-center gap-2 px-2 py-1.5 bg-[#3e3e3e] hover:bg-[#454545] rounded text-zinc-400 text-xs transition-colors">
          <Search className="w-3.5 h-3.5" />
          <span>Search</span>
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-0.5 custom-scrollbar">
        <SidebarItem 
          href="/dashboard" 
          icon={<Clock className="w-4 h-4" />} 
          label="Recently viewed" 
          active={pathname === '/dashboard'} 
        />
        <SidebarItem 
          href="/dashboard/drafts" 
          icon={<FileText className="w-4 h-4" />} 
          label="Drafts" 
          active={pathname === '/dashboard/drafts'} 
        />

        {/* Teams Section */}
        <div className="mt-6 mb-2 px-2 flex items-center justify-between group">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Teams</span>
          <button className="p-0.5 hover:bg-[#3e3e3e] rounded transition-colors opacity-0 group-hover:opacity-100">
            <Plus className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-300" />
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
      <div className="p-2 border-t border-[#3b3b3b]">
        <div className="flex items-center gap-2 p-1.5 rounded hover:bg-[#3e3e3e] transition-colors cursor-pointer group">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 shadow-sm">
            {user.image ? <img src={user.image} alt="" className="w-full h-full rounded-full" /> : (user.name?.[0] ?? 'U')}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate">{user.name ?? 'User'}</div>
          </div>
          <ChevronRight className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300" />
        </div>
      </div>
    </aside>
  )
}

function SidebarItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link href={href}>
      <div className={`flex items-center gap-2.5 px-2 py-1.5 rounded text-[13px] font-medium transition-colors ${
        active 
          ? 'bg-[#3e3e3e] text-white shadow-sm' 
          : 'text-zinc-400 hover:bg-[#3e3e3e] hover:text-zinc-200'
      }`}>
        <span className={`${active ? 'text-indigo-400' : 'text-zinc-500'}`}>{icon}</span>
        <span className="truncate">{label}</span>
      </div>
    </Link>
  )
}
