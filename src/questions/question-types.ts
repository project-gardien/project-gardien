import { z } from 'zod'
import { type as freeText } from './free-text/free-text.shared'
import { type as multipleChoice } from './multiple-choice/multiple-choice.shared'

export const questionTypes = [multipleChoice, freeText] as const
export const questionTypeSchema = z.enum(questionTypes)
export type QuestionType = z.infer<typeof questionTypeSchema>

export const questionTypeLabels: Record<QuestionType, string> = {
  [multipleChoice]: 'Multiple choice',
  [freeText]: 'Free text',
}
