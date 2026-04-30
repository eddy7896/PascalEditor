import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

const handler = NextAuth(authOptions);

export { handler as GET };

export async function POST(req: NextRequest, ctx: { params: Promise<{ nextauth: string[] }> }) {
  // Apply rate limiting only on credentials sign-in (action=signin, provider path includes credentials)
  const url = new URL(req.url);
  const isCredentialsSignin =
    url.pathname.endsWith('/signin/credentials') ||
    url.searchParams.get('action') === 'credentials';

  if (isCredentialsSignin) {
    const ipHeader = req.headers.get('x-forwarded-for');
    const ip = (ipHeader?.split(',')[0] ?? 'unknown').trim();
    const { allowed } = await rateLimit(`rl:login:${ip}`, 10, 60);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }
  }

  return handler(req, ctx);
}
