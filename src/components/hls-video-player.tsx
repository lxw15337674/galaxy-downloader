'use client'

import { useEffect, useRef } from 'react'
import Hls from 'hls.js'

interface HlsVideoPlayerProps {
    src: string
    autoPlay?: boolean
    muted?: boolean
    controls?: boolean
    playsInline?: boolean
    preload?: 'none' | 'metadata' | 'auto'
    poster?: string
    className?: string
}

export function HlsVideoPlayer({
    src,
    autoPlay = false,
    muted = false,
    controls = true,
    playsInline = true,
    preload = 'metadata',
    poster,
    className,
}: HlsVideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null)

    useEffect(() => {
        const video = videoRef.current
        if (!video || !src) {
            return
        }

        let hls: Hls | null = null
        let mounted = true

        const cleanupVideoElement = () => {
            video.pause()
            video.removeAttribute('src')
            video.load()
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src
            return () => {
                mounted = false
                cleanupVideoElement()
            }
        }

        if (Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
            })

            hls.on(Hls.Events.ERROR, (_event, data) => {
                if (!data.fatal || !mounted) {
                    return
                }

                switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        hls?.startLoad()
                        break
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        hls?.recoverMediaError()
                        break
                    default:
                        hls?.destroy()
                        hls = null
                        break
                }
            })

            hls.attachMedia(video)
            hls.on(Hls.Events.MEDIA_ATTACHED, () => {
                if (!mounted || !hls) {
                    return
                }

                hls.loadSource(src)
            })

            return () => {
                mounted = false
                hls?.destroy()
                cleanupVideoElement()
            }
        }

        video.src = src

        return () => {
            mounted = false
            cleanupVideoElement()
        }
    }, [src])

    return (
        <video
            ref={videoRef}
            controls={controls}
            autoPlay={autoPlay}
            muted={muted}
            playsInline={playsInline}
            preload={preload}
            poster={poster}
            className={className}
        />
    )
}
