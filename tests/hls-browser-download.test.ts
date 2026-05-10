import { describe, expect, it } from 'vitest'

import {
    buildRangeHeader,
    inferHlsOutputExtension,
    NON_STREAMING_BROWSER_MAX_SEGMENTS,
    parseHlsMediaPlaylist,
    pickBestVariant,
    shouldBlockLargeHlsDownloadWithoutStreamingSave,
} from '../src/lib/hls-browser-download.ts'

describe('hls browser download helpers', () => {
    it('picks the highest bandwidth variant from a master playlist', () => {
        const playlist = [
            '#EXTM3U',
            '#EXT-X-STREAM-INF:BANDWIDTH=800000',
            'low/index.m3u8',
            '#EXT-X-STREAM-INF:BANDWIDTH=2400000',
            'high/index.m3u8',
        ].join('\n')

        expect(pickBestVariant(playlist, 'https://example.com/master.m3u8')).toEqual({
            bandwidth: 2400000,
            url: 'https://example.com/high/index.m3u8',
        })
    })

    it('parses media playlists with map, byte-range, and implicit AES sequence IV', () => {
        const playlist = [
            '#EXTM3U',
            '#EXT-X-VERSION:6',
            '#EXT-X-TARGETDURATION:4',
            '#EXT-X-MEDIA-SEQUENCE:7',
            '#EXT-X-MAP:URI="init.mp4",BYTERANGE="1000@0"',
            '#EXT-X-KEY:METHOD=AES-128,URI="enc.key"',
            '#EXTINF:4.0,',
            'seg-000.ts',
            '#EXT-X-BYTERANGE:200@1000',
            '#EXTINF:4.0,',
            'seg-001.ts',
        ].join('\n')

        const parsed = parseHlsMediaPlaylist(playlist, 'https://example.com/video/index.m3u8')
        expect(parsed.mapUrl).toBe('https://example.com/video/init.mp4')
        expect(parsed.mapByterange).toEqual({ start: 0, end: 999 })
        expect(parsed.encrypted).toBe(true)
        expect(parsed.segments).toHaveLength(2)
        expect(parsed.segments[0]).toMatchObject({
            url: 'https://example.com/video/seg-000.ts',
            keyUrl: 'https://example.com/video/enc.key',
        })
        expect(Array.from(parsed.segments[0].iv || [])).toEqual([
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7,
        ])
        expect(parsed.segments[1].byterange).toEqual({ start: 1000, end: 1199 })
    })

    it('builds a valid HTTP Range header', () => {
        expect(buildRangeHeader({ start: 100, end: 299 })).toBe('bytes=100-299')
    })

    it('always exports browser hls downloads with an mp4 extension', () => {
        expect(inferHlsOutputExtension(null, [
            { url: 'https://example.com/video/seg-000.ts' },
        ])).toBe('mp4')

        expect(inferHlsOutputExtension('https://example.com/video/init.mp4', [
            { url: 'https://example.com/video/seg-000.m4s' },
        ])).toBe('mp4')
    })

    it('blocks oversized downloads when the browser cannot stream directly to disk', () => {
        expect(
            shouldBlockLargeHlsDownloadWithoutStreamingSave(
                NON_STREAMING_BROWSER_MAX_SEGMENTS,
                false
            )
        ).toBe(false)

        expect(
            shouldBlockLargeHlsDownloadWithoutStreamingSave(
                NON_STREAMING_BROWSER_MAX_SEGMENTS + 1,
                false
            )
        ).toBe(true)

        expect(
            shouldBlockLargeHlsDownloadWithoutStreamingSave(
                NON_STREAMING_BROWSER_MAX_SEGMENTS + 500,
                true
            )
        ).toBe(false)
    })
})
