import * as Sentry from '@sentry/tanstackstart-react'
import { createMiddleware, createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { closeAdminSession, isAdminPassword, isAdminRequest, openAdminSession } from './session.server'

export const adminMiddleware = createMiddleware({ type: 'function' }).server(async ({ next }) => {
  if (!isAdminRequest()) throw new Error('Unauthorized')
  return next()
})

export const getAdminSession = createServerFn({ method: 'GET' }).handler(async () => ({
  isAdmin: isAdminRequest(),
}))

export const signIn = createServerFn({ method: 'POST' })
  .validator(z.object({ password: z.string().max(200) }))
  .handler(({ data }) =>
    Sentry.startSpan({ name: 'Signing an admin in' }, async () => {
      const isValid = isAdminPassword(data.password)
      if (isValid) openAdminSession()
      return { isValid }
    }),
  )

export const signOut = createServerFn({ method: 'POST' }).handler(async () => {
  closeAdminSession()
  return { isAdmin: false }
})
