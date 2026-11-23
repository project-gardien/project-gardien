import type { Locale } from '#/schemas/locale'
import type { StoredConfig } from '#/schemas/stored-config'
import { freeTextServer } from './free-text/free-text.server'
import { multipleChoiceServer } from './multiple-choice/multiple-choice.server'
import type { QuestionServer } from './question-server'
import type { QuestionType } from './question-types'
import type { LocaleIssue } from './types'

export const questionServers: Record<QuestionType, QuestionServer> = {
  'multiple-choice': multipleChoiceServer,
  'free-text': freeTextServer,
}

export function findLocaleIssues(
  type: QuestionType,
  stored: StoredConfig,
  offeredLocales: readonly Locale[],
): LocaleIssue[] {
  return offeredLocales.flatMap((locale) =>
    questionServers[type].findIssues(stored, locale).map((issue) => ({ locale, ...issue })),
  )
}
