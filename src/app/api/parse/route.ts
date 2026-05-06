import { makeUpstreamApiProxy } from "@/lib/upstream-api-route"

const proxyParse = makeUpstreamApiProxy("/api/parse")

export const GET = proxyParse
export const POST = proxyParse
export const PUT = proxyParse
export const PATCH = proxyParse
export const DELETE = proxyParse
export const OPTIONS = proxyParse
export const HEAD = proxyParse
