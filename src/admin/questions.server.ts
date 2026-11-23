import { notFound } from '@tanstack/react-router'
import { desc, eq, max } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '#/db/client.server'
import { questionVersions, questions } from '#/db/schema'
import { findLocaleIssues } from '#/questions/question-types.server'
import { questionRowSchema, versionRowSchema } from '#/schemas/question'
import type { CreateQuestion, QuestionRow, SaveQuestion, VersionRow } from '#/schemas/question'

function latestVersionByQuestion(versions: VersionRow[]) {
  const latest = new Map<string, VersionRow>()
  for (const version of versions) {
    const current = latest.get(version.questionId)
    if (current === undefined || version.version > current.version) latest.set(version.questionId, version)
  }
  return latest
}

function publication(question: QuestionRow, latest: VersionRow | undefined) {
  if (latest === undefined) return { publishedVersion: null, hasUnpublishedChanges: true }
  const published = JSON.stringify([latest.locales, latest.config])
  const draft = JSON.stringify([question.locales, question.draftConfig])
  return { publishedVersion: latest.version, hasUnpublishedChanges: published !== draft }
}

async function findQuestion(id: string) {
  const [row] = await getDb().select().from(questions).where(eq(questions.id, id))
  if (row === undefined) throw notFound()
  return questionRowSchema.parse(row)
}

async function findVersions(questionId?: string) {
  const query = getDb()
    .select({
      questionId: questionVersions.questionId,
      version: questionVersions.version,
      locales: questionVersions.locales,
      config: questionVersions.config,
    })
    .from(questionVersions)
  const rows = await (questionId === undefined ? query : query.where(eq(questionVersions.questionId, questionId)))
  return z.array(versionRowSchema).parse(rows)
}

export async function listQuestions() {
  const rows = await getDb().select().from(questions).orderBy(desc(questions.updatedAt))
  const latest = latestVersionByQuestion(await findVersions())
  return z
    .array(questionRowSchema)
    .parse(rows)
    .map((question) => ({
      id: question.id,
      name: question.name,
      type: question.type,
      locales: question.locales,
      updatedAt: question.updatedAt,
      ...publication(question, latest.get(question.id)),
    }))
}

export async function getQuestion(id: string) {
  const question = await findQuestion(id)
  const latest = latestVersionByQuestion(await findVersions(question.id))
  return { ...question, ...publication(question, latest.get(question.id)) }
}

export async function createQuestion(data: CreateQuestion) {
  const id = crypto.randomUUID()
  await getDb()
    .insert(questions)
    .values({ id, name: data.name, type: data.type, locales: data.locales, draftConfig: {} })
  return { id }
}

export async function saveQuestion(data: SaveQuestion) {
  await findQuestion(data.id)
  await getDb()
    .update(questions)
    .set({ name: data.name, locales: data.locales, draftConfig: data.draftConfig })
    .where(eq(questions.id, data.id))
  return { id: data.id }
}

export async function publishQuestion(id: string) {
  return getDb().transaction(async (transaction) => {
    const [row] = await transaction.select().from(questions).where(eq(questions.id, id)).for('update')
    if (row === undefined) throw notFound()
    const question = questionRowSchema.parse(row)

    const issues = findLocaleIssues(question.type, question.draftConfig, question.locales)
    if (question.locales.length === 0) {
      return { status: 'invalid' as const, issues, reason: 'The question is not offered in any language.' }
    }
    if (issues.length > 0) return { status: 'invalid' as const, issues, reason: null }

    const [latest] = await transaction
      .select({ value: max(questionVersions.version) })
      .from(questionVersions)
      .where(eq(questionVersions.questionId, question.id))
    const version = (latest?.value ?? 0) + 1
    await transaction.insert(questionVersions).values({
      id: crypto.randomUUID(),
      questionId: question.id,
      version,
      type: question.type,
      locales: question.locales,
      config: question.draftConfig,
    })
    return { status: 'published' as const, version }
  })
}
