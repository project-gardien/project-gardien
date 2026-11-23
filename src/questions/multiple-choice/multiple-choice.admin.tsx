import { Trash2 } from 'lucide-react'
import { useId } from 'react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { createQuestionForm } from '#/questions/question-form'
import type { EditorProps } from '#/questions/question-form'
import { multipleChoiceClient } from './multiple-choice.candidate'
import { configSchema, toView } from './multiple-choice.config'
import type { Config } from './multiple-choice.config'

function MultipleChoiceEditor({ value, locale, onChange }: EditorProps<Config>) {
  const promptId = useId()
  const correctGroup = useId()

  function updateOption(id: string, change: Partial<Config['options'][number]>) {
    onChange({
      ...value,
      options: value.options.map((option) => (option.id === id ? { ...option, ...change } : option)),
    })
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
        <legend className="mb-2 text-sm font-medium">Options</legend>
        <p className="text-sm text-muted-foreground">
          The list of options and the correct one are shared by every language. Only the texts are translated.
        </p>
        {value.options.map((option, index) => (
          <div key={option.id} className="flex items-center gap-2">
            <input
              type="radio"
              name={correctGroup}
              className="size-4 accent-primary"
              aria-label={`Option ${index + 1} is the correct answer`}
              checked={option.correct}
              onChange={() =>
                onChange({
                  ...value,
                  options: value.options.map((other) => ({ ...other, correct: other.id === option.id })),
                })
              }
            />
            <Input
              aria-label={`Option ${index + 1} text`}
              value={option.text[locale] ?? ''}
              onChange={(event) => updateOption(option.id, { text: { ...option.text, [locale]: event.target.value } })}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Remove option ${index + 1}`}
              onClick={() =>
                onChange({ ...value, options: value.options.filter((other) => other.id !== option.id) })
              }
            >
              <Trash2 />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          className="self-start"
          onClick={() =>
            onChange({
              ...value,
              options: [...value.options, { id: crypto.randomUUID(), text: {}, correct: false }],
            })
          }
        >
          Add an option
        </Button>
      </fieldset>
    </div>
  )
}

export const MultipleChoiceForm = createQuestionForm({
  configSchema,
  toView,
  Editor: MultipleChoiceEditor,
  Candidate: multipleChoiceClient.Component,
})
