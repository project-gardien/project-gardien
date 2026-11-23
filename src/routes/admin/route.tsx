import { Link, Outlet, createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { getAdminSession, signOut } from '#/admin/auth.functions'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    const { isAdmin } = await getAdminSession()
    if (!isAdmin) throw redirect({ to: '/login' })
  },
  component: AdminLayout,
})

function AdminLayout() {
  const router = useRouter()
  const signOutFn = useServerFn(signOut)

  async function handleSignOut() {
    await signOutFn()
    await router.navigate({ to: '/login' })
  }

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-border px-6 py-3">
        <Link to="/admin" className="font-semibold">
          Gardien
        </Link>
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          Sign out
        </Button>
      </header>
      <main className="mx-auto max-w-6xl p-6">
        <Outlet />
      </main>
    </div>
  )
}
