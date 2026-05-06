import { makeUpstreamApiProxy } from "@/lib/upstream-api-route"

const proxyPlay = makeUpstreamApiProxy("/api/play")

export const GET = proxyPlay
export const POST = proxyPlay
export const PUT = proxyPlay
export const PATCH = proxyPlay
export const DELETE = proxyPlay
export const OPTIONS = proxyPlay
export const HEAD = proxyPlay
