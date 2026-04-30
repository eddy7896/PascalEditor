import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { MembersTable } from "./_components/MembersTable"
import { InviteMemberModalWrapper } from "./_components/InviteMemberModalWrapper"

interface MembersPageProps {
  params: Promise<{ teamId: string }>
}

export default async function MembersPage({ params }: MembersPageProps) {
  const { teamId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const userId = (session.user as { id: string }).id

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: {
        include: { user: true },
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!team) notFound()

  const currentUserMembership = team.members.find((m) => m.userId === userId)
  if (!currentUserMembership) redirect("/dashboard?error=not_member")

  const members = team.members.map((m) => ({
    id: m.id,
    userId: m.userId,
    role: m.role,
    user: {
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      image: m.user.image,
    },
  }))

  const canManage =
    currentUserMembership.role === "OWNER" ||
    currentUserMembership.role === "ADMIN"

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Members of {team.name}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {team.members.length}{" "}
            {team.members.length === 1 ? "member" : "members"}
          </p>
        </div>
        {canManage && <InviteMemberModalWrapper teamId={teamId} />}
      </div>

      <MembersTable
        members={members}
        teamId={teamId}
        currentUserRole={currentUserMembership.role}
        currentUserId={userId}
      />
    </div>
  )
}
