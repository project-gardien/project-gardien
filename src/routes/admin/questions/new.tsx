import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { LocaleCheckboxes } from '#/components/locale-checkboxes'
import { createQuestion } from '#/admin/questions.functions'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { defaultLocale } from '#/schemas/locale'
import type { Locale } from '#/schemas/locale'
import { questionTypeLabels, questionTypes } from '#/questions/question-types'
import type { QuestionType } from '#/questions/question-types'

export const Route = createFileRoute('/admin/questions/new')({ component: NewQuestion })

function NewQuestion() {
  const router = useRouter()
  const createQuestionFn = useServerFn(createQuestion)
  const [name, setName] = useState('')
  const [type, setType] = useState<QuestionType>(questionTypes[0])
  const [offered, setOffered] = useState<Locale[]>([defaultLocale])
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setIsPending(true)
    const { id } = await createQuestionFn({ data: { name, type, locales: offered } })
    await router.navigate({ to: '/admin/questions/$questionId', params: { questionId: id } })
  }

  return (
    <form className="flex max-w-xl flex-col gap-6" onSubmit={handleSubmit}>
      <h1 className="text-2xl font-semibold">New question</h1>

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Internal name</Label>
        <Input id="name" required maxLength={200} value={name} onChange={(event) => setName(event.target.value)} />
        <p className="text-sm text-muted-foreground">Only shown in this back-office, never to candidates.</p>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">Type</legend>
        {questionTypes.map((questionType) => (
          <label
            key={questionType}
            className="flex cursor-pointer items-center gap-3 rounded-md border border-input px-3 py-2 text-sm has-checked:border-primary has-checked:bg-accent"
          >
            <input
              type="radio"
              name="type"
              className="size-4 accent-primary"
              checked={type === questionType}
              onChange={() => setType(questionType)}
            />
            {questionTypeLabels[questionType]}
          </label>
        ))}
        <p className="text-sm text-muted-foreground">The type cannot be changed afterwards.</p>
      </fieldset>

      <LocaleCheckboxes value={offered} onChange={setOffered} />

      <Button type="submit" className="self-start" disabled={isPending || offered.length === 0}>
        Create question
      </Button>
    </form>
  )
}
