'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useContext } from 'react'
import { ChevronRight, Home as HomeIcon } from 'lucide-react'
import { BreadcrumbContext } from './breadcrumb-context'

function humanize(segment: string): string {
  return segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function BreadcrumbNav() {
  const pathname = usePathname()
  const ctx = useContext(BreadcrumbContext)

  const segments = pathname.split('/').filter(Boolean)

  // Hide on /dashboard root (only one segment: 'dashboard')
  if (segments.length <= 1) return null

  // segments[0] is 'dashboard' — render as Home; iterate the rest
  const rest = segments.slice(1)

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1 px-8 pt-5 pb-1 text-sm text-zinc-500"
    >
      <Link
        href="/dashboard"
        className="flex items-center gap-1 hover:text-zinc-300 transition-colors"
      >
        <HomeIcon className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>

      {rest.map((segment, index) => {
        const isLast = index === rest.length - 1
        const href = '/dashboard/' + rest.slice(0, index + 1).join('/')
        const label = ctx?.labels[segment] ?? humanize(segment)

        return (
          <span key={segment} className="flex items-center gap-1">
            <ChevronRight className="w-3.5 h-3.5 text-zinc-700" />
            {isLast ? (
              <span className="text-zinc-300 font-medium">{label}</span>
            ) : (
              <Link
                href={href}
                className="hover:text-zinc-300 transition-colors"
              >
                {label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
