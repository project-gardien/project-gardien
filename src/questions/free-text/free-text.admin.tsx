import { Trash2 } from 'lucide-react'
import { useId } from 'react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { createQuestionForm } from '#/questions/question-form'
import type { EditorProps } from '#/questions/question-form'
import { freeTextClient } from './free-text.candidate'
import { configSchema, toView } from './free-text.config'
import type { Config } from './free-text.config'
import { MAX_ANSWER_LENGTH } from './free-text.shared'

function FreeTextEditor({ value, locale, onChange }: EditorProps<Config>) {
  const promptId = useId()
  const acceptedAnswers = value.acceptedAnswers[locale] ?? []

  function setAcceptedAnswers(next: string[]) {
    onChange({ ...value, acceptedAnswers: { ...value.acceptedAnswers, [locale]: next } })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor={promptId}>Prompt</Label>
        <Textarea
          id={promptId}
          value={value.prompt[locale] ?? ''}
          onChange={(event) => onChange({ ...value, prompt: { ...value.prompt, [locale]: event.target.value } })}
        />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">Accepted answers</legend>
        <p className="text-sm text-muted-foreground">
          Each language has its own list. An answer is correct when it matches one of them exactly, ignoring
          surrounding and repeated spaces.
        </p>
        {acceptedAnswers.map((accepted, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              aria-label={`Accepted answer ${index + 1}`}
              maxLength={MAX_ANSWER_LENGTH}
              value={accepted}
              onChange={(event) =>
                setAcceptedAnswers(
                  acceptedAnswers.map((other, otherIndex) => (otherIndex === index ? event.target.value : other)),
                )
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Remove accepted answer ${index + 1}`}
              onClick={() => setAcceptedAnswers(acceptedAnswers.filter((_, otherIndex) => otherIndex !== index))}
            >
              <Trash2 />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          className="self-start"
          onClick={() => setAcceptedAnswers([...acceptedAnswers, ''])}
        >
          Add an accepted answer
        </Button>
      </fieldset>
    </div>
  )
}

export const FreeTextForm = createQuestionForm({
  configSchema,
  toView,
  Editor: FreeTextEditor,
  Candidate: freeTextClient.Component,
})
