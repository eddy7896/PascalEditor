import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface TeamLayoutProps {
  children: ReactNode
  params: Promise<{ teamId: string }>
}

export async function generateMetadata({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { name: true },
  })
  return { title: team ? `${team.name} — Pascal` : 'Team — Pascal' }
}

export default async function TeamLayout({ children, params }: TeamLayoutProps) {
  const { teamId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const userId = (session.user as { id: string }).id

  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
    select: { id: true },
  })

  if (!membership) redirect('/dashboard?error=not_member')

  return <>{children}</>
}
