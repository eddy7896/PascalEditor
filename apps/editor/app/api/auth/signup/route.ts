import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const emailLower = email.toLowerCase();
    const domain = emailLower.split('@')[1];
    if (!domain) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let user = await prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (user && user.password) {
      return NextResponse.json({ error: "User already exists. Please sign in." }, { status: 400 });
    }

    // 1. Create or Find User
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: emailLower,
          name,
          password: hashedPassword,
        }
      });
    } else {
      // Update existing user (e.g. if they were invited or partially created)
      user = await prisma.user.update({
        where: { id: user.id },
        data: { 
          password: hashedPassword,
          name: name || user.name
        }
      });
    }

    // 2. Check if they already have an organization (safety check)
    const existingMembership = await prisma.organizationMember.findFirst({
      where: { userId: user.id }
    });

    if (!existingMembership) {
      // 3. Create a personal workspace and default team
      const workspaceName = name ? `${name}'s Workspace` : 'My Workspace';
      const slug = `${(name || 'user').toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Math.random().toString(36).slice(2, 7)}`;

      await prisma.organization.create({
        data: {
          name: workspaceName,
          slug,
          status: 'APPROVED',
          members: {
            create: {
              userId: user.id,
              role: 'OWNER'
            }
          },
          teams: {
            create: {
              name: 'General',
            }
          }
        }
      });
    }

    return NextResponse.json({ success: true, message: "Account created successfully" });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
