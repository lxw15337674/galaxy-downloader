import { NextRequest, NextResponse } from 'next/server'

import {
    HLS_PLAYLIST_ACCEPT,
    isHlsPlaylistResponse,
    isHlsPlaylistUrl,
    rewriteHlsPlaylist,
} from '@/lib/hls-playback'
import { setXRobotsTag } from '@/lib/seo'

const PLAYBACK_USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36'

function parseHttpUrl(value: string | null, fieldName: string): URL {
    if (!value) {
        throw new Error(`Missing ${fieldName}`)
    }

    let parsed: URL
    try {
        parsed = new URL(value)
    } catch {
        throw new Error(`Invalid ${fieldName}`)
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error(`Unsupported ${fieldName} protocol`)
    }

    return parsed
}

function createJsonError(status: number, error: string): Response {
    const response = NextResponse.json({ success: false, error }, { status })
    setXRobotsTag(response.headers, ['noindex', 'nofollow', 'noarchive'])
    return response
}

function createPassthroughHeaders(
    upstreamResponse: Response,
    options: { stripContentLength?: boolean } = {}
): Headers {
    const headers = new Headers()

    for (const [key, value] of upstreamResponse.headers) {
        const normalized = key.toLowerCase()
        if (normalized === 'content-encoding' || normalized === 'transfer-encoding') {
            continue
        }
        if (options.stripContentLength && normalized === 'content-length') {
            continue
        }

        headers.set(key, value)
    }

    setXRobotsTag(headers, ['noindex', 'nofollow', 'noarchive'])
    headers.set('Cache-Control', 'no-store')
    return headers
}

export async function GET(request: NextRequest): Promise<Response> {
    let targetUrl: URL
    let refererUrl: URL

    try {
        targetUrl = parseHttpUrl(request.nextUrl.searchParams.get('target'), 'target')
        refererUrl = parseHttpUrl(request.nextUrl.searchParams.get('referer'), 'referer')
    } catch (error) {
        return createJsonError(400, error instanceof Error ? error.message : 'Invalid request')
    }

    const upstreamHeaders = new Headers()
    upstreamHeaders.set('User-Agent', PLAYBACK_USER_AGENT)
    const requestedAccept = request.nextUrl.searchParams.get('accept') || '*/*'
    const likelyPlaylistRequest = isHlsPlaylistUrl(targetUrl.toString())
        || requestedAccept.includes('mpegurl')
        || requestedAccept === HLS_PLAYLIST_ACCEPT
    upstreamHeaders.set('Accept', requestedAccept)
    upstreamHeaders.set('Referer', refererUrl.toString())

    const range = request.headers.get('range')
    if (range && !likelyPlaylistRequest) {
        upstreamHeaders.set('Range', range)
    }

    let upstreamResponse: Response
    try {
        upstreamResponse = await fetch(targetUrl, {
            method: 'GET',
            headers: upstreamHeaders,
            redirect: 'follow',
            cache: 'no-store',
            signal: request.signal,
        })
    } catch (error) {
        return createJsonError(
            502,
            error instanceof Error ? error.message : 'Failed to fetch upstream content'
        )
    }

    if (!upstreamResponse.ok && upstreamResponse.status !== 206) {
        const headers = createPassthroughHeaders(upstreamResponse)
        return new NextResponse(upstreamResponse.body, {
            status: upstreamResponse.status,
            statusText: upstreamResponse.statusText,
            headers,
        })
    }

    const contentType = upstreamResponse.headers.get('content-type')
    const shouldRewritePlaylist = isHlsPlaylistResponse(targetUrl.toString(), contentType)

    if (shouldRewritePlaylist) {
        const playlistText = await upstreamResponse.text()
        const rewritten = rewriteHlsPlaylist(playlistText, targetUrl.toString(), refererUrl.toString())
        const headers = createPassthroughHeaders(upstreamResponse, { stripContentLength: true })
        headers.set('Content-Type', 'application/vnd.apple.mpegurl')
        headers.delete('Content-Disposition')

        return new NextResponse(rewritten, {
            status: upstreamResponse.status,
            statusText: upstreamResponse.statusText,
            headers,
        })
    }

    const headers = createPassthroughHeaders(upstreamResponse)
    return new NextResponse(upstreamResponse.body, {
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        headers,
    })
}
