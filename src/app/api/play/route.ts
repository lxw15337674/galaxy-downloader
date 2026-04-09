import { NextRequest } from "next/server"

import { proxyUpstreamApi } from "@/lib/upstream-api-proxy"

function proxyPlay(request: NextRequest): Promise<Response> {
    return proxyUpstreamApi(request, "/api/play")
}

export const GET = proxyPlay
export const POST = proxyPlay
export const PUT = proxyPlay
export const PATCH = proxyPlay
export const DELETE = proxyPlay
export const OPTIONS = proxyPlay
export const HEAD = proxyPlay
