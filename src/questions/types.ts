import type { Locale } from '#/schemas/locale'

export type ConfigIssue = {
  path: string
  message: string
}

export type LocaleIssue = ConfigIssue & { locale: Locale }

export type GradeCriterion = {
  label: string
  passed: boolean
}

export type GradeResult = {
  score: number
  maxScore: number
  criteria: GradeCriterion[]
}

export type QuestionProps<View, Answer> = {
  view: View
  value: Answer | null
  onChange: (answer: Answer) => void
}
