import { describe, expect, it } from 'vitest'

import {
    buildHlsPlayProxyUrl,
    isHlsPlaylistResponse,
    rewriteHlsPlaylist,
} from '../src/lib/hls-playback.ts'

describe('hls playback helpers', () => {
    it('builds a same-origin playback proxy url', () => {
        expect(buildHlsPlayProxyUrl(
            'https://cdn.example.com/master.m3u8',
            'https://site.example.com/watch/1'
        )).toBe(
            '/api/hls-play-proxy?target=https%3A%2F%2Fcdn.example.com%2Fmaster.m3u8&referer=https%3A%2F%2Fsite.example.com%2Fwatch%2F1'
        )
    })

    it('detects hls playlists by content type, extension, or body', () => {
        expect(isHlsPlaylistResponse('https://cdn.example.com/master.m3u8', null)).toBe(true)
        expect(isHlsPlaylistResponse('https://cdn.example.com/raw', 'application/vnd.apple.mpegurl')).toBe(true)
        expect(isHlsPlaylistResponse('https://cdn.example.com/raw', 'text/plain', '#EXTM3U\n#EXTINF:4.0,\nseg.ts')).toBe(true)
        expect(isHlsPlaylistResponse('https://cdn.example.com/video.mp4', 'video/mp4')).toBe(false)
    })

    it('rewrites playlist targets, keys, and maps to same-origin proxy urls', () => {
        const rewritten = rewriteHlsPlaylist(
            [
                '#EXTM3U',
                '#EXT-X-STREAM-INF:BANDWIDTH=2400000',
                'high/index.m3u8',
                '#EXT-X-KEY:METHOD=AES-128,URI="enc.key"',
                '#EXT-X-MAP:URI="init.mp4"',
                '#EXTINF:4.0,',
                'seg-000.ts',
            ].join('\n'),
            'https://cdn.example.com/master/index.m3u8',
            'https://site.example.com/watch/1'
        )

        expect(rewritten).toContain(
            '/api/hls-play-proxy?target=https%3A%2F%2Fcdn.example.com%2Fmaster%2Fhigh%2Findex.m3u8&referer=https%3A%2F%2Fsite.example.com%2Fwatch%2F1&accept='
        )
        expect(rewritten).toContain(
            '#EXT-X-KEY:METHOD=AES-128,URI="/api/hls-play-proxy?target=https%3A%2F%2Fcdn.example.com%2Fmaster%2Fenc.key&referer=https%3A%2F%2Fsite.example.com%2Fwatch%2F1"'
        )
        expect(rewritten).toContain(
            '#EXT-X-MAP:URI="/api/hls-play-proxy?target=https%3A%2F%2Fcdn.example.com%2Fmaster%2Finit.mp4&referer=https%3A%2F%2Fsite.example.com%2Fwatch%2F1"'
        )
        expect(rewritten).toContain(
            '/api/hls-play-proxy?target=https%3A%2F%2Fcdn.example.com%2Fmaster%2Fseg-000.ts&referer=https%3A%2F%2Fsite.example.com%2Fwatch%2F1'
        )
    })
})
