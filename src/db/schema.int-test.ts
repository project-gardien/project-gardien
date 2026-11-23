import { eq } from 'drizzle-orm'
import { beforeEach, describe, expect, it } from 'vitest'
import { resetDatabase } from '#/testing/integration'
import { getDb } from './client.server'
import { questionVersions, questions } from './schema'

const questionId = '11111111-1111-4111-8111-111111111111'

function version(id: string, number: number) {
  return { id, questionId, version: number, type: 'free-text', locales: ['fr'], config: {} }
}

beforeEach(async () => {
  await resetDatabase()
  await getDb()
    .insert(questions)
    .values({ id: questionId, name: 'Capital', type: 'free-text', locales: ['fr'], draftConfig: {} })
})

describe('question versions', () => {
  it('rejects a second version with the same number for one question', async () => {
    await getDb().insert(questionVersions).values(version('v1', 1))
    await expect(getDb().insert(questionVersions).values(version('v2', 1))).rejects.toMatchObject({
      cause: { code: 'ER_DUP_ENTRY' },
    })
  })

  it('are deleted with their question', async () => {
    await getDb().insert(questionVersions).values(version('v1', 1))
    await getDb().delete(questions).where(eq(questions.id, questionId))
    expect(await getDb().select().from(questionVersions)).toEqual([])
  })
})
