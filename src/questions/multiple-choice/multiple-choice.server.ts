import { seededShuffle } from '#/lib/seeded-shuffle'
import { defineQuestionServer } from '#/questions/question-server'
import { configSchema, findIssues, toView } from './multiple-choice.config'
import { answerSchema } from './multiple-choice.shared'

export const multipleChoiceServer = defineQuestionServer({
  configSchema,
  answerSchema,
  findIssues,

  toPublic(config, locale, seed) {
    const view = toView(config, locale)
    return { ...view, options: seededShuffle(view.options, seed) }
  },

  async grade(config, answer) {
    const chosen = config.options.find((option) => option.id === answer.optionId)
    const isCorrect = chosen?.correct === true
    return {
      score: isCorrect ? 1 : 0,
      maxScore: 1,
      criteria: [{ label: 'Correct option selected', passed: isCorrect }],
    }
  },
})
