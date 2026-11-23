import { z } from 'zod'

export const type = 'free-text'

export const MAX_ANSWER_LENGTH = 2000

export const viewSchema = z.object({
  prompt: z.string(),
})

export const answerSchema = z.object({ text: z.string().max(MAX_ANSWER_LENGTH) })

export type View = z.infer<typeof viewSchema>
export type Answer = z.infer<typeof answerSchema>
