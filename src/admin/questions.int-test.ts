import { beforeEach, describe, expect, it } from 'vitest'
import { getDb } from '#/db/client.server'
import { questionVersions, questions } from '#/db/schema'
import type { StoredConfig } from '#/schemas/stored-config'
import { resetDatabase } from '#/testing/integration'
import { createQuestion, getQuestion, listQuestions, publishQuestion, saveQuestion } from './questions.server'

const paris = { prompt: { fr: 'Capitale de la France ?' }, acceptedAnswers: { fr: ['Paris'] } }
const rome = { prompt: { fr: "Capitale de l'Italie ?" }, acceptedAnswers: { fr: ['Rome'] } }
const unknownId = '11111111-1111-4111-8111-111111111111'

async function createDraft(draftConfig: StoredConfig) {
  const { id } = await createQuestion({ name: 'Capital', type: 'free-text', locales: ['fr'] })
  await saveQuestion({ id, name: 'Capital', locales: ['fr'], draftConfig })
  return id
}

beforeEach(resetDatabase)

describe('saveQuestion', () => {
  it('stores the draft that getQuestion returns', async () => {
    const { id } = await createQuestion({ name: 'Capital', type: 'free-text', locales: ['fr'] })
    await saveQuestion({ id, name: 'Capitals', locales: ['fr', 'en'], draftConfig: paris })

    expect(await getQuestion(id)).toMatchObject({
      name: 'Capitals',
      type: 'free-text',
      locales: ['fr', 'en'],
      draftConfig: paris,
    })
  })

  it('rejects an unknown question without creating it', async () => {
    await expect(
      saveQuestion({ id: unknownId, name: 'Capital', locales: ['fr'], draftConfig: paris }),
    ).rejects.toMatchObject({ isNotFound: true })
    expect(await getDb().select().from(questions)).toEqual([])
  })
})

describe('publishQuestion', () => {
  it('numbers versions from 1 for each question', async () => {
    const first = await createDraft(paris)
    const second = await createDraft(rome)

    expect(await publishQuestion(first)).toEqual({ status: 'published', version: 1 })
    expect(await publishQuestion(first)).toEqual({ status: 'published', version: 2 })
    expect(await publishQuestion(second)).toEqual({ status: 'published', version: 1 })
  })

  it('gives each concurrent publish of one question its own version', async () => {
    const id = await createDraft(paris)

    const results = await Promise.all([publishQuestion(id), publishQuestion(id), publishQuestion(id)])

    expect(results.map((result) => (result.status === 'published' ? result.version : result.status)).sort()).toEqual([
      1, 2, 3,
    ])
  })

  it('keeps the published version unchanged when the draft is edited afterwards', async () => {
    const id = await createDraft(paris)
    await publishQuestion(id)
    await saveQuestion({ id, name: 'Capital', locales: ['fr', 'en'], draftConfig: rome })

    expect(await getDb().select().from(questionVersions)).toMatchObject([
      { questionId: id, version: 1, type: 'free-text', locales: ['fr'], config: paris },
    ])
  })

  it('refuses an invalid draft and stores no version', async () => {
    const id = await createDraft({ prompt: { fr: 'Capitale de la France ?' }, acceptedAnswers: { fr: [] } })

    expect(await publishQuestion(id)).toEqual({
      status: 'invalid',
      issues: [{ locale: 'fr', path: 'acceptedAnswers', message: 'at least one accepted answer is required' }],
      reason: null,
    })
    expect(await getDb().select().from(questionVersions)).toEqual([])
  })

  it('rejects an unknown question', async () => {
    await expect(publishQuestion(unknownId)).rejects.toMatchObject({ isNotFound: true })
  })
})

describe('getQuestion', () => {
  it('reports a never-published draft as unpublished', async () => {
    const id = await createDraft(paris)

    expect(await getQuestion(id)).toMatchObject({ publishedVersion: null, hasUnpublishedChanges: true })
  })

  it('reports no unpublished changes right after publishing', async () => {
    const id = await createDraft(paris)
    await publishQuestion(id)

    expect(await getQuestion(id)).toMatchObject({ publishedVersion: 1, hasUnpublishedChanges: false })
  })

  it('reports unpublished changes once the draft config differs from the latest version', async () => {
    const id = await createDraft(paris)
    await publishQuestion(id)
    await saveQuestion({ id, name: 'Capital', locales: ['fr'], draftConfig: rome })

    expect(await getQuestion(id)).toMatchObject({ publishedVersion: 1, hasUnpublishedChanges: true })
  })

  it('reports unpublished changes once the offered locales differ from the latest version', async () => {
    const id = await createDraft(paris)
    await publishQuestion(id)
    await saveQuestion({ id, name: 'Capital', locales: ['fr', 'en'], draftConfig: paris })

    expect(await getQuestion(id)).toMatchObject({ publishedVersion: 1, hasUnpublishedChanges: true })
  })

  it('ignores a rename when comparing the draft to the latest version', async () => {
    const id = await createDraft(paris)
    await publishQuestion(id)
    await saveQuestion({ id, name: 'Renamed', locales: ['fr'], draftConfig: paris })

    expect(await getQuestion(id)).toMatchObject({ name: 'Renamed', hasUnpublishedChanges: false })
  })

  it('rejects an unknown question', async () => {
    await expect(getQuestion(unknownId)).rejects.toMatchObject({ isNotFound: true })
  })
})

describe('listQuestions', () => {
  it('compares each question to its own latest version', async () => {
    const republished = await createDraft(paris)
    await publishQuestion(republished)
    await saveQuestion({ id: republished, name: 'Capital', locales: ['fr'], draftConfig: rome })
    await publishQuestion(republished)
    const edited = await createDraft(paris)
    await publishQuestion(edited)
    await saveQuestion({ id: edited, name: 'Capital', locales: ['fr'], draftConfig: rome })
    const draft = await createDraft(paris)

    const publications = (await listQuestions()).map((question) => [
      question.id,
      [question.publishedVersion, question.hasUnpublishedChanges],
    ])

    expect(Object.fromEntries(publications)).toEqual({
      [republished]: [2, false],
      [edited]: [1, true],
      [draft]: [null, true],
    })
  })
})
