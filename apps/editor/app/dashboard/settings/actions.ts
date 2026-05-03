'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'

function getSessionUserId(session: { user?: unknown } | null): string {
  const id = (session?.user as { id?: string } | undefined)?.id
  if (!id) throw new Error('Unauthorized')
  return id
}

export async function updateUserProfile(input: { name?: string; image?: string }) {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)

  const name = input.name?.trim()
  const image = input.image?.trim()

  if (name !== undefined && name !== '') {
    if (name.length < 1 || name.length > 80) {
      throw new Error('Name must be between 1 and 80 characters')
    }
  }

  if (image !== undefined && image !== '') {
    if (!image.startsWith('http://') && !image.startsWith('https://')) {
      throw new Error('Avatar URL must start with http:// or https://')
    }
    if (image.length > 1024) {
      throw new Error('Avatar URL is too long (max 1024 characters)')
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: name === '' ? null : (name ?? null),
      image: image === '' ? null : (image ?? null),
    },
  })

  revalidatePath('/dashboard')

  return { success: true }
}

export async function changePassword(input: {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}) {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)

  if (input.newPassword !== input.confirmPassword) {
    throw new Error('Passwords do not match')
  }

  if (input.newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters')
  }

  if (input.newPassword.length > 128) {
    throw new Error('Password is too long (max 128 characters)')
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true },
  })

  if (!user?.password) {
    throw new Error('Password change is unavailable for accounts created via Google OAuth in v1.')
  }

  const ok = await bcrypt.compare(input.currentPassword, user.password)
  if (!ok) {
    throw new Error('Current password is incorrect')
  }

  const hash = await bcrypt.hash(input.newPassword, 10)

  await prisma.user.update({
    where: { id: userId },
    data: { password: hash },
  })

  return { success: true }
}
