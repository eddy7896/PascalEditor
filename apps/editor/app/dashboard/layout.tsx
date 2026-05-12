import type { ReactNode } from 'react'
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardSidebar } from './_components/DashboardSidebar'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const userId = (session.user as { id: string }).id

  let memberships = await prisma.organizationMember.findMany({
    where: { userId },
    include: {
      organization: { 
        select: { 
          id: true, 
          name: true, 
          slug: true, 
          logoUrl: true,
          teams: { select: { id: true, name: true } }
        } 
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  if (memberships.length === 0) {
    // Fallback for legacy users or edge cases: Create a default workspace on the fly
    const workspaceName = session.user.name ? `${session.user.name}'s Workspace` : 'My Workspace'
    const slug = `user-${Math.random().toString(36).slice(2, 7)}`

    const newOrg = await prisma.organization.create({
      data: {
        name: workspaceName,
        slug,
        status: 'APPROVED',
        members: {
          create: { userId, role: 'OWNER' }
        },
        teams: {
          create: { name: 'General' }
        }
      }
    })

    // Re-fetch memberships to continue layout render
    memberships = await prisma.organizationMember.findMany({
      where: { userId },
      include: {
        organization: { 
          select: { 
            id: true, 
            name: true, 
            slug: true, 
            logoUrl: true,
            teams: { select: { id: true, name: true } }
          } 
        },
      },
    })
  }

  const orgs = memberships.map((m) => ({ 
    ...m.organization, 
    role: m.role,
    teams: m.organization.teams 
  }))

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex">
      <DashboardSidebar
        orgs={orgs}
        user={{ name: session.user.name ?? null, email: session.user.email ?? null, image: session.user.image ?? null }}
      />
      <main className="flex-1 ml-64 overflow-y-auto min-h-screen">
        {children}
      </main>
    </div>
  )
}
