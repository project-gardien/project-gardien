import { z } from 'zod'

export const type = 'multiple-choice'

export const viewSchema = z.object({
  prompt: z.string(),
  options: z.array(z.object({ id: z.string(), text: z.string() })),
})

export const answerSchema = z.object({ optionId: z.string() })

export type View = z.infer<typeof viewSchema>
export type Answer = z.infer<typeof answerSchema>
