'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Loader2, ExternalLink } from 'lucide-react'
import { HlsVideoPlayer } from '@/components/hls-video-player'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlatformBadge } from '@/components/platform-badge'
import { ViewportSideRailAd } from '@/components/ads/viewport-side-rail-ad'
import { buildMediaPreviewUrl, canSharePlayResult } from '@/components/downloader/media-preview'
import { useAppLocale, useDictionary } from '@/i18n/client'
import { isApiRequestError, resolveApiErrorMessage } from '@/lib/api-errors'
import { buildHlsPlayProxyUrl, HLS_PLAYLIST_ACCEPT, isHlsPlaylistUrl } from '@/lib/hls-playback'
import { UnifiedParseReloadError, requestUnifiedParse } from '@/lib/unified-parse'
import type { UnifiedParseResult } from '@/lib/types'
import { normalizePlatform } from '@/lib/platforms'

type ParsedResultData = NonNullable<UnifiedParseResult['data']>

export function PlayPageClient() {
    const dict = useDictionary()
    const locale = useAppLocale()
    const searchParams = useSearchParams()

    const sourceUrl = (searchParams.get('url') || searchParams.get('play') || '').trim()
    const autoplay = searchParams.get('autoplay') === '1'

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [parseResult, setParseResult] = useState<ParsedResultData | null>(null)

    useEffect(() => {
        let cancelled = false

        if (!sourceUrl) {
            return
        }

        const loadSharedResult = async () => {
            setLoading(true)
            setError('')
            setParseResult(null)

            try {
                const parsed = await requestUnifiedParse(sourceUrl)
                if (cancelled) {
                    return
                }

                setParseResult({
                    ...parsed.data,
                    platform: normalizePlatform(parsed.data.platform),
                })
            } catch (err) {
                if (cancelled) {
                    return
                }

                if (err instanceof UnifiedParseReloadError) {
                    return
                }

                if (isApiRequestError(err)) {
                    console.error('Shared playback parse failed', {
                        code: err.code,
                        status: err.status,
                        requestId: err.requestId,
                        details: err.details,
                    })
                }

                setError(resolveApiErrorMessage(err, dict))
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        void loadSharedResult()

        return () => {
            cancelled = true
        }
    }, [dict, sourceUrl])

    const visibleParseResult = sourceUrl ? parseResult : null
    const displayError = sourceUrl ? error : dict.errors.emptyUrl
    const canonicalSourceUrl = (visibleParseResult?.url || sourceUrl).trim()
    const hlsPlaybackUrl = useMemo(() => {
        const playlistUrl = visibleParseResult?.originDownloadVideoUrl?.trim()
        if (!playlistUrl || !isHlsPlaylistUrl(playlistUrl)) {
            return null
        }

        return buildHlsPlayProxyUrl(
            playlistUrl,
            canonicalSourceUrl || playlistUrl,
            HLS_PLAYLIST_ACCEPT
        )
    }, [canonicalSourceUrl, visibleParseResult])
    const playbackUrl = useMemo(() => {
        if (hlsPlaybackUrl) {
            return hlsPlaybackUrl
        }

        if (!canonicalSourceUrl || !visibleParseResult) {
            return null
        }

        return buildMediaPreviewUrl({
            mediaType: 'video',
            sourceUrl: canonicalSourceUrl,
            title: visibleParseResult.title,
        })
    }, [canonicalSourceUrl, hlsPlaybackUrl, visibleParseResult])

    const canPlay = visibleParseResult ? canSharePlayResult(visibleParseResult) : false

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <div className=" flex-1 sm:p-4 md:p-4 pt-2 ">
                <section className="w-full max-w-7xl mx-auto  bg-black">
                    {loading ? (
                        <div className="aspect-video max-h-[74dvh] md:max-h-[72vh] lg:max-h-[68vh] flex items-center justify-center text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>{dict.form.downloading}</span>
                            </div>
                        </div>
                    ) : (canPlay && playbackUrl) ? (
                        hlsPlaybackUrl ? (
                            <HlsVideoPlayer
                                src={playbackUrl}
                                controls
                                autoPlay={autoplay}
                                playsInline
                                preload="metadata"
                                className="block w-full min-h-[320px] max-h-[74dvh] md:max-h-[72vh] lg:max-h-[68vh] bg-black"
                            />
                        ) : (
                            <video
                                src={playbackUrl}
                                controls
                                autoPlay={autoplay}
                                playsInline
                                preload="metadata"
                                className="block w-full min-h-[320px] max-h-[74dvh] md:max-h-[72vh] lg:max-h-[68vh] bg-black"
                            />
                        )
                    ) : visibleParseResult ? (
                        <div className="aspect-video max-h-[74dvh] md:max-h-[72vh] lg:max-h-[68vh] flex items-center justify-center px-4 text-sm text-muted-foreground bg-black">
                            {dict.result.sharePlayUnavailable}
                        </div>
                    ) : null}
                </section>

                <section className="w-full">
                    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-5 py-3 space-y-3">
                        {!loading && displayError && (
                            <Card>
                                <CardContent className="p-6 space-y-4">
                                    <p className="text-sm text-destructive">{displayError}</p>
                                    <Button asChild size="sm" variant="outline">
                                        <Link href={`/${locale}`}>{dict.common.home}</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {!loading && !displayError && visibleParseResult && (
                            <div className="w-full space-y-1.5">
                                <h2 className="text-base sm:text-lg leading-snug font-semibold wrap-break-word" title={visibleParseResult.title}>{visibleParseResult.title}</h2>
                                <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs text-muted-foreground">
                                    <PlatformBadge platform={visibleParseResult.platform} />
                                    {canonicalSourceUrl ? (
                                        <a
                                            href={canonicalSourceUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 underline"
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            <span>{dict.history.viewSource}</span>
                                        </a>
                                    ) : null}
                                </div>

                                <div className="pt-2">
                                    <ViewportSideRailAd slot="5740014745" showOn="mobile"  />
                                    <ViewportSideRailAd slot="6380909506" showOn="desktop" />
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    )
}
