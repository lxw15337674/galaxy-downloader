import { describe, expect, it, vi } from 'vitest'

import { GET as getDownloadProxy } from '../src/app/api/hls-download-proxy/route.ts'
import { GET as getPlayProxy } from '../src/app/api/hls-play-proxy/route.ts'

function createRouteRequest(url: string, signal: AbortSignal) {
    return {
        nextUrl: new URL(url),
        headers: new Headers(),
        signal,
    }
}

describe('hls proxy routes', () => {
    it('forwards request.signal to the download proxy upstream fetch', async () => {
        const controller = new AbortController()
        const fetchMock = vi.fn(async () => new Response('ok'))
        vi.stubGlobal('fetch', fetchMock)

        try {
            await getDownloadProxy(
                createRouteRequest(
                    'https://downloader.bhwa233.com/api/hls-download-proxy?target=https%3A%2F%2Fcdn.example.com%2Fseg-001.ts&referer=https%3A%2F%2Fsite.example.com%2Fwatch',
                    controller.signal
                ) as never
            )
        } finally {
            vi.unstubAllGlobals()
        }

        expect(fetchMock).toHaveBeenCalledTimes(1)
        const firstDownloadCall = fetchMock.mock.calls[0] as unknown as [RequestInfo | URL, RequestInit | undefined]
        expect(firstDownloadCall[1]).toMatchObject({
            signal: controller.signal,
        })
    })

    it('forwards request.signal to the playback proxy upstream fetch', async () => {
        const controller = new AbortController()
        const fetchMock = vi.fn(async () => new Response('#EXTM3U', {
            headers: {
                'content-type': 'application/vnd.apple.mpegurl',
            },
        }))
        vi.stubGlobal('fetch', fetchMock)

        try {
            await getPlayProxy(
                createRouteRequest(
                    'https://downloader.bhwa233.com/api/hls-play-proxy?target=https%3A%2F%2Fcdn.example.com%2Findex.m3u8&referer=https%3A%2F%2Fsite.example.com%2Fwatch&accept=application%2Fvnd.apple.mpegurl',
                    controller.signal
                ) as never
            )
        } finally {
            vi.unstubAllGlobals()
        }

        expect(fetchMock).toHaveBeenCalledTimes(1)
        const firstPlaybackCall = fetchMock.mock.calls[0] as unknown as [RequestInfo | URL, RequestInit | undefined]
        expect(firstPlaybackCall[1]).toMatchObject({
            signal: controller.signal,
        })
    })
})
