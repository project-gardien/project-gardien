import { z } from 'zod'
import { localeSchema } from '#/schemas/locale'

export function localized<Value extends z.ZodType>(schema: Value) {
  return z.partialRecord(localeSchema, schema)
}
