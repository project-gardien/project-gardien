import { describe, expect, it } from 'vitest'
import type { StoredConfig } from '#/schemas/stored-config'
import { findLocaleIssues } from './question-types.server'

const bilingual = {
  prompt: { fr: 'Capitale de la France ?', en: 'Capital of France?' },
  acceptedAnswers: { fr: ['Paris'], en: ['Paris'] },
}

const frenchOnly = { prompt: { fr: 'Capitale de la France ?' }, acceptedAnswers: { fr: ['Paris'] } }

describe('findLocaleIssues', () => {
  it('finds nothing when every offered locale is complete', () => {
    expect(findLocaleIssues('free-text', bilingual, ['fr', 'en'])).toEqual([])
  })

  it('reports an untranslated locale and leaves the complete one alone', () => {
    expect(findLocaleIssues('free-text', frenchOnly, ['fr', 'en'])).toEqual([
      { locale: 'en', path: 'prompt', message: 'the prompt is empty' },
      { locale: 'en', path: 'acceptedAnswers', message: 'at least one accepted answer is required' },
    ])
  })

  it('ignores locales that are not offered', () => {
    expect(findLocaleIssues('free-text', frenchOnly, ['fr'])).toEqual([])
  })

  it('reports a problem in a shared field once per offered locale', () => {
    const noCorrectOption = {
      prompt: { fr: 'Capitale de la France ?', en: 'Capital of France?' },
      options: [
        { id: 'a', text: { fr: 'Paris', en: 'Paris' }, correct: false },
        { id: 'b', text: { fr: 'Lyon', en: 'Lyon' }, correct: false },
      ],
    }

    expect(findLocaleIssues('multiple-choice', noCorrectOption, ['fr', 'en'])).toEqual([
      { locale: 'fr', path: 'options', message: 'exactly one option must be correct' },
      { locale: 'en', path: 'options', message: 'exactly one option must be correct' },
    ])
  })

  it('reports the index of the item at fault', () => {
    const untranslatedOption: StoredConfig = {
      prompt: { fr: 'Capitale de la France ?', en: 'Capital of France?' },
      options: [
        { id: 'a', text: { fr: 'Paris', en: 'Paris' }, correct: true },
        { id: 'b', text: { fr: 'Lyon' }, correct: false },
      ],
    }

    expect(findLocaleIssues('multiple-choice', untranslatedOption, ['fr', 'en'])).toEqual([
      { locale: 'en', path: 'options.1.text', message: 'the option text is empty' },
    ])
  })
})
