import * as Sentry from '@sentry/tanstackstart-react'
import { createServerFn } from '@tanstack/react-start'
import { createQuestionSchema, questionIdSchema, saveQuestionSchema } from '#/schemas/question'
import { adminMiddleware } from './auth.functions'
import * as questionStore from './questions.server'

export const listQuestions = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(() => Sentry.startSpan({ name: 'Listing questions' }, () => questionStore.listQuestions()))

export const getQuestion = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .validator(questionIdSchema)
  .handler(({ data }) => Sentry.startSpan({ name: 'Loading a question' }, () => questionStore.getQuestion(data.id)))

export const createQuestion = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(createQuestionSchema)
  .handler(({ data }) => Sentry.startSpan({ name: 'Creating a question' }, () => questionStore.createQuestion(data)))

export const saveQuestion = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(saveQuestionSchema)
  .handler(({ data }) => Sentry.startSpan({ name: 'Saving a question draft' }, () => questionStore.saveQuestion(data)))

export const publishQuestion = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(questionIdSchema)
  .handler(({ data }) =>
    Sentry.startSpan({ name: 'Publishing a question' }, () => questionStore.publishQuestion(data.id)),
  )
