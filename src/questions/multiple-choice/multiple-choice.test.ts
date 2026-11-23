import { describe, expect, it } from 'vitest'
import { configSchema, findIssues } from './multiple-choice.config'
import type { Config } from './multiple-choice.config'
import { multipleChoiceServer } from './multiple-choice.server'
import { viewSchema } from './multiple-choice.shared'

const config: Config = {
  prompt: { fr: 'Capitale de la France ?', en: 'Capital of France?' },
  options: [
    { id: 'a', text: { fr: 'Lyon', en: 'Lyons' }, correct: false },
    { id: 'b', text: { fr: 'Paris', en: 'Paris' }, correct: true },
    { id: 'c', text: { fr: 'Marseille' }, correct: false },
  ],
}

function publicView(locale: 'fr' | 'en', seed: string) {
  return viewSchema.parse(multipleChoiceServer.toPublic(config, locale, seed))
}

describe('configSchema', () => {
  it('reads the empty draft of a new question', () => {
    expect(configSchema.parse({})).toEqual({ prompt: {}, options: [] })
  })
})

describe('toPublic', () => {
  it('returns the texts of the requested locale and nothing about correctness', () => {
    const view = publicView('en', 'seed')
    const options = view.options.sort((left, right) => left.id.localeCompare(right.id))

    expect(JSON.stringify(multipleChoiceServer.toPublic(config, 'en', 'seed'))).not.toContain('correct')
    expect({ ...view, options }).toEqual({
      prompt: 'Capital of France?',
      options: [
        { id: 'a', text: 'Lyons' },
        { id: 'b', text: 'Paris' },
        { id: 'c', text: '' },
      ],
    })
  })

  it('orders options the same way for the same seed', () => {
    expect(publicView('fr', 'seed-1')).toEqual(publicView('fr', 'seed-1'))
  })

  it('orders options differently across seeds', () => {
    const orders = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'].map((seed) =>
      publicView('fr', seed)
        .options.map((option) => option.id)
        .join(''),
    )

    expect(new Set(orders).size).toBeGreaterThan(1)
  })
})

describe('grade', () => {
  it('gives the point only for the correct option', async () => {
    expect(await multipleChoiceServer.grade(config, { optionId: 'b' }, 'fr')).toMatchObject({ score: 1, maxScore: 1 })
    expect(await multipleChoiceServer.grade(config, { optionId: 'a' }, 'fr')).toMatchObject({ score: 0, maxScore: 1 })
  })

  it('rejects an answer that is not a chosen option', async () => {
    await expect(multipleChoiceServer.grade(config, { text: 'Paris' }, 'fr')).rejects.toThrow()
  })

  it('gives no point for an option that does not exist', async () => {
    expect(await multipleChoiceServer.grade(config, { optionId: 'z' }, 'fr')).toMatchObject({ score: 0, maxScore: 1 })
  })
})

describe('findIssues', () => {
  it('finds nothing in a complete locale', () => {
    expect(findIssues({ ...config, options: config.options.slice(0, 2) }, 'en')).toEqual([])
  })

  it('reports a text missing in the checked locale only', () => {
    expect(findIssues(config, 'fr')).toEqual([])
    expect(findIssues(config, 'en')).toEqual([{ path: 'options.2.text', message: 'the option text is empty' }])
  })

  it('reports a single option with no correct answer', () => {
    const single = { prompt: { fr: 'Capitale ?' }, options: [{ id: 'a', text: { fr: 'Paris' }, correct: false }] }

    expect(findIssues(single, 'fr')).toEqual([
      { path: 'options', message: 'at least two options are required' },
      { path: 'options', message: 'exactly one option must be correct' },
    ])
  })

  it('reports two correct options', () => {
    const twoCorrect = {
      prompt: { fr: 'Capitale ?' },
      options: [
        { id: 'a', text: { fr: 'Paris' }, correct: true },
        { id: 'b', text: { fr: 'Lyon' }, correct: true },
      ],
    }

    expect(findIssues(twoCorrect, 'fr')).toEqual([{ path: 'options', message: 'exactly one option must be correct' }])
  })

  it('reports duplicated and missing option ids', () => {
    const badIds = {
      prompt: { fr: 'Capitale ?' },
      options: [
        { id: '', text: { fr: 'Paris' }, correct: true },
        { id: '', text: { fr: 'Lyon' }, correct: false },
      ],
    }

    expect(findIssues(badIds, 'fr')).toEqual([
      { path: 'options', message: 'option ids must be unique' },
      { path: 'options.0.id', message: 'the option has no id' },
      { path: 'options.1.id', message: 'the option has no id' },
    ])
  })
})
