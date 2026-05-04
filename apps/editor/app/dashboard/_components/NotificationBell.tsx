'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Bell } from 'lucide-react'

interface NotificationItem {
  id: string
  type: string
  meta: Record<string, unknown>
  readAt: string | null
  createdAt: string
}

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  const seconds = Math.round(diff / 1000)
  if (Math.abs(seconds) < 60) return rtf.format(-seconds, 'second')
  const minutes = Math.round(seconds / 60)
  if (Math.abs(minutes) < 60) return rtf.format(-minutes, 'minute')
  const hours = Math.round(minutes / 60)
  if (Math.abs(hours) < 24) return rtf.format(-hours, 'hour')
  const days = Math.round(hours / 24)
  return rtf.format(-days, 'day')
}

function formatMessage(item: NotificationItem): string {
  const meta = item.meta as Record<string, string>
  switch (item.type) {
    case 'SCENE_DUPLICATED':
      return `Your scene "${meta.assetTitle ?? 'Untitled'}" was duplicated`
    case 'ADDED_TO_TEAM':
      return `You were added to ${meta.teamName ?? 'a team'}`
    case 'ROLE_CHANGED':
      return `Your role in ${meta.teamName ?? 'a team'} was changed to ${meta.newRole ?? 'a new role'}`
    default:
      return 'You have a new notification'
  }
}

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [items, setItems] = useState<NotificationItem[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/notifications')
      if (!res.ok) return
      const data = (await res.json()) as { unreadCount: number; items: NotificationItem[] }
      setUnreadCount(data.unreadCount)
      setItems(data.items)
    } catch {
      // silently ignore network errors
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch + polling every 30s
  useEffect(() => {
    void fetchNotifications()
    const interval = setInterval(() => void fetchNotifications(), 30_000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  // Refetch on window focus
  useEffect(() => {
    const onFocus = () => void fetchNotifications()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [fetchNotifications])

  // Close dropdown on outside click
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  const handleBellClick = async () => {
    const wasOpen = open
    setOpen(!wasOpen)
    if (!wasOpen && unreadCount > 0) {
      // Optimistically zero out badge
      setUnreadCount(0)
      try {
        await fetch('/api/notifications', { method: 'PATCH' })
      } catch {
        // silently ignore; count will reconcile on next poll
      }
    }
  }

  const badgeLabel = unreadCount > 9 ? '9+' : String(unreadCount)

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => void handleBellClick()}
        className="relative flex items-center justify-center w-8 h-8 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-0.5 rounded-full bg-red-500 text-white text-[9px] font-semibold leading-none">
            {badgeLabel}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-700">
            <h3 className="text-sm font-semibold text-zinc-100">Notifications</h3>
          </div>

          <ul className="max-h-80 overflow-y-auto divide-y divide-zinc-800">
            {loading && items.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-zinc-500">Loading…</li>
            ) : items.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-zinc-500">No notifications yet.</li>
            ) : (
              items.map((item) => (
                <li
                  key={item.id}
                  className={`px-4 py-3 text-sm ${item.readAt == null ? 'bg-zinc-800/60' : ''}`}
                >
                  <p className="text-zinc-200 leading-snug">{formatMessage(item)}</p>
                  <p className="text-zinc-500 text-xs mt-1">{formatRelative(item.createdAt)}</p>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
