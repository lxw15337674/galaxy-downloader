import { NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8080"

const FORWARDED_REQUEST_HEADERS = [
    "accept",
    "content-type",
    "range",
] as const

type StreamingRequestInit = RequestInit & {
    duplex?: "half"
}

function buildUpstreamUrl(pathSegments: string[], request: NextRequest): URL {
    const upstream = new URL(`/api/${pathSegments.join("/")}`, API_BASE_URL)
    upstream.search = request.nextUrl.search
    return upstream
}

function buildUpstreamHeaders(request: NextRequest): Headers {
    const headers = new Headers()

    for (const headerName of FORWARDED_REQUEST_HEADERS) {
        const value = request.headers.get(headerName)
        if (value) {
            headers.set(headerName, value)
        }
    }

    return headers
}

async function proxyRequest(
    request: NextRequest,
    context: { params: Promise<{ path: string[] }> }
): Promise<Response> {
    const { path } = await context.params
    const upstreamUrl = buildUpstreamUrl(path, request)
    const method = request.method
    const headers = buildUpstreamHeaders(request)

    const upstreamInit: StreamingRequestInit = {
        method,
        headers,
        body: method === "GET" || method === "HEAD" ? undefined : request.body,
        duplex: method === "GET" || method === "HEAD" ? undefined : "half",
        redirect: "follow",
        cache: "no-store",
    }

    const upstreamResponse = await fetch(upstreamUrl, upstreamInit)

    const responseHeaders = new Headers()
    for (const [key, value] of upstreamResponse.headers) {
        if (key.toLowerCase() === "content-encoding") continue
        if (key.toLowerCase() === "transfer-encoding") continue
        responseHeaders.set(key, value)
    }

    return new NextResponse(upstreamResponse.body, {
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        headers: responseHeaders,
    })
}

export const GET = proxyRequest
export const POST = proxyRequest
export const PUT = proxyRequest
export const PATCH = proxyRequest
export const DELETE = proxyRequest
export const OPTIONS = proxyRequest
export const HEAD = proxyRequest
