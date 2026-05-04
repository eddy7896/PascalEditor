import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomBytes, createHash } from "node:crypto";
import { sendEmail } from "@/lib/email";
import { VerificationEmail } from "@/emails/VerificationEmail";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ipHeader = req.headers.get('x-forwarded-for');
    const ip = (ipHeader?.split(',')[0] ?? 'unknown').trim()
    const { allowed } = await rateLimit(`rl:signup:${ip}`, 5, 60)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }

    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const emailLower = email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email: emailLower } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists. Please sign in." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: { email: emailLower, name, password: hashedPassword },
    });

    // Create verification token
    const raw = randomBytes(32).toString("hex");
    const hashed = createHash("sha256").update(raw).digest("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    await prisma.emailVerificationToken.create({
      data: { token: hashed, email: emailLower, expiresAt },
    });

    const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const verifyUrl = `${base}/api/auth/verify-email?token=${raw}`;

    sendEmail({
      to: emailLower,
      subject: "Verify your Pascal email address",
      react: <VerificationEmail verifyUrl={verifyUrl} name={name} />,
    }).catch((err) =>
      console.error("[signup] verification email send failed:", err)
    );

    return NextResponse.json({
      success: true,
      message: "Check your email to verify your account.",
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
