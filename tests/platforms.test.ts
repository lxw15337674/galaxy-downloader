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

it('normalizes generic platform', () => {
    expect(normalizePlatform('generic')).toBe('generic')
})

it('normalizes kuaishou platform', () => {
    expect(normalizePlatform('kuaishou')).toBe('kuaishou')
})

it('normalizes newly added foreign platforms', () => {
    expect(normalizePlatform('vimeo')).toBe('vimeo')
    expect(normalizePlatform('dailymotion')).toBe('dailymotion')
    expect(normalizePlatform('streamable')).toBe('streamable')
    expect(normalizePlatform('reddit')).toBe('reddit')
    expect(normalizePlatform('newgrounds')).toBe('newgrounds')
    expect(normalizePlatform('tumblr')).toBe('tumblr')
    expect(normalizePlatform('pinterest')).toBe('pinterest')
    expect(normalizePlatform('vk')).toBe('vk')
    expect(normalizePlatform('okru')).toBe('okru')
    expect(normalizePlatform('twitch')).toBe('twitch')
    expect(normalizePlatform('soundcloud')).toBe('soundcloud')
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
