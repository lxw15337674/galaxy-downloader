import { ApiRequestError } from '@/lib/api-errors'
import { API_ENDPOINTS } from '@/lib/config'
import type { UnifiedParseResult } from '@/lib/types'

const UNIFIED_PARSE_RELOAD_THRESHOLD = 60

export type UnifiedParseSuccessResult = UnifiedParseResult & {
    success: true
    data: NonNullable<UnifiedParseResult['data']>
}

let unifiedParseAttemptCount = 0

export class UnifiedParseReloadError extends Error {
    constructor() {
        super('Unified parse threshold reached')
        this.name = 'UnifiedParseReloadError'
    }
}

export function resetUnifiedParseAttemptCountForTests() {
    unifiedParseAttemptCount = 0
}

function maybeReloadUnifiedParsePage(): boolean {
    if (typeof window === 'undefined') {
        return false
    }

    if (unifiedParseAttemptCount >= UNIFIED_PARSE_RELOAD_THRESHOLD) {
        window.location.reload()
        return true
    }

    unifiedParseAttemptCount += 1
    return false
}

export async function requestUnifiedParse(videoUrl: string): Promise<UnifiedParseSuccessResult> {
    if (maybeReloadUnifiedParsePage()) {
        throw new UnifiedParseReloadError()
    }

    const params = new URLSearchParams({ url: videoUrl })
    const requestUrl = `${API_ENDPOINTS.unified.parse}?${params.toString()}`
    const response = await fetch(requestUrl, {
        method: 'GET',
        cache: 'no-store',
    })

    let payload: UnifiedParseResult | null = null
    try {
        payload = await response.json() as UnifiedParseResult
    } catch {
        throw new ApiRequestError({
            status: response.status,
        })
    }

    if (!response.ok || !payload?.success || !payload.data) {
        throw new ApiRequestError({
            code: payload?.code,
            status: payload?.status ?? response.status,
            requestId: payload?.requestId,
            details: payload?.details,
            fallbackMessage: payload?.error || payload?.message,
        })
    }

    return payload as UnifiedParseSuccessResult
}
