import { makeUpstreamApiProxy } from "@/lib/upstream-api-route"

const proxyDownload = makeUpstreamApiProxy("/api/download")

export const GET = proxyDownload
export const POST = proxyDownload
export const PUT = proxyDownload
export const PATCH = proxyDownload
export const DELETE = proxyDownload
export const OPTIONS = proxyDownload
export const HEAD = proxyDownload
