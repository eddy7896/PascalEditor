import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { EditProfileForm } from './_components/EditProfileForm'
import { ChangePasswordForm } from './_components/ChangePasswordForm'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const userId = (session.user as { id: string }).id

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, image: true, password: true },
  })

  if (!user) redirect('/login')

  // NEVER send password hash to client — only a boolean flag
  const hasPassword = !!user.password

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-semibold text-white">Settings</h1>

      {/* Profile Section */}
      <section className="rounded-xl border border-white/10 bg-zinc-900/50 p-6 space-y-4">
        <div>
          <h2 className="text-lg font-medium text-white">Profile</h2>
          <p className="text-sm text-white/50 mt-0.5">
            Update your display name and avatar URL.
          </p>
        </div>
        <EditProfileForm
          initialName={user.name ?? null}
          initialImage={user.image ?? null}
          email={user.email ?? ''}
        />
      </section>

      {/* Password Section */}
      <section className="rounded-xl border border-white/10 bg-zinc-900/50 p-6 space-y-4">
        <div>
          <h2 className="text-lg font-medium text-white">Password</h2>
          <p className="text-sm text-white/50 mt-0.5">
            Change your account password.
          </p>
        </div>

        {hasPassword ? (
          <ChangePasswordForm />
        ) : (
          <p className="text-sm text-white/40 italic">
            Password change is unavailable for accounts created via Google OAuth in v1.
          </p>
        )}
      </section>
    </div>
  )
}
