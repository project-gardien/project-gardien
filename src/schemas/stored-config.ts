import { z } from 'zod'

export const storedConfigSchema = z.json()
export type StoredConfig = z.infer<typeof storedConfigSchema>
