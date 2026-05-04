import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes, createHash } from "node:crypto";
import { sendEmail } from "@/lib/email";
import { PasswordResetEmail } from "@/emails/PasswordResetEmail";
import { rateLimit } from "@/lib/rate-limit";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function POST(req: Request) {
  try {
    const ipHeader = req.headers.get('x-forwarded-for');
    const ip = (ipHeader?.split(',')[0] ?? 'unknown').trim()
    const { allowed } = await rateLimit(`rl:forgot-password:${ip}`, 5, 60)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }

    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    const emailLower = email.toLowerCase();

    // Always respond the same way regardless of whether the user exists (no enumeration).
    // But only generate a token if the user actually exists.
    const user = await prisma.user.findUnique({ where: { email: emailLower } });

    if (user) {
      const raw = randomBytes(32).toString("hex");
      const hashed = createHash("sha256").update(raw).digest("hex");
      const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
      await prisma.passwordResetToken.create({
        data: { token: hashed, email: emailLower, expiresAt },
      });
      const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
      const resetUrl = `${base}/reset-password?token=${raw}`;

      // Send reset email asynchronously (fire-and-forget for enumeration safety)
      sendEmail({
        to: emailLower,
        subject: "Reset your Pascal password",
        react: <PasswordResetEmail resetUrl={resetUrl} name={user.name ?? undefined} />,
      }).catch((err) =>
        console.error("[forgot-password] email send failed:", err)
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("forgot-password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
