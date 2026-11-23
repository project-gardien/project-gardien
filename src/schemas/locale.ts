import { z } from 'zod'

export const locales = ['fr', 'en'] as const
export const localeSchema = z.enum(locales)
export type Locale = z.infer<typeof localeSchema>
export const defaultLocale = 'fr' satisfies Locale
