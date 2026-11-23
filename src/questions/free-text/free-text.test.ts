import { describe, expect, it } from 'vitest'
import { configSchema, findIssues } from './free-text.config'
import type { Config } from './free-text.config'
import { freeTextServer } from './free-text.server'
import { MAX_ANSWER_LENGTH } from './free-text.shared'

const config: Config = {
  prompt: { fr: 'Capitale du Royaume-Uni ?', en: 'Capital of the United Kingdom?' },
  acceptedAnswers: { fr: ['Londres', 'événement'], en: ['London'] },
}

describe('configSchema', () => {
  it('reads the empty draft of a new question', () => {
    expect(configSchema.parse({})).toEqual({ prompt: {}, acceptedAnswers: {} })
  })
})

describe('toPublic', () => {
  it('returns the prompt of the requested locale and no accepted answer', () => {
    expect(freeTextServer.toPublic(config, 'en', 'seed')).toEqual({ prompt: 'Capital of the United Kingdom?' })
  })
})

describe('grade', () => {
  it('accepts an answer of the candidate locale', async () => {
    expect(await freeTextServer.grade(config, { text: 'Londres' }, 'fr')).toMatchObject({ score: 1, maxScore: 1 })
  })

  it('rejects an answer accepted only in another locale', async () => {
    expect(await freeTextServer.grade(config, { text: 'London' }, 'fr')).toMatchObject({ score: 0, maxScore: 1 })
  })

  it('ignores surrounding and repeated spaces', async () => {
    const spaced = { prompt: { fr: 'Capitale ?' }, acceptedAnswers: { fr: ['New York'] } }

    expect(await freeTextServer.grade(spaced, { text: '  New   York ' }, 'fr')).toMatchObject({ score: 1 })
  })

  it('treats composed and decomposed accents as the same answer', async () => {
    expect(await freeTextServer.grade(config, { text: 'événement' }, 'fr')).toMatchObject({ score: 1 })
  })

  it('is case-sensitive', async () => {
    expect(await freeTextServer.grade(config, { text: 'londres' }, 'fr')).toMatchObject({ score: 0 })
  })

  it('rejects every answer in a locale with no accepted answer', async () => {
    const frenchOnly = { prompt: { fr: 'Capitale ?' }, acceptedAnswers: { fr: ['Londres'] } }

    expect(await freeTextServer.grade(frenchOnly, { text: '' }, 'en')).toMatchObject({ score: 0 })
  })
})

describe('findIssues', () => {
  it('finds nothing in a complete locale', () => {
    expect(findIssues(config, 'fr')).toEqual([])
  })

  it('reports a blank and an overlong accepted answer by index', () => {
    const invalid = {
      prompt: { fr: 'Capitale ?' },
      acceptedAnswers: { fr: ['Londres', '   ', 'x'.repeat(MAX_ANSWER_LENGTH + 1)] },
    }

    expect(findIssues(invalid, 'fr')).toEqual([
      { path: 'acceptedAnswers.1', message: 'the accepted answer is blank' },
      { path: 'acceptedAnswers.2', message: 'the accepted answer is longer than a candidate can type' },
    ])
  })
})
