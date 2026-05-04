import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import {
  getUnreadNotificationCount,
  getRecentNotifications,
  markAllNotificationsRead,
} from '@/lib/notifications'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ unreadCount: 0, items: [] }, { status: 401 })
  }
  const userId = (session.user as { id: string }).id

  const [unreadCount, items] = await Promise.all([
    getUnreadNotificationCount(userId),
    getRecentNotifications(userId, 20),
  ])

  return NextResponse.json({ unreadCount, items })
}

export async function PATCH() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = (session.user as { id: string }).id

  await markAllNotificationsRead(userId)

  return NextResponse.json({ ok: true })
}
