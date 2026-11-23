import { z } from 'zod'
import { localized } from '#/questions/localization'
import type { ConfigIssue } from '#/questions/types'
import type { Locale } from '#/schemas/locale'
import { MAX_ANSWER_LENGTH } from './free-text.shared'
import type { View } from './free-text.shared'

export function normalizeAnswer(text: string): string {
  return text.normalize('NFC').trim().replace(/\s+/g, ' ')
}

export const configSchema = z.object({
  prompt: localized(z.string()).catch({}),
  acceptedAnswers: localized(z.array(z.string())).catch({}),
})

export type Config = z.infer<typeof configSchema>

export function toView(config: Config, locale: Locale): View {
  return { prompt: config.prompt[locale] ?? '' }
}

export function findIssues(config: Config, locale: Locale): ConfigIssue[] {
  const issues: ConfigIssue[] = []
  const acceptedAnswers = config.acceptedAnswers[locale] ?? []
  if ((config.prompt[locale] ?? '').trim().length === 0) {
    issues.push({ path: 'prompt', message: 'the prompt is empty' })
  }
  if (acceptedAnswers.length === 0) {
    issues.push({ path: 'acceptedAnswers', message: 'at least one accepted answer is required' })
  }
  acceptedAnswers.forEach((accepted, index) => {
    if (normalizeAnswer(accepted).length === 0) {
      issues.push({ path: `acceptedAnswers.${index}`, message: 'the accepted answer is blank' })
    }
    if (accepted.length > MAX_ANSWER_LENGTH) {
      issues.push({
        path: `acceptedAnswers.${index}`,
        message: 'the accepted answer is longer than a candidate can type',
      })
    }
  })
  return issues
}
