import { describe, expect, it } from 'vitest'

import { normalizePlatform, supportsAudioExtraction } from '../src/lib/platforms.ts'

describe('platform helpers', () => {
it('normalizes instagram aliases to canonical platform', () => {
    expect(normalizePlatform('instagram')).toBe('instagram')
    expect(normalizePlatform('ins')).toBe('instagram')
})

it('normalizes x aliases to canonical platform', () => {
    expect(normalizePlatform('x')).toBe('x')
    expect(normalizePlatform('twitter')).toBe('x')
})

it('normalizes youtube platform', () => {
    expect(normalizePlatform('youtube')).toBe('youtube')
})

it('normalizes niconico aliases to canonical platform', () => {
    expect(normalizePlatform('niconico')).toBe('niconico')
    expect(normalizePlatform('nico')).toBe('niconico')
})

it('normalizes threads and weibo aliases to canonical platforms', () => {
    expect(normalizePlatform('threads')).toBe('threads')
    expect(normalizePlatform('weibo')).toBe('weibo')
})

it('marks supported social platforms as audio-extractable when needed', () => {
    expect(supportsAudioExtraction('instagram')).toBe(true)
    expect(supportsAudioExtraction('x')).toBe(true)
    expect(supportsAudioExtraction('threads')).toBe(true)
    expect(supportsAudioExtraction('weibo')).toBe(true)
    expect(supportsAudioExtraction('youtube')).toBe(false)
    expect(supportsAudioExtraction('niconico')).toBe(false)
    expect(supportsAudioExtraction('bilibili')).toBe(false)
})
})
