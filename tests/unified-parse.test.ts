import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { UnifiedParseResult } from '../src/lib/types.ts'
import {
    UnifiedParseReloadError,
    requestUnifiedParse,
    resetUnifiedParseAttemptCountForTests,
} from '../src/lib/unified-parse.ts'

const responsePayload = {
    success: true,
    data: {
        title: 'Parsed title',
        platform: 'youtube',
        downloadAudioUrl: null,
        downloadVideoUrl: null,
        url: 'https://example.com/watch?v=1',
    },
} satisfies UnifiedParseResult

describe('requestUnifiedParse reload guard', () => {
    const reload = vi.fn()
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(responsePayload), {
        status: 200,
        headers: {
            'content-type': 'application/json',
        },
    }))

    beforeEach(() => {
        resetUnifiedParseAttemptCountForTests()
        reload.mockClear()
        fetchMock.mockClear()

        vi.stubGlobal('window', {
            location: {
                reload,
            },
        } as never)

        vi.stubGlobal('fetch', fetchMock as never)
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        resetUnifiedParseAttemptCountForTests()
    })

    it('reloads on the 61st parse attempt before sending another request', async () => {
        for (let index = 0; index < 60; index += 1) {
            await requestUnifiedParse('https://example.com/watch?v=1')
        }

        expect(fetchMock).toHaveBeenCalledTimes(60)

        await expect(requestUnifiedParse('https://example.com/watch?v=1')).rejects.toBeInstanceOf(
            UnifiedParseReloadError
        )

        expect(reload).toHaveBeenCalledTimes(1)
        expect(fetchMock).toHaveBeenCalledTimes(60)
    })
})
