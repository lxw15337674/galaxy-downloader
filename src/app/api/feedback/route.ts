import { NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8080"

type StreamingRequestInit = RequestInit & {
    duplex?: "half"
}

function buildUpstreamHeaders(request: NextRequest): Headers {
    const headers = new Headers()
    const accept = request.headers.get("accept")
    const contentType = request.headers.get("content-type")

    if (accept) {
        headers.set("accept", accept)
    }

    if (contentType) {
        headers.set("content-type", contentType)
    }

    return headers
}

export async function POST(request: NextRequest): Promise<Response> {
    const upstreamUrl = new URL("/api/feedback", API_BASE_URL)
    const upstreamInit: StreamingRequestInit = {
        method: "POST",
        headers: buildUpstreamHeaders(request),
        body: request.body,
        duplex: "half",
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
