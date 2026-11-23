import { defineQuestionServer } from '#/questions/question-server'
import { configSchema, findIssues, normalizeAnswer, toView } from './free-text.config'
import { answerSchema } from './free-text.shared'

export const freeTextServer = defineQuestionServer({
  configSchema,
  answerSchema,
  findIssues,
  toPublic: toView,

  async grade(config, answer, locale) {
    const submitted = normalizeAnswer(answer.text)
    const acceptedAnswers = config.acceptedAnswers[locale] ?? []
    const isCorrect = acceptedAnswers.some((accepted) => normalizeAnswer(accepted) === submitted)
    return {
      score: isCorrect ? 1 : 0,
      maxScore: 1,
      criteria: [{ label: 'Matches an accepted answer', passed: isCorrect }],
    }
  },
})
