import { NextResponse } from "next/server"
import { randomBytes } from "node:crypto"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const actorId = (session?.user as { id?: string } | undefined)?.id
  if (!actorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 })

  const { teamId, email, role } = body as { teamId?: string; email?: string; role?: string }
  if (!teamId || !email || !role) {
    return NextResponse.json({ error: "Missing fields: teamId, email, role" }, { status: 400 })
  }

  // Validate role is a TeamRole (excluding OWNER — owner is set on creation only)
  const allowedRoles = ["ADMIN", "EDITOR", "COMMENTER", "VIEWER"]
  if (!allowedRoles.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 })
  }

  // Validate email shape
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 })
  }

  // Authorization: actor must be OWNER or ADMIN of the team
  const actorMembership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: actorId } },
  })
  if (!actorMembership || !["OWNER", "ADMIN"].includes(actorMembership.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const token = randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000) // 48h

  await prisma.teamInviteToken.create({
    data: {
      token,
      teamId,
      inviteeEmail: email.toLowerCase(),
      role: role as "ADMIN" | "EDITOR" | "COMMENTER" | "VIEWER",
      createdByUserId: actorId,
      expiresAt,
    },
  })

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
  const inviteUrl = `${baseUrl}/api/teams/invite/accept?token=${token}`

  return NextResponse.json({ success: true, inviteUrl, expiresAt })
}
