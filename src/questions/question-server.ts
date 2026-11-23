import type { z } from 'zod'
import type { Locale } from '#/schemas/locale'
import type { StoredConfig } from '#/schemas/stored-config'
import type { ConfigIssue, GradeResult } from './types'

export type QuestionServer = {
  findIssues: (stored: StoredConfig, locale: Locale) => ConfigIssue[]
  toPublic: (stored: StoredConfig, locale: Locale, seed: string) => unknown
  grade: (stored: StoredConfig, answer: unknown, locale: Locale) => Promise<GradeResult>
}

type QuestionServerDefinition<Config, View, Answer> = {
  configSchema: z.ZodType<Config>
  answerSchema: z.ZodType<Answer>
  findIssues: (config: Config, locale: Locale) => ConfigIssue[]
  toPublic: (config: Config, locale: Locale, seed: string) => View
  grade: (config: Config, answer: Answer, locale: Locale) => Promise<GradeResult>
}

export function defineQuestionServer<Config, View, Answer>({
  configSchema,
  answerSchema,
  findIssues,
  toPublic,
  grade,
}: QuestionServerDefinition<Config, View, Answer>): QuestionServer {
  return {
    findIssues: (stored, locale) => findIssues(configSchema.parse(stored), locale),
    toPublic: (stored, locale, seed) => toPublic(configSchema.parse(stored), locale, seed),
    grade: async (stored, answer, locale) =>
      grade(configSchema.parse(stored), answerSchema.parse(answer), locale),
  }
}
