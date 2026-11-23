import { z } from 'zod'
import { localized } from '#/questions/localization'
import type { ConfigIssue } from '#/questions/types'
import type { Locale } from '#/schemas/locale'
import type { View } from './multiple-choice.shared'

export const configSchema = z.object({
  prompt: localized(z.string()).catch({}),
  options: z
    .array(
      z.object({
        id: z.string().catch(''),
        text: localized(z.string()).catch({}),
        correct: z.boolean().catch(false),
      }),
    )
    .catch([]),
})

export type Config = z.infer<typeof configSchema>

export function toView(config: Config, locale: Locale): View {
  return {
    prompt: config.prompt[locale] ?? '',
    options: config.options.map((option) => ({ id: option.id, text: option.text[locale] ?? '' })),
  }
}

export function findIssues(config: Config, locale: Locale): ConfigIssue[] {
  const issues: ConfigIssue[] = []
  if ((config.prompt[locale] ?? '').trim().length === 0) {
    issues.push({ path: 'prompt', message: 'the prompt is empty' })
  }
  if (config.options.length < 2) {
    issues.push({ path: 'options', message: 'at least two options are required' })
  }
  if (config.options.filter((option) => option.correct).length !== 1) {
    issues.push({ path: 'options', message: 'exactly one option must be correct' })
  }
  if (new Set(config.options.map((option) => option.id)).size !== config.options.length) {
    issues.push({ path: 'options', message: 'option ids must be unique' })
  }
  config.options.forEach((option, index) => {
    if (option.id.length === 0) {
      issues.push({ path: `options.${index}.id`, message: 'the option has no id' })
    }
    if ((option.text[locale] ?? '').trim().length === 0) {
      issues.push({ path: `options.${index}.text`, message: 'the option text is empty' })
    }
  })
  return issues
}
