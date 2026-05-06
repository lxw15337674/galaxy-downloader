import { makeUpstreamApiProxy } from "@/lib/upstream-api-route"

export const POST = makeUpstreamApiProxy("/api/feedback")
