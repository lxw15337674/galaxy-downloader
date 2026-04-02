import { ApiRequestError } from '@/lib/api-errors'
import { API_ENDPOINTS } from '@/lib/config'
import type { UnifiedParseResult } from '@/lib/types'

export type UnifiedParseSuccessResult = UnifiedParseResult & {
    success: true
    data: NonNullable<UnifiedParseResult['data']>
}

export async function requestUnifiedParse(videoUrl: string): Promise<UnifiedParseSuccessResult> {
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
