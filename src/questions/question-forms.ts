import type { ComponentType } from 'react'
import type { QuestionType } from './question-types'
import { FreeTextForm } from './free-text/free-text.admin'
import { MultipleChoiceForm } from './multiple-choice/multiple-choice.admin'
import type { QuestionFormProps } from './question-form'

export const questionForms: Record<QuestionType, ComponentType<QuestionFormProps>> = {
  'multiple-choice': MultipleChoiceForm,
  'free-text': FreeTextForm,
}
