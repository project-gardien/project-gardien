import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { LocaleCheckboxes } from '#/components/locale-checkboxes'
import { getQuestion, publishQuestion, saveQuestion } from '#/admin/questions.functions'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { localeLabels } from '#/lib/locales'
import type { Locale } from '#/schemas/locale'
import { questionTypeLabels } from '#/questions/question-types'
import type { LocaleIssue } from '#/questions/types'
import { questionForms } from '#/questions/question-forms'

export const Route = createFileRoute('/admin/questions/$questionId')({
  loader: ({ params }) => getQuestion({ data: { id: params.questionId } }),
  component: EditQuestion,
})

type Feedback =
  | { kind: 'saved' }
  | { kind: 'published'; version: number }
  | { kind: 'invalid'; reason: string | null; issues: LocaleIssue[] }

function EditQuestion() {
  const question = Route.useLoaderData()
  const router = useRouter()
  const saveQuestionFn = useServerFn(saveQuestion)
  const publishQuestionFn = useServerFn(publishQuestion)

  const [name, setName] = useState(question.name)
  const [offered, setOffered] = useState<Locale[]>(question.locales)
  const [stored, setStored] = useState(question.draftConfig)
  const [selectedLocale, setSelectedLocale] = useState<Locale | undefined>(question.locales[0])
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [isPending, setIsPending] = useState(false)

  const activeLocale = selectedLocale !== undefined && offered.includes(selectedLocale) ? selectedLocale : offered[0]
  const QuestionForm = questionForms[question.type]
  const canSave = !isPending && offered.length > 0 && name.trim().length > 0

  async function save() {
    await saveQuestionFn({ data: { id: question.id, name, locales: offered, draftConfig: stored } })
  }

  async function handleSave() {
    setIsPending(true)
    await save()
    await router.invalidate()
    setFeedback({ kind: 'saved' })
    setIsPending(false)
  }

  async function handlePublish() {
    setIsPending(true)
    await save()
    const result = await publishQuestionFn({ data: { id: question.id } })
    await router.invalidate()
    setFeedback(
      result.status === 'published'
        ? { kind: 'published', version: result.version }
        : { kind: 'invalid', reason: result.reason, issues: result.issues },
    )
    setIsPending(false)
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">{question.name}</h1>
          <p className="text-sm text-muted-foreground">
            {questionTypeLabels[question.type]}
            {' · '}
            {question.publishedVersion === null ? 'Never published' : `Published v${question.publishedVersion}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={!canSave} onClick={handleSave}>
            Save draft
          </Button>
          <Button disabled={!canSave} onClick={handlePublish}>
            Save and publish
          </Button>
        </div>
      </div>

      <div role="status" className="empty:hidden">
        {feedback?.kind === 'saved' && <p className="text-sm text-muted-foreground">Draft saved.</p>}
        {feedback?.kind === 'published' && (
          <p className="text-sm text-muted-foreground">Published as version {feedback.version}.</p>
        )}
        {feedback?.kind === 'invalid' && (
          <div className="rounded-md border border-destructive p-4 text-sm">
            <p className="font-medium text-destructive">
              The draft is saved but cannot be published yet.{feedback.reason === null ? '' : ` ${feedback.reason}`}
            </p>
            <ul className="mt-2 list-disc pl-5">
              {feedback.issues.map((issue) => (
                <li key={`${issue.locale}:${issue.path}:${issue.message}`}>
                  {localeLabels[issue.locale]}: {issue.message} ({issue.path})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="grid max-w-xl gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Internal name</Label>
          <Input id="name" maxLength={200} value={name} onChange={(event) => setName(event.target.value)} />
        </div>
        <LocaleCheckboxes value={offered} onChange={setOffered} />
      </div>

      {activeLocale === undefined ? (
        <p className="text-muted-foreground">Offer the question in at least one language to edit its content.</p>
      ) : (
        <div className="flex flex-col gap-6">
          <div role="tablist" aria-label="Language being edited" className="flex gap-2 border-b border-border">
            {offered.map((locale) => (
              <button
                key={locale}
                type="button"
                role="tab"
                aria-selected={locale === activeLocale}
                className="-mb-px border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground aria-selected:border-primary aria-selected:text-foreground"
                onClick={() => setSelectedLocale(locale)}
              >
                {localeLabels[locale]}
              </button>
            ))}
          </div>
          <QuestionForm key={activeLocale} stored={stored} locale={activeLocale} onStoredChange={setStored} />
        </div>
      )}
    </div>
  )
}
