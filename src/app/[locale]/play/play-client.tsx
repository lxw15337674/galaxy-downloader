'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Loader2, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AppTopBar } from '@/components/layout/app-top-bar'
import { PlatformBadge } from '@/components/platform-badge'
import { ViewportSideRailAd } from '@/components/ads/viewport-side-rail-ad'
import { useAppLocale, useDictionary } from '@/i18n/client'
import { isApiRequestError, resolveApiErrorMessage } from '@/lib/api-errors'
import { requestUnifiedParse } from '@/lib/unified-parse'
import type { UnifiedParseResult } from '@/lib/types'
import { normalizePlatform } from '@/lib/platforms'
import { shouldShowVideoDownloadButton } from '@/components/downloader/result-card-visibility'

type ParsedResultData = NonNullable<UnifiedParseResult['data']>

function canPlayResult(result: ParsedResultData): boolean {
    const hasPlayableCandidate = [
        result.originDownloadVideoUrl,
        result.downloadVideoUrl,
        ...(result.pages ?? []).map((page) => page.downloadVideoUrl),
        ...(result.videos ?? []).flatMap((video) => [video.originDownloadVideoUrl, video.downloadVideoUrl]),
    ].some((url) => shouldShowVideoDownloadButton(url))

    if (result.mediaActions?.video === 'direct-download' || result.mediaActions?.video === 'merge-then-download') {
        return true
    }

    return hasPlayableCandidate
}

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
            setParseResult(null)
            setLoading(false)
            setError(dict.errors.emptyUrl)
            return () => {
                cancelled = true
            }
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

    const canonicalSourceUrl = (parseResult?.url || sourceUrl).trim()
    const playbackUrl = useMemo(() => {
        if (!canonicalSourceUrl) {
            return null
        }

        return `/api/play?url=${encodeURIComponent(canonicalSourceUrl)}`
    }, [canonicalSourceUrl])

    const canPlay = parseResult ? canPlayResult(parseResult) : false

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <AppTopBar showHomeButton homeHref={`/${locale}`} />

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
                        <video
                            src={playbackUrl}
                            controls
                            autoPlay={autoplay}
                            playsInline
                            preload="metadata"
                            className="block w-full max-h-[74dvh] md:max-h-[72vh] lg:max-h-[68vh] bg-black"
                        />
                    ) : parseResult ? (
                        <div className="aspect-video max-h-[74dvh] md:max-h-[72vh] lg:max-h-[68vh] flex items-center justify-center px-4 text-sm text-muted-foreground bg-black">
                            {dict.result.sharePlayUnavailable}
                        </div>
                    ) : null}
                </section>

                <section className="w-full">
                    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-5 py-3 space-y-3">
                        {!loading && error && (
                            <Card>
                                <CardContent className="p-6 space-y-4">
                                    <p className="text-sm text-destructive">{error}</p>
                                    <Button asChild size="sm" variant="outline">
                                        <Link href={`/${locale}`}>{dict.common.home}</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {!loading && !error && parseResult && (
                            <div className="w-full space-y-1.5">
                                <h2 className="text-base sm:text-lg leading-snug font-semibold wrap-break-word" title={parseResult.title}>{parseResult.title}</h2>
                                <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs text-muted-foreground">
                                    <PlatformBadge platform={parseResult.platform} />
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
