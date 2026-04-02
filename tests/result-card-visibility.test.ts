import { describe, expect, it } from 'vitest'

import {
    getResultMediaActions,
    shouldHideSingleImagePreview,
    shouldShowVideoDownloadButton,
} from '../src/components/downloader/result-card-visibility.ts'

describe('result card visibility helpers', () => {
it('hides single-image preview after a load failure completes', () => {
    expect(
        shouldHideSingleImagePreview(true, {
            loading: false,
            error: true,
        })
    ).toBe(true)
})

it('keeps single-image preview visible while it is still loading', () => {
    expect(
        shouldHideSingleImagePreview(true, {
            loading: true,
            error: false,
        })
    ).toBe(false)
})

it('keeps multi-image previews visible even when one item fails', () => {
    expect(
        shouldHideSingleImagePreview(false, {
            loading: false,
            error: true,
        })
    ).toBe(false)
})

it('shows video download button for bilibili tv when a video url exists', () => {
    expect(shouldShowVideoDownloadButton('https://example.com/video.mp4')).toBe(true)
})

it('hides video download button when no video url exists', () => {
    expect(shouldShowVideoDownloadButton(null)).toBe(false)
})

it('maps separate streams to merge-video plus direct audio download', () => {
    expect(
        getResultMediaActions({
            videoAudioMode: 'separate',
            videoDownloadUrl: 'https://example.com/video.m4s',
            audioDownloadUrl: 'https://example.com/audio.m4s',
        })
    ).toEqual({
        videoAction: 'merge-then-download',
        audioAction: 'direct-download',
    })
})

it('maps muxed streams to direct video download plus audio extraction', () => {
    expect(
        getResultMediaActions({
            videoAudioMode: 'muxed',
            videoDownloadUrl: 'https://example.com/video.mp4',
            audioDownloadUrl: null,
        })
    ).toEqual({
        videoAction: 'direct-download',
        audioAction: 'extract-audio',
    })
})

it('prefers direct audio download when muxed media still provides audio url', () => {
    expect(
        getResultMediaActions({
            videoAudioMode: 'muxed',
            videoDownloadUrl: 'https://example.com/video.mp4',
            audioDownloadUrl: 'https://example.com/audio.mp3',
        })
    ).toEqual({
        videoAction: 'direct-download',
        audioAction: 'direct-download',
    })
})

it('still shows audio download when backend marks media as not applicable but audio url exists', () => {
    expect(
        getResultMediaActions({
            videoAudioMode: 'not_applicable',
            videoDownloadUrl: 'https://example.com/video.mp4',
            audioDownloadUrl: 'https://example.com/audio.mp3',
        })
    ).toEqual({
        videoAction: 'direct-download',
        audioAction: 'direct-download',
    })
})

it('falls back to legacy audio-first behavior when videoAudioMode is missing', () => {
    expect(
        getResultMediaActions({
            videoDownloadUrl: 'https://example.com/video.mp4',
            audioDownloadUrl: 'https://example.com/audio.mp3',
        })
    ).toEqual({
        videoAction: 'direct-download',
        audioAction: 'direct-download',
    })
})
})
