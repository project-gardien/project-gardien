import { useId } from 'react'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import type { QuestionProps } from '#/questions/types'
import { MAX_ANSWER_LENGTH, type } from './free-text.shared'
import type { Answer, View } from './free-text.shared'

function FreeText({ view, value, onChange }: QuestionProps<View, Answer>) {
  const textareaId = useId()

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor={textareaId} className="text-base leading-normal whitespace-pre-wrap select-text">
        {view.prompt}
      </Label>
      <Textarea
        id={textareaId}
        className="min-h-32"
        maxLength={MAX_ANSWER_LENGTH}
        value={value?.text ?? ''}
        onChange={(event) => onChange({ text: event.target.value })}
      />
    </div>
  )
}

export const freeTextClient = { type, Component: FreeText }
