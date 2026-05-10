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

export type ResultVideoAction = 'direct-download' | 'merge-then-download' | 'hide'
export type ResultAudioAction = 'direct-download' | 'extract-audio' | 'hide'

interface ResultMediaActionInput {
    videoAudioMode?: LegacyVideoAudioMode
    videoDownloadUrl?: string | null
    audioDownloadUrl?: string | null
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
    const videoAction = mediaActions.video === 'merge-then-download'
        ? (hasVideo && hasAudio ? 'merge-then-download' : 'hide')
        : (mediaActions.video === 'direct-download' && hasVideo ? 'direct-download' : 'hide')

    const audioAction = mediaActions.audio === 'direct-download'
        ? (hasAudio ? 'direct-download' : 'hide')
        : (mediaActions.audio === 'extract-audio' && hasVideo ? 'extract-audio' : 'hide')

    return {
        videoAction,
        audioAction,
    }
}

export function getResultMediaActions({
    videoAudioMode,
    videoDownloadUrl,
    audioDownloadUrl,
    mediaActions,
}: ResultMediaActionInput): ResultMediaActions {
    const hasVideo = hasSourceUrl(videoDownloadUrl)
    const hasAudio = hasSourceUrl(audioDownloadUrl)

    if (mediaActions) {
        return sanitizeProvidedMediaActions(mediaActions, hasVideo, hasAudio)
    }

    // Prefer native audio download whenever backend provides a direct audio url.
    if (hasAudio) {
        if (videoAudioMode === 'separate') {
            return {
                videoAction: hasVideo ? 'merge-then-download' : 'hide',
                audioAction: 'direct-download',
            }
        }

        return {
            videoAction: hasVideo ? 'direct-download' : 'hide',
            audioAction: 'direct-download',
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
            audioAction: hasAudio ? 'direct-download' : 'hide',
        }
    }

    if (videoAudioMode === 'muxed') {
        return {
            videoAction: hasVideo ? 'direct-download' : 'hide',
            audioAction: hasVideo ? 'extract-audio' : 'hide',
        }
    }

    if (videoAudioMode === 'not_applicable') {
        return {
            videoAction: hasVideo ? 'direct-download' : 'hide',
            audioAction: 'hide',
        }
    }

    return {
        videoAction: hasVideo ? 'direct-download' : 'hide',
        audioAction: hasVideo ? 'extract-audio' : 'hide',
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
