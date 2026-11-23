import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { getAdminSession, signIn } from '#/admin/auth.functions'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'

export const Route = createFileRoute('/login')({
  beforeLoad: async () => {
    const { isAdmin } = await getAdminSession()
    if (isAdmin) throw redirect({ to: '/admin' })
  },
  component: Login,
})

function Login() {
  const router = useRouter()
  const signInFn = useServerFn(signIn)
  const [password, setPassword] = useState('')
  const [isRejected, setIsRejected] = useState(false)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setIsPending(true)
    const { isValid } = await signInFn({ data: { password } })
    setIsPending(false)
    setIsRejected(!isValid)
    if (isValid) await router.navigate({ to: '/admin' })
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Gardien</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            aria-invalid={isRejected}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {isRejected && <p className="text-sm text-destructive">Wrong password.</p>}
        </div>
        <Button type="submit" disabled={isPending}>
          Sign in
        </Button>
      </form>
    </main>
  )
}
