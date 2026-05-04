import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeAuditLog } from "@/lib/audit"
import { createNotification } from "@/lib/notifications"
import { sendTeamAddedEmail } from "@/lib/emails/team-added"

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

  writeAuditLog({
    teamId: invite.teamId,
    actorId: userId,
    targetId: userId,
    event: "MEMBER_JOINED",
    meta: { role: invite.role },
  }).catch((err) => console.error("[audit] MEMBER_JOINED write failed:", err))

  // Fire-and-forget: email + in-app notification for joining team
  const [team, inviter] = await Promise.all([
    prisma.team.findUnique({ where: { id: invite.teamId }, select: { name: true } }),
    invite.createdByUserId
      ? prisma.user.findUnique({ where: { id: invite.createdByUserId }, select: { name: true } })
      : Promise.resolve(null),
  ])

  const teamUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/dashboard/teams/${invite.teamId}`

  if (sessionEmail && team) {
    sendTeamAddedEmail({
      to: sessionEmail,
      teamName: team.name,
      role: invite.role,
      teamUrl,
      inviterName: inviter?.name ?? undefined,
    }).catch((err) => console.error("[team-added] email send failed:", err))
  }

  createNotification({
    userId,
    type: "ADDED_TO_TEAM",
    meta: { teamName: team?.name, role: invite.role },
  }).catch((err) => console.error("[team-added] notification failed:", err))

  return NextResponse.redirect(`${baseUrl}/dashboard/teams/${invite.teamId}`)
}
