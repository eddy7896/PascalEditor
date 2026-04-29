import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const token = url.searchParams.get("token")
  const baseUrl = process.env.NEXTAUTH_URL || url.origin

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/dashboard?error=invalid_token`)
  }

  const session = await getServerSession(authOptions)
  const sessionEmail = session?.user?.email?.toLowerCase()
  const userId = (session?.user as { id?: string } | undefined)?.id

  if (!sessionEmail || !userId) {
    // Redirect to login, then back here
    const callbackUrl = encodeURIComponent(`/api/teams/invite/accept?token=${token}`)
    return NextResponse.redirect(`${baseUrl}/login?callbackUrl=${callbackUrl}`)
  }

  const invite = await prisma.teamInviteToken.findUnique({ where: { token } })
  if (!invite) {
    return NextResponse.redirect(`${baseUrl}/dashboard?error=invalid_token`)
  }
  if (invite.usedAt) {
    return NextResponse.redirect(`${baseUrl}/dashboard?error=token_already_used`)
  }
  if (invite.expiresAt < new Date()) {
    return NextResponse.redirect(`${baseUrl}/dashboard?error=token_expired`)
  }
  if (invite.inviteeEmail !== sessionEmail) {
    return NextResponse.redirect(`${baseUrl}/dashboard?error=wrong_account`)
  }

  // Atomic: upsert membership + mark token used
  await prisma.$transaction([
    prisma.teamMember.upsert({
      where: { teamId_userId: { teamId: invite.teamId, userId } },
      update: { role: invite.role },
      create: { teamId: invite.teamId, userId, role: invite.role },
    }),
    prisma.teamInviteToken.update({
      where: { token },
      data: { usedAt: new Date(), usedByUserId: userId },
    }),
  ])

  return NextResponse.redirect(`${baseUrl}/dashboard/teams/${invite.teamId}`)
}
