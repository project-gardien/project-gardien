import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { deleteCookie, getCookie, setCookie } from '@tanstack/react-start/server'
import { env } from '#/env'

const SESSION_COOKIE = 'gardien-admin-session'
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12

const cookieOptions = {
  httpOnly: true,
  secure: import.meta.env.PROD,
  sameSite: 'lax',
  path: '/',
} as const

function digest(value: string) {
  return createHash('sha256').update(value).digest()
}

function sessionToken() {
  return createHmac('sha256', env.SESSION_SECRET).update(env.ADMIN_PASSWORD).digest('hex')
}

export function isAdminPassword(candidate: string) {
  return timingSafeEqual(digest(candidate), digest(env.ADMIN_PASSWORD))
}

export function isAdminRequest() {
  const token = getCookie(SESSION_COOKIE)
  return token !== undefined && timingSafeEqual(digest(token), digest(sessionToken()))
}

export function openAdminSession() {
  setCookie(SESSION_COOKIE, sessionToken(), { ...cookieOptions, maxAge: SESSION_MAX_AGE_SECONDS })
}

export function closeAdminSession() {
  deleteCookie(SESSION_COOKIE, cookieOptions)
}
