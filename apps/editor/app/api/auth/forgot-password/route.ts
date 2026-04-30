import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes, createHash } from "node:crypto";
import { sendEmail } from "@/lib/email";
import { PasswordResetEmail } from "@/emails/PasswordResetEmail";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function POST(req: Request) {
  try {
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
