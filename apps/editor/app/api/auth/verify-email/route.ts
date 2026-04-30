import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const raw = searchParams.get("token");

    if (!raw) {
      return NextResponse.redirect(
        new URL("/login?error=MissingVerificationToken", req.url)
      );
    }

    const hashed = createHash("sha256").update(raw).digest("hex");
    const record = await prisma.emailVerificationToken.findUnique({
      where: { token: hashed },
    });

    if (!record || record.expiresAt < new Date()) {
      // Delete expired token if found
      if (record) {
        await prisma.emailVerificationToken.delete({ where: { token: hashed } });
      }
      return NextResponse.redirect(
        new URL("/login?error=InvalidVerificationToken", req.url)
      );
    }

    // Mark user as verified and delete token (atomically via transaction)
    await prisma.$transaction([
      prisma.user.update({
        where: { email: record.email },
        data: { emailVerified: new Date() },
      }),
      prisma.emailVerificationToken.delete({ where: { token: hashed } }),
    ]);

    return NextResponse.redirect(new URL("/login?verified=true", req.url));
  } catch (error) {
    console.error("[verify-email] error:", error);
    return NextResponse.redirect(
      new URL("/login?error=VerificationFailed", req.url)
    );
  }
}
