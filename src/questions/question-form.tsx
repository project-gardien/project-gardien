import { useState } from 'react'
import type { ComponentType } from 'react'
import type { z } from 'zod'
import type { Locale } from '#/schemas/locale'
import { storedConfigSchema } from '#/schemas/stored-config'
import type { StoredConfig } from '#/schemas/stored-config'
import type { QuestionProps } from './types'

export type EditorProps<Config> = {
  value: Config
  locale: Locale
  onChange: (config: Config) => void
}

export type QuestionFormProps = {
  stored: StoredConfig
  locale: Locale
  onStoredChange: (stored: StoredConfig) => void
}

type QuestionFormDefinition<Config, View, Answer> = {
  configSchema: z.ZodType<Config>
  toView: (config: Config, locale: Locale) => View
  Editor: ComponentType<EditorProps<Config>>
  Candidate: ComponentType<QuestionProps<View, Answer>>
}

export function createQuestionForm<Config, View, Answer>({
  configSchema,
  toView,
  Editor,
  Candidate,
}: QuestionFormDefinition<Config, View, Answer>): ComponentType<QuestionFormProps> {
  return function QuestionForm({ stored, locale, onStoredChange }) {
    const [answer, setAnswer] = useState<Answer | null>(null)
    const config = configSchema.parse(stored)

    return (
      <div className="grid gap-8 lg:grid-cols-2">
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-medium text-muted-foreground">Content</h2>
          <Editor value={config} locale={locale} onChange={(next) => onStoredChange(storedConfigSchema.parse(next))} />
        </section>
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-medium text-muted-foreground">Candidate preview</h2>
          <div className="rounded-lg border border-border p-4">
            <Candidate view={toView(config, locale)} value={answer} onChange={setAnswer} />
          </div>
        </section>
      </div>
    )
  }
}
