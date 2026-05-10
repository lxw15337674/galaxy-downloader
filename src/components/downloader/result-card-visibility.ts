import type { MediaActions, UnifiedParseResultImage } from '@/lib/types'
import { isHlsPlaylistUrl } from '@/lib/hls-playback'

type LegacyVideoAudioMode = 'muxed' | 'separate' | 'pure_music' | 'not_applicable'

export interface SingleImageLoadState {
    loading: boolean
    error: boolean
}

export function shouldHideSingleImagePreview(
    singleImageMode: boolean,
    state?: SingleImageLoadState | null
): boolean {
    return singleImageMode && !!state && !state.loading && state.error
}

export type ResultVideoAction = 'direct-download' | 'merge-then-download' | 'browser-hls-download' | 'hide'
export type ResultAudioAction = 'direct-download' | 'extract-audio' | 'hide'

interface ResultMediaActionInput {
    videoAudioMode?: LegacyVideoAudioMode
    videoDownloadUrl?: string | null
    audioDownloadUrl?: string | null
    originDownloadVideoUrl?: string | null
    originDownloadAudioUrl?: string | null
    mediaActions?: MediaActions
}

export interface ResultMediaActions {
    videoAction: ResultVideoAction
    audioAction: ResultAudioAction
}

function hasSourceUrl(url: string | null | undefined): url is string {
    return typeof url === 'string' && url.length > 0
}

function sanitizeProvidedMediaActions(
    mediaActions: MediaActions,
    hasVideo: boolean,
    hasAudio: boolean
): ResultMediaActions {
    let videoAction: ResultVideoAction = 'hide'
    if (mediaActions.video === 'merge-then-download') {
        videoAction = hasVideo && hasAudio ? 'merge-then-download' : 'hide'
    } else if (mediaActions.video === 'direct-download') {
        videoAction = hasVideo ? 'direct-download' : 'hide'
    } else if (mediaActions.video === 'browser-hls-download') {
        videoAction = hasVideo ? 'browser-hls-download' : 'hide'
    }

    let audioAction: ResultAudioAction = 'hide'
    if (mediaActions.audio === 'direct-download') {
        audioAction = hasAudio ? 'direct-download' : 'hide'
    } else if (mediaActions.audio === 'extract-audio') {
        audioAction = hasVideo ? 'extract-audio' : 'hide'
    }

    return {
        videoAction,
        audioAction,
    }
}

export function getResultMediaActions({
    videoAudioMode,
    videoDownloadUrl,
    audioDownloadUrl,
    originDownloadVideoUrl,
    originDownloadAudioUrl,
    mediaActions,
}: ResultMediaActionInput): ResultMediaActions {
    const hasVideo = hasSourceUrl(videoDownloadUrl)
    const hasAudio = hasSourceUrl(audioDownloadUrl)

    if (mediaActions) {
        return sanitizeProvidedMediaActions(mediaActions, hasVideo, hasAudio)
    }

    const isVideoHls = isHlsPlaylistUrl(originDownloadVideoUrl) || isHlsPlaylistUrl(videoDownloadUrl)
    const isAudioHls = isHlsPlaylistUrl(originDownloadAudioUrl) || isHlsPlaylistUrl(audioDownloadUrl)

    // Prefer native audio download whenever backend provides a direct audio url.
    if (hasAudio) {
        if (videoAudioMode === 'separate') {
            return {
                videoAction: hasVideo ? 'merge-then-download' : 'hide',
                audioAction: isAudioHls ? 'hide' : 'direct-download',
            }
        }

        return {
            videoAction: hasVideo ? (isVideoHls ? 'browser-hls-download' : 'direct-download') : 'hide',
            audioAction: isAudioHls ? 'hide' : 'direct-download',
        }
    }

    if (videoAudioMode === 'separate') {
        return {
            videoAction: 'hide',
            audioAction: 'hide',
        }
    }

    if (videoAudioMode === 'pure_music') {
        return {
            videoAction: 'hide',
            audioAction: hasAudio ? (isAudioHls ? 'hide' : 'direct-download') : 'hide',
        }
    }

    if (videoAudioMode === 'muxed') {
        return {
            videoAction: hasVideo ? (isVideoHls ? 'browser-hls-download' : 'direct-download') : 'hide',
            audioAction: isVideoHls ? 'hide' : (hasVideo ? 'extract-audio' : 'hide'),
        }
    }

    if (videoAudioMode === 'not_applicable') {
        return {
            videoAction: hasVideo ? (isVideoHls ? 'browser-hls-download' : 'direct-download') : 'hide',
            audioAction: 'hide',
        }
    }

    return {
        videoAction: hasVideo ? (isVideoHls ? 'browser-hls-download' : 'direct-download') : 'hide',
        audioAction: isVideoHls ? 'hide' : (hasVideo ? 'extract-audio' : 'hide'),
    }
}

export function shouldShowVideoDownloadButton(videoDownloadUrl: string | null | undefined): boolean {
    return hasSourceUrl(videoDownloadUrl)
}

interface ResultDisplayImagesInput {
    noteType?: 'video' | 'image' | 'audio'
    images?: Array<string | UnifiedParseResultImage> | null
    coverUrl?: string | null
}

function extractResultImageUrl(value: string | UnifiedParseResultImage | null | undefined): string {
    if (typeof value === 'string') {
        return value.trim()
    }

    if (!value || typeof value !== 'object') {
        return ''
    }

    if (typeof value.url === 'string') {
        return value.url.trim()
    }

    if (typeof value.downloadUrl === 'string') {
        return value.downloadUrl.trim()
    }

    return ''
}

function normalizeResultImages(images?: Array<string | UnifiedParseResultImage> | null): string[] {
    const normalized = (images ?? [])
        .map((value) => extractResultImageUrl(value))
        .filter((value) => value.length > 0)

    return Array.from(new Set(normalized))
}

export function resolveResultDisplayImages({
    noteType,
    images,
    coverUrl,
}: ResultDisplayImagesInput): string[] {
    const normalizedImages = normalizeResultImages(images)

    if (noteType === 'image') {
        return normalizedImages
    }

    if (noteType === 'video' || noteType === 'audio') {
        return []
    }

    const normalizedCoverUrl = typeof coverUrl === 'string' ? coverUrl.trim() : ''
    if (!normalizedCoverUrl) {
        return normalizedImages
    }

    return normalizedImages.filter((imageUrl) => imageUrl !== normalizedCoverUrl)
}

export function shouldUseFrontendImageProxy(imageUrl: string | null | undefined): boolean {
    if (!hasSourceUrl(imageUrl)) {
        return false
    }

    const resolvedImageUrl = imageUrl

    if (!(resolvedImageUrl.startsWith('http://') || resolvedImageUrl.startsWith('https://'))) {
        return false
    }

    try {
        const parsed = new URL(resolvedImageUrl)
        if (parsed.pathname !== '/api/image-proxy' && parsed.pathname.endsWith('/download') && parsed.searchParams.has('index')) {
            return false
        }
        return parsed.pathname !== '/api/image-proxy'
    } catch {
        return false
    }
}
