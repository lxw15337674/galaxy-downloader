import { API_ENDPOINTS } from '@/lib/config'
import type { EmbeddedVideoInfo, PageInfo, UnifiedParseResult } from '@/lib/types'

import { getResultMediaActions, shouldShowVideoDownloadButton } from './result-card-visibility'

export type PreviewMediaType = 'video' | 'audio'

export interface MediaPreviewRequest {
    mediaType: PreviewMediaType
    sourceUrl: string
    title: string
    item?: string
    autoplay?: boolean
    origin?: 'share' | 'result' | 'user'
}

type ParsedResultData = NonNullable<UnifiedParseResult['data']>

function hasSourceUrl(url: string | null | undefined): url is string {
    return typeof url === 'string' && url.trim().length > 0
}

export function buildMediaPreviewUrl(request: MediaPreviewRequest): string {
    const params = new URLSearchParams({
        url: request.sourceUrl,
        type: request.mediaType,
    })

    if (request.item) {
        params.set('item', request.item)
    }

    return `${API_ENDPOINTS.unified.play}?${params.toString()}`
}

export function canPreviewResultVideo(result: ParsedResultData): boolean {
    const videoDownloadUrl = result.downloadVideoUrl || result.originDownloadVideoUrl || null
    const audioDownloadUrl = result.downloadAudioUrl || result.originDownloadAudioUrl || null
    const { videoAction } = getResultMediaActions({
        videoDownloadUrl,
        audioDownloadUrl,
        mediaActions: result.mediaActions,
    })

    return videoAction === 'direct-download' && shouldShowVideoDownloadButton(videoDownloadUrl)
}

export function canPreviewResultAudio(result: ParsedResultData): boolean {
    const videoDownloadUrl = result.downloadVideoUrl || result.originDownloadVideoUrl || null
    const audioDownloadUrl = result.downloadAudioUrl || result.originDownloadAudioUrl || null
    const { audioAction } = getResultMediaActions({
        videoDownloadUrl,
        audioDownloadUrl,
        mediaActions: result.mediaActions,
    })

    return audioAction === 'direct-download' && hasSourceUrl(audioDownloadUrl)
}

export function canSharePlayResult(result: ParsedResultData): boolean {
    return canPreviewResultVideo(result)
}

export function buildPrimaryResultPreview(
    result: ParsedResultData,
    options: {
        autoplay?: boolean
        preferAudio?: boolean
    } = {}
): MediaPreviewRequest | null {
    const sourceUrl = result.url.trim()
    if (!sourceUrl) {
        return null
    }

    const mediaTypes: PreviewMediaType[] = options.preferAudio
        ? ['audio', 'video']
        : ['video', 'audio']

    for (const mediaType of mediaTypes) {
        if (mediaType === 'video' && canPreviewResultVideo(result)) {
            return {
                mediaType,
                sourceUrl,
                title: result.title,
                autoplay: options.autoplay,
            }
        }

        if (mediaType === 'audio' && canPreviewResultAudio(result)) {
            return {
                mediaType,
                sourceUrl,
                title: result.title,
                autoplay: options.autoplay,
            }
        }
    }

    return null
}

export function buildPagePreview(
    sourceUrl: string,
    page: PageInfo,
    options: {
        autoplay?: boolean
        preferAudio?: boolean
    } = {}
): MediaPreviewRequest | null {
    if (!sourceUrl.trim()) {
        return null
    }

    const mediaTypes: PreviewMediaType[] = options.preferAudio
        ? ['audio', 'video']
        : ['video', 'audio']

    for (const mediaType of mediaTypes) {
        if (mediaType === 'video' && canPreviewPageVideo(page)) {
            return {
                mediaType,
                sourceUrl,
                title: page.part,
                item: String(page.page),
                autoplay: options.autoplay,
            }
        }

        if (mediaType === 'audio' && canPreviewPageAudio(page)) {
            return {
                mediaType,
                sourceUrl,
                title: page.part,
                item: String(page.page),
                autoplay: options.autoplay,
            }
        }
    }

    return null
}

export function buildEmbeddedVideoPreview(
    sourceUrl: string,
    video: EmbeddedVideoInfo,
    options: {
        autoplay?: boolean
        preferAudio?: boolean
    } = {}
): MediaPreviewRequest | null {
    if (!sourceUrl.trim()) {
        return null
    }

    const mediaTypes: PreviewMediaType[] = options.preferAudio
        ? ['audio', 'video']
        : ['video', 'audio']

    for (const mediaType of mediaTypes) {
        if (mediaType === 'video' && canPreviewEmbeddedVideoVideo(video)) {
            return {
                mediaType,
                sourceUrl,
                title: video.title,
                item: video.id,
                autoplay: options.autoplay,
            }
        }

        if (mediaType === 'audio' && canPreviewEmbeddedVideoAudio(video)) {
            return {
                mediaType,
                sourceUrl,
                title: video.title,
                item: video.id,
                autoplay: options.autoplay,
            }
        }
    }

    return null
}

export function canPreviewPageVideo(page: PageInfo): boolean {
    if (!shouldShowVideoDownloadButton(page.downloadVideoUrl)) {
        return false
    }

    if (page.videoAudioMode === 'muxed') {
        return true
    }

    return !hasSourceUrl(page.downloadAudioUrl)
}

export function canPreviewPageAudio(page: PageInfo): boolean {
    return hasSourceUrl(page.downloadAudioUrl)
}

export function canPreviewEmbeddedVideoVideo(video: EmbeddedVideoInfo): boolean {
    const videoDownloadUrl = video.downloadVideoUrl || video.originDownloadVideoUrl || null
    const audioDownloadUrl = video.downloadAudioUrl || video.originDownloadAudioUrl || null
    const { videoAction } = getResultMediaActions({
        videoDownloadUrl,
        audioDownloadUrl,
        mediaActions: video.mediaActions,
    })

    return videoAction === 'direct-download' && shouldShowVideoDownloadButton(videoDownloadUrl)
}

export function canPreviewEmbeddedVideoAudio(video: EmbeddedVideoInfo): boolean {
    const videoDownloadUrl = video.downloadVideoUrl || video.originDownloadVideoUrl || null
    const audioDownloadUrl = video.downloadAudioUrl || video.originDownloadAudioUrl || null
    const { audioAction } = getResultMediaActions({
        videoDownloadUrl,
        audioDownloadUrl,
        mediaActions: video.mediaActions,
    })

    return audioAction === 'direct-download' && hasSourceUrl(audioDownloadUrl)
}
