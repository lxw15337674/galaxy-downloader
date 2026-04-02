import type { VideoAudioMode } from '@/lib/types'

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
    videoAudioMode?: VideoAudioMode
    videoDownloadUrl?: string | null
    audioDownloadUrl?: string | null
}

export interface ResultMediaActions {
    videoAction: ResultVideoAction
    audioAction: ResultAudioAction
}

function hasSourceUrl(url: string | null | undefined): boolean {
    return typeof url === 'string' && url.length > 0
}

export function getResultMediaActions({
    videoAudioMode,
    videoDownloadUrl,
    audioDownloadUrl,
}: ResultMediaActionInput): ResultMediaActions {
    const hasVideo = hasSourceUrl(videoDownloadUrl)
    const hasAudio = hasSourceUrl(audioDownloadUrl)

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
