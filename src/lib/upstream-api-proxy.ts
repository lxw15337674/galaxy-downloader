import { NextRequest, NextResponse } from "next/server"

import { setXRobotsTag } from "@/lib/seo"
import type { ApiErrorDetails, UnifiedApiResponse } from "@/lib/types"

const DEFAULT_DEV_API_BASE_URL = "http://localhost:8080"
const UPSTREAM_UNAVAILABLE_STATUS = 503

const FORWARDED_REQUEST_HEADERS = [
    "accept",
    "content-type",
    "range",
] as const

type StreamingRequestInit = RequestInit & {
    duplex?: "half"
}

type UpstreamConfigIssue = "missing_api_base_url" | "invalid_api_base_url"

function createUpstreamUnavailableResponse(details?: ApiErrorDetails): Response {
    const payload: UnifiedApiResponse = {
        success: false,
        code: "SERVICE_UNAVAILABLE",
        status: UPSTREAM_UNAVAILABLE_STATUS,
        error: "Upstream API is unavailable.",
        details,
    }

    const response = NextResponse.json(payload, {
        status: UPSTREAM_UNAVAILABLE_STATUS,
    })
    setXRobotsTag(response.headers, ["noindex", "nofollow", "noarchive"])
    return response
}

function resolveUpstreamBaseUrl(): { baseUrl: URL | null; issue?: UpstreamConfigIssue } {
    const configuredBaseUrl = process.env.API_BASE_URL?.trim()

    if (!configuredBaseUrl) {
        if (process.env.NODE_ENV === "production") {
            return {
                baseUrl: null,
                issue: "missing_api_base_url",
            }
        }

        return {
            baseUrl: new URL(DEFAULT_DEV_API_BASE_URL),
        }
    }

    try {
        return {
            baseUrl: new URL(configuredBaseUrl),
        }
    } catch {
        return {
            baseUrl: null,
            issue: "invalid_api_base_url",
        }
    }
}

function buildUpstreamUrl(baseUrl: URL, pathname: string, request: NextRequest): URL {
    const upstream = new URL(pathname, baseUrl)
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

export async function proxyUpstreamApi(
    request: NextRequest,
    pathname: string
): Promise<Response> {
    const { baseUrl, issue } = resolveUpstreamBaseUrl()
    if (!baseUrl) {
        return createUpstreamUnavailableResponse({
            reason: issue,
        })
    }

    const method = request.method
    const upstreamInit: StreamingRequestInit = {
        method,
        headers: buildUpstreamHeaders(request),
        body: method === "GET" || method === "HEAD" ? undefined : request.body,
        duplex: method === "GET" || method === "HEAD" ? undefined : "half",
        redirect: "follow",
        cache: "no-store",
    }

    let upstreamResponse: Response
    try {
        upstreamResponse = await fetch(buildUpstreamUrl(baseUrl, pathname, request), upstreamInit)
    } catch (error) {
        console.error("Failed to reach upstream API", {
            pathname,
            error: error instanceof Error ? error.message : String(error),
        })

        return createUpstreamUnavailableResponse({
            reason: "upstream_fetch_failed",
            pathname,
        })
    }

    const responseHeaders = new Headers()
    for (const [key, value] of upstreamResponse.headers) {
        if (key.toLowerCase() === "content-encoding") continue
        if (key.toLowerCase() === "transfer-encoding") continue
        responseHeaders.set(key, value)
    }
    setXRobotsTag(responseHeaders, ["noindex", "nofollow", "noarchive"])

    return new NextResponse(upstreamResponse.body, {
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        headers: responseHeaders,
    })
}
