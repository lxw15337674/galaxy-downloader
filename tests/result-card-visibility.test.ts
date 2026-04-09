import { describe, expect, it } from 'vitest'

import {
    getResultMediaActions,
    resolveResultDisplayImages,
    shouldHideSingleImagePreview,
    shouldUseFrontendImageProxy,
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

it('hides supplemental images for explicit video notes', () => {
    expect(
        resolveResultDisplayImages({
            noteType: 'video',
            images: ['https://img.example.com/cover.jpg', 'https://img.example.com/extra.jpg'],
            coverUrl: 'https://img.example.com/cover.jpg',
        })
    ).toEqual([])
})

it('keeps image lists for image notes', () => {
    expect(
        resolveResultDisplayImages({
            noteType: 'image',
            images: ['https://img.example.com/1.jpg', 'https://img.example.com/2.jpg'],
            coverUrl: 'https://img.example.com/1.jpg',
        })
    ).toEqual(['https://img.example.com/1.jpg', 'https://img.example.com/2.jpg'])
})

it('removes duplicated cover from mixed content without noteType', () => {
    expect(
        resolveResultDisplayImages({
            images: ['https://img.example.com/cover.jpg', 'https://img.example.com/extra.jpg', 'https://img.example.com/extra.jpg'],
            coverUrl: 'https://img.example.com/cover.jpg',
        })
    ).toEqual(['https://img.example.com/extra.jpg'])
})

it('shows video download button for bilibili tv when a video url exists', () => {
    expect(shouldShowVideoDownloadButton('https://example.com/video.mp4')).toBe(true)
})

it('hides video download button when no video url exists', () => {
    expect(shouldShowVideoDownloadButton(null)).toBe(false)
})

it('uses frontend image proxy for ordinary remote images', () => {
    expect(shouldUseFrontendImageProxy('https://wx3.sinaimg.cn/large/mock-cover.jpg')).toBe(true)
})

it('skips frontend image proxy for backend image-proxy urls', () => {
    expect(shouldUseFrontendImageProxy('http://localhost:8787/api/image-proxy?platform=weibo&url=https%3A%2F%2Fwx3.sinaimg.cn%2Flarge%2Fmock-cover.jpg')).toBe(false)
})

it('skips frontend image proxy for backend indexed image download urls', () => {
    expect(shouldUseFrontendImageProxy('http://localhost:8787/api/wechat/download?url=https%3A%2F%2Fmp.weixin.qq.com%2Fs%2Fabc&index=0&filename=test')).toBe(false)
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

it('prefers backend mediaActions over inferred muxed extraction behavior', () => {
    expect(
        getResultMediaActions({
            mediaActions: {
                video: 'direct-download',
                audio: 'hide',
            },
            videoAudioMode: 'muxed',
            videoDownloadUrl: 'https://example.com/video.mp4',
            audioDownloadUrl: null,
        })
    ).toEqual({
        videoAction: 'direct-download',
        audioAction: 'hide',
    })
})

it('maps pure music content to audio-only direct download', () => {
    expect(
        getResultMediaActions({
            videoAudioMode: 'pure_music',
            videoDownloadUrl: null,
            audioDownloadUrl: 'https://example.com/audio.mp3',
        })
    ).toEqual({
        videoAction: 'hide',
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
