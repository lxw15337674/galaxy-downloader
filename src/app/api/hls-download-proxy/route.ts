import { NextRequest, NextResponse } from 'next/server'

import { setXRobotsTag } from '@/lib/seo'

const DOWNLOAD_USER_AGENT =
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

export async function GET(request: NextRequest): Promise<Response> {
    let targetUrl: URL
    let refererUrl: URL | null = null

    try {
        targetUrl = parseHttpUrl(request.nextUrl.searchParams.get('target'), 'target')
        const rawReferer = request.nextUrl.searchParams.get('referer')
        refererUrl = rawReferer ? parseHttpUrl(rawReferer, 'referer') : null
    } catch (error) {
        return createJsonError(400, error instanceof Error ? error.message : 'Invalid request')
    }

    const upstreamHeaders = new Headers()
    upstreamHeaders.set('User-Agent', DOWNLOAD_USER_AGENT)
    upstreamHeaders.set('Accept', request.nextUrl.searchParams.get('accept') || '*/*')

    if (refererUrl) {
        upstreamHeaders.set('Referer', refererUrl.toString())
    }

    const range = request.headers.get('range')
    if (range) {
        upstreamHeaders.set('Range', range)
    }

    let upstreamResponse: Response
    try {
        upstreamResponse = await fetch(targetUrl, {
            method: 'GET',
            headers: upstreamHeaders,
            redirect: 'follow',
            cache: 'no-store',
        })
    } catch (error) {
        return createJsonError(
            502,
            error instanceof Error ? error.message : 'Failed to fetch upstream content'
        )
    }

    const responseHeaders = new Headers()
    for (const [key, value] of upstreamResponse.headers) {
        const normalized = key.toLowerCase()
        if (normalized === 'content-encoding' || normalized === 'transfer-encoding') {
            continue
        }
        responseHeaders.set(key, value)
    }
    setXRobotsTag(responseHeaders, ['noindex', 'nofollow', 'noarchive'])
    responseHeaders.set('Cache-Control', 'no-store')

    return new NextResponse(upstreamResponse.body, {
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        headers: responseHeaders,
    })
}
