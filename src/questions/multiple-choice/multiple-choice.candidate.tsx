import { useId } from 'react'
import type { QuestionProps } from '#/questions/types'
import { type } from './multiple-choice.shared'
import type { Answer, View } from './multiple-choice.shared'

function MultipleChoice({ view, value, onChange }: QuestionProps<View, Answer>) {
  const groupName = useId()

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 text-base font-medium whitespace-pre-wrap">{view.prompt}</legend>
      {view.options.map((option) => (
        <label
          key={option.id}
          className="flex cursor-pointer items-center gap-3 rounded-md border border-input px-3 py-2 text-sm transition-colors hover:bg-accent has-checked:border-primary has-checked:bg-accent has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
        >
          <input
            type="radio"
            name={groupName}
            className="size-4 accent-primary outline-none"
            checked={value?.optionId === option.id}
            onChange={() => onChange({ optionId: option.id })}
          />
          {option.text}
        </label>
      ))}
    </fieldset>
  )
}

export const multipleChoiceClient = { type, Component: MultipleChoice }
