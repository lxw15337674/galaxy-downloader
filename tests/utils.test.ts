import { describe, expect, it } from 'vitest'

import { formatDuration } from '../src/lib/utils.ts'

describe('formatDuration', () => {
it('formats short durations as mm:ss', () => {
    expect(formatDuration(65)).toBe('1:05')
    expect(formatDuration(3599)).toBe('59:59')
})

it('formats long durations as h:mm:ss', () => {
    expect(formatDuration(3600)).toBe('1:00:00')
    expect(formatDuration(3661)).toBe('1:01:01')
})
})
