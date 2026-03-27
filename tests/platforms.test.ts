import assert from 'node:assert/strict'
import test from 'node:test'

import { normalizePlatform, supportsAudioExtraction } from '../src/lib/platforms.ts'

test('normalizes instagram aliases to canonical platform', () => {
    assert.equal(normalizePlatform('instagram'), 'instagram')
    assert.equal(normalizePlatform('ins'), 'instagram')
})

test('normalizes x aliases to canonical platform', () => {
    assert.equal(normalizePlatform('x'), 'x')
    assert.equal(normalizePlatform('twitter'), 'x')
})

test('marks x and instagram as audio-extractable platforms', () => {
    assert.equal(supportsAudioExtraction('instagram'), true)
    assert.equal(supportsAudioExtraction('x'), true)
    assert.equal(supportsAudioExtraction('bilibili'), false)
})
