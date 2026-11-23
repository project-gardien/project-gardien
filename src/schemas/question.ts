import { z } from 'zod'
import { questionTypeSchema } from '#/questions/question-types'
import { localeSchema } from './locale'
import { storedConfigSchema } from './stored-config'

const nameSchema = z.string().trim().min(1).max(200)

const offeredLocalesSchema = z
  .array(localeSchema)
  .min(1)
  .refine((offered) => new Set(offered).size === offered.length, { message: 'locales must be unique' })

export const questionIdSchema = z.object({ id: z.uuid() })

export const createQuestionSchema = z.object({
  name: nameSchema,
  type: questionTypeSchema,
  locales: offeredLocalesSchema,
})

export const saveQuestionSchema = z.object({
  id: z.uuid(),
  name: nameSchema,
  locales: offeredLocalesSchema,
  draftConfig: storedConfigSchema,
})

export const questionRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: questionTypeSchema,
  locales: z.array(localeSchema),
  draftConfig: storedConfigSchema,
  updatedAt: z.string(),
})

export const versionRowSchema = z.object({
  questionId: z.string(),
  version: z.number(),
  locales: z.array(localeSchema),
  config: storedConfigSchema,
})

export type CreateQuestion = z.infer<typeof createQuestionSchema>
export type SaveQuestion = z.infer<typeof saveQuestionSchema>
export type QuestionRow = z.infer<typeof questionRowSchema>
export type VersionRow = z.infer<typeof versionRowSchema>
