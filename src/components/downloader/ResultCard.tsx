import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { X, Download, ExternalLink, Loader2, Package, Share2 } from 'lucide-react';
import Image from "next/image";
import { useDictionary } from '@/i18n/client';
import type { AudioExtractTask } from '@/components/audio-tool/types';
import { UnifiedParseResult, PageInfo, EmbeddedVideoInfo } from "../../lib/types";
import { downloadFile, formatDuration, sanitizeFilename } from "../../lib/utils";
import { useState, useEffect } from 'react';
import { toast } from '@/lib/deferred-toast';
import {
    getResultMediaActions,
    resolveResultDisplayImages,
    shouldHideSingleImagePreview,
    shouldShowVideoDownloadButton,
    shouldUseFrontendImageProxy,
} from "./result-card-visibility";

const DEFAULT_VISIBLE_PARTS = 100;
const LOAD_MORE_BATCH = 100;

interface ResultCardProps {
    result: UnifiedParseResult['data'] | null | undefined
    onClose: () => void;
    onOpenExtractAudio: (task: AudioExtractTask) => void;
}

function resolveCoverSrc(coverUrl: string): string {
    if (shouldUseFrontendImageProxy(coverUrl)) {
        return `/api/proxy-image?url=${encodeURIComponent(coverUrl)}`;
    }
    return coverUrl;
}

function resolveImageSrc(imageUrl: string): string {
    if (shouldUseFrontendImageProxy(imageUrl)) {
        return `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
    }
    return imageUrl;
}

function replaceTemplate(template: string, token: string, value: string): string {
    return template.replace(token, value);
}

function useIsMobileViewport(): boolean {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            return;
        }

        const mediaQuery = window.matchMedia('(max-width: 767px)');
        const update = () => setIsMobile(mediaQuery.matches);
        update();

        if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', update);
            return () => mediaQuery.removeEventListener('change', update);
        }

        mediaQuery.addListener(update);
        return () => mediaQuery.removeListener(update);
    }, []);

    return isMobile;
}

function triggerBlobDownload(blob: Blob, filename: string) {
    const objectUrl = URL.createObjectURL(blob);
    downloadFile(objectUrl, filename);

    // Revoke after the click has been dispatched so browsers can resolve the blob URL.
    window.setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
    }, 1000);
}

function dedupeUrls(urls: string[]): string[] {
    return Array.from(new Set(urls.filter((value) => value.length > 0)));
}

function resolveImageDownloadExtension(sourceUrl: string, contentType: string | null | undefined): string {
    const normalizedContentType = contentType?.split(';')[0]?.trim().toLowerCase() ?? '';
    const contentTypeMap: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
        'image/svg+xml': 'svg',
        'image/avif': 'avif',
    };

    const mappedExtension = contentTypeMap[normalizedContentType];
    if (mappedExtension) {
        return mappedExtension;
    }

    try {
        const pathname = new URL(sourceUrl).pathname;
        const match = pathname.match(/\.([a-z0-9]+)$/i);
        if (match?.[1]) {
            return match[1].toLowerCase();
        }
    } catch {
        // Ignore invalid urls and fall back to jpg.
    }

    return 'jpg';
}

type ResolvedImageFetchResult = {
    blob: Blob;
    sourceUrl: string;
};

type ImageLoadState = {
    loading: boolean;
    error: boolean;
    src: string;
    baseSrc: string;
    usedFallback: boolean;
};

function createInitialImageStates(images: string[]): ImageLoadState[] {
    return images.map((imageUrl) => {
        const baseSrc = resolveImageSrc(imageUrl);
        return {
            loading: true,
            error: false,
            src: baseSrc,
            baseSrc,
            usedFallback: false,
        };
    });
}

async function fetchImageBlobCandidates(candidates: string[]): Promise<ResolvedImageFetchResult> {
    let lastError: unknown = null;

    for (const candidate of dedupeUrls(candidates)) {
        try {
            const response = await fetch(candidate);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return {
                blob: await response.blob(),
                sourceUrl: candidate,
            };
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError ?? new Error('Failed to fetch image');
}

export function ResultCard({ result, onClose, onOpenExtractAudio }: ResultCardProps) {
    const dict = useDictionary()
    const [activeBiliList, setActiveBiliList] = useState<'pages' | 'season'>('pages');

    useEffect(() => {
        setActiveBiliList('pages');
    }, [result?.url, result?.currentPage]);

    if (!result) return null;

    const displayImages = resolveResultDisplayImages({
        noteType: result.noteType,
        images: result.images,
        coverUrl: result.cover,
    });
    const isMultiPart = result.isMultiPart && result.pages && result.pages.length > 1;
    const isImageNote = result.noteType === 'image' && displayImages.length > 0;
    const hasEmbeddedVideos = !!result.videos?.length;
    const hasSeasonAlternative = (result.videos?.length || 0) > 1;
    const hasBilibiliSourceSwitch = (result.platform === 'bili' || result.platform === 'bilibili')
        && Boolean(isMultiPart)
        && hasSeasonAlternative;
    const pageTabLabel = replaceTemplate(dict.result.totalParts, '{count}', String(result.pages?.length || 0));
    const seasonTabLabel = replaceTemplate(dict.result.videoCount, '{count}', String(result.videos?.length || 0));
    const showMultiPartList = Boolean(isMultiPart) && (!hasBilibiliSourceSwitch || activeBiliList === 'pages');
    const showSeasonList = hasEmbeddedVideos && (!isMultiPart || (hasBilibiliSourceSwitch && activeBiliList === 'season'));
    const hasSupplementalImages = !isImageNote && displayImages.length > 0;
    const coverUrl = typeof result.cover === 'string' ? result.cover.trim() : '';
    const shouldShowCover = !isImageNote && coverUrl.length > 0;
    const coverSrc = shouldShowCover ? resolveCoverSrc(coverUrl) : '';
    const shareSourceUrl = typeof result.url === 'string' ? result.url.trim() : '';
    const hasPlayableCandidate = [
        result.originDownloadVideoUrl,
        result.downloadVideoUrl,
        ...(result.pages ?? []).map((page) => page.downloadVideoUrl),
        ...(result.videos ?? []).flatMap((video) => [video.originDownloadVideoUrl, video.downloadVideoUrl]),
    ].some((url) => shouldShowVideoDownloadButton(url));
    const canSharePlayLink = shareSourceUrl.length > 0 && (
        result.mediaActions?.video === 'direct-download'
        || result.mediaActions?.video === 'merge-then-download'
        || hasPlayableCandidate
    );

    const handleCopySharePlayLink = async () => {
        if (!canSharePlayLink) {
            return;
        }

        try {
            if (typeof window === 'undefined' || typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
                throw new Error('Clipboard API unavailable');
            }

            const pathnameSegments = window.location.pathname.split('/').filter((segment) => segment.length > 0);
            const localePrefix = pathnameSegments[0] ? `/${pathnameSegments[0]}` : '';
            const shareUrl = new URL(`${window.location.origin}${localePrefix}/play`);
            shareUrl.searchParams.set('url', shareSourceUrl);
            shareUrl.searchParams.set('autoplay', '1');

            await navigator.clipboard.writeText(shareUrl.toString());
            toast.success(dict.result.sharePlayLinkCopied);
        } catch (error) {
            console.error('Failed to copy share-play link:', error);
            toast.error(dict.errors.clipboardFailed, {
                description: dict.errors.clipboardPermission,
            });
        }
    };

    const displayTitle = result.title;

    return (
        <Card>
            <CardHeader className="p-3 pb-2">
                <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">{dict.result.title}</CardTitle>
                    <div className="flex items-center gap-1.5">
                        {canSharePlayLink && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 text-xs"
                                onClick={() => void handleCopySharePlayLink()}
                                title={dict.result.sharePlayLink}
                            >
                                <Share2 className="h-4 w-4" />
                                <span>{dict.result.sharePlayLink}</span>
                            </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-8 w-8 px-0" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <p
                    className="line-clamp-2 text-[13px] leading-snug text-foreground/80 break-words"
                    title={displayTitle}
                >
                    {displayTitle}
                    {result.duration != null && (
                        <span className="ml-2 text-xs text-foreground/70">({formatDuration(result.duration)})</span>
                    )}
                </p>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0">
                <div className="space-y-2">
                    {shouldShowCover && (
                        <ImageNoteGrid
                            images={[coverSrc]}
                            title={displayTitle}
                            singleImageMode
                        />
                    )}
                    {isImageNote ? (
                        <ImageNoteGrid
                            images={displayImages}
                            title={displayTitle}
                        />
                    ) : (
                        <>
                            <SinglePartButtons result={result} onOpenExtractAudio={onOpenExtractAudio} />
                            {(showMultiPartList || showSeasonList || hasBilibiliSourceSwitch) && (
                                <div className="space-y-2">
                                    {hasBilibiliSourceSwitch && (
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant={activeBiliList === 'pages' ? 'default' : 'outline'}
                                                size="sm"
                                                className="h-8 text-xs"
                                                onClick={() => setActiveBiliList('pages')}
                                            >
                                                {pageTabLabel}
                                            </Button>
                                            <Button
                                                variant={activeBiliList === 'season' ? 'default' : 'outline'}
                                                size="sm"
                                                className="h-8 text-xs"
                                                onClick={() => setActiveBiliList('season')}
                                            >
                                                {seasonTabLabel}
                                            </Button>
                                        </div>
                                    )}
                                    {showMultiPartList ? (
                                        <MultiPartList
                                            key={`pages-${result.url ?? ''}-${result.currentPage ?? ''}-${result.pages?.length ?? 0}`}
                                            pages={result.pages!}
                                            currentPage={result.currentPage}
                                        />
                                    ) : showSeasonList ? (
                                        <EmbeddedVideoList
                                            key={`videos-${result.url ?? ''}-${result.videos?.length ?? 0}`}
                                            videos={result.videos!}
                                        />
                                    ) : null}
                                </div>
                            )}
                            {hasSupplementalImages && (
                                <ImageNoteGrid
                                    images={displayImages}
                                    title={displayTitle}
                                />
                            )}
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * 单P视频的下载按钮
 */
function SinglePartButtons({
    result,
    onOpenExtractAudio,
}: {
    result: NonNullable<UnifiedParseResult['data']>;
    onOpenExtractAudio: (task: AudioExtractTask) => void;
}) {
    const dict = useDictionary()
    const [videoLoading, setVideoLoading] = useState(false);
    const [audioLoading, setAudioLoading] = useState(false);
    const videoDownloadUrl = result.downloadVideoUrl || result.originDownloadVideoUrl;
    const audioDownloadUrl = result.downloadAudioUrl || result.originDownloadAudioUrl || null;
    const { videoAction, audioAction } = getResultMediaActions({
        mediaActions: result.mediaActions,
        videoDownloadUrl,
        audioDownloadUrl,
    });
    const showVideoDownload = videoAction !== 'hide';
    const showAudioDownload = audioAction !== 'hide';
    const showOriginVideoLink =
        typeof result.originDownloadVideoUrl === 'string'
        && result.originDownloadVideoUrl.length > 0
        && result.originDownloadVideoUrl !== videoDownloadUrl;
    const showOriginAudioLink =
        typeof result.originDownloadAudioUrl === 'string'
        && result.originDownloadAudioUrl.length > 0
        && result.originDownloadAudioUrl !== audioDownloadUrl;

    const handleDownload = (url: string, setLoading: (v: boolean) => void) => {
        setLoading(true);
        downloadFile(url);
        setTimeout(() => setLoading(false), 1500);
    };

    const openResultTask = (action: AudioExtractTask['action']) => {
        onOpenExtractAudio({
            action,
            title: result.title || result.desc || undefined,
            sourceUrl: result.url || null,
            audioUrl: audioDownloadUrl,
            videoUrl: videoDownloadUrl || null,
            mediaActions: result.mediaActions,
        });
    };
    const actionCount = Number(showVideoDownload) + Number(showAudioDownload);

    return (
        <>
            <div className={`grid gap-2 ${actionCount > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                {showVideoDownload && (
                    <Button
                        variant="outline"
                        className="h-8 flex items-center justify-center gap-2 text-xs"
                        disabled={videoLoading}
                        onClick={() => {
                            if (videoAction === 'merge-then-download') {
                                openResultTask('merge-video');
                                return;
                            }

                            handleDownload(videoDownloadUrl!, setVideoLoading);
                        }}
                    >
                        {videoLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {videoAction === 'merge-then-download'
                            ? dict.result.mergeDownloadVideo
                            : dict.result.downloadVideo}
                    </Button>
                )}
                {showAudioDownload && (
                    <Button
                        variant="outline"
                        className="h-8 flex items-center justify-center gap-2 text-xs"
                        disabled={audioLoading}
                        onClick={() => {
                            if (audioAction === 'extract-audio') {
                                openResultTask('extract-audio');
                                return;
                            }

                            handleDownload(audioDownloadUrl!, setAudioLoading);
                        }}
                    >
                        {audioLoading && audioAction === 'direct-download' && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        {audioAction === 'direct-download'
                            ? dict.result.downloadAudio
                            : dict.extractAudio.button}
                    </Button>
                )}
            </div>
            {videoAction === 'merge-then-download' && (
                <p className="text-xs text-muted-foreground">
                    {dict.result.mergeDownloadVideoHint}
                </p>
            )}
            {result.noteType === 'audio' && (
                <p className="text-xs text-muted-foreground">
                    {dict.result.pureMusicHint}
                </p>
            )}
            {(showOriginVideoLink || showOriginAudioLink) && (
                <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs text-muted-foreground">
                    {showOriginVideoLink && (
                        <Button variant="link" size="sm" className="h-auto px-0 py-0 text-xs" asChild>
                            <a
                                href={result.originDownloadVideoUrl!}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                                {dict.result.originDownloadVideo}
                            </a>
                        </Button>
                    )}
                    {showOriginAudioLink && (
                        <Button variant="link" size="sm" className="h-auto px-0 py-0 text-xs" asChild>
                            <a
                                href={result.originDownloadAudioUrl!}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                                {dict.result.originDownloadAudio}
                            </a>
                        </Button>
                    )}
                </div>
            )}
        </>
    );
}

/**
 * 多P视频的分P列表
 */
function MultiPartList({ pages, currentPage }: { pages: PageInfo[]; currentPage?: number }) {
    const dict = useDictionary()
    const isMobile = useIsMobileViewport();
    const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());
    const minimumVisibleCount = Math.max(DEFAULT_VISIBLE_PARTS, currentPage || 1);
    const [mobileVisibleCount, setMobileVisibleCount] = useState(minimumVisibleCount);
    const visibleCount = isMobile
        ? Math.min(pages.length, mobileVisibleCount)
        : pages.length;
    const visiblePages = pages.slice(0, visibleCount);
    const remainingCount = Math.max(0, pages.length - visibleCount);
    const canCollapseMobile = isMobile && visibleCount >= pages.length && pages.length > minimumVisibleCount;

    const handleDownload = (url: string, key: string) => {
        setLoadingKeys(prev => new Set(prev).add(key));
        downloadFile(url);
        setTimeout(() => {
            setLoadingKeys(prev => {
                const next = new Set(prev);
                next.delete(key);
                return next;
            });
        }, 1500);
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 text-xs text-foreground/75">
                <span>
                    {replaceTemplate(dict.result.totalParts, '{count}', String(pages.length))}
                </span>
            </div>
            <div className="max-h-[min(56vh,26rem)] md:max-h-[min(60vh,32rem)] overflow-y-auto overscroll-contain pr-1">
                <div className="space-y-2 pr-2">
                    {visiblePages.map((page) => (
                        <div
                            key={page.page}
                            className={`flex w-full max-w-full flex-col gap-2 overflow-hidden p-2 md:grid md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-2 md:p-3 rounded-lg border ${
                                page.page === currentPage
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:bg-muted/50'
                            }`}
                        >
                            <div className="flex w-full items-start gap-2 min-w-0 overflow-hidden">
                                <span className="text-xs font-medium text-foreground/70 shrink-0">
                                    P{page.page}
                                </span>
                                <div className="flex w-full items-center gap-2 flex-1 min-w-0 overflow-hidden">
                                    <div className="text-[13px] truncate min-w-0 flex-1 max-w-[64vw] sm:max-w-none" title={page.part}>
                                        {page.part}
                                    </div>
                                    <span className="text-xs text-foreground/65 shrink-0">
                                        {formatDuration(page.duration)}
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:flex md:gap-1 md:shrink-0">
                                {page.downloadVideoUrl && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs"
                                        disabled={loadingKeys.has(`${page.page}-video`)}
                                        onClick={() => handleDownload(page.downloadVideoUrl!, `${page.page}-video`)}
                                    >
                                        {loadingKeys.has(`${page.page}-video`) && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                                        {dict.result.downloadVideo}
                                    </Button>
                                )}
                                {page.downloadAudioUrl && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs"
                                        disabled={loadingKeys.has(`${page.page}-audio`)}
                                        onClick={() => handleDownload(page.downloadAudioUrl!, `${page.page}-audio`)}
                                    >
                                        {loadingKeys.has(`${page.page}-audio`) && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                                        {dict.result.downloadAudio}
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                    {isMobile && (remainingCount > 0 || canCollapseMobile) && (
                        <div className="rounded-lg border border-border/70 p-2">
                            {remainingCount > 0 ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-8 w-full text-xs"
                                    onClick={() => setMobileVisibleCount((prev) => Math.min(pages.length, prev + LOAD_MORE_BATCH))}
                                >
                                    {replaceTemplate(
                                        dict.result.loadMoreItems,
                                        '{count}',
                                        String(Math.min(LOAD_MORE_BATCH, remainingCount))
                                    )}
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-8 w-full text-xs"
                                    onClick={() => setMobileVisibleCount(minimumVisibleCount)}
                                >
                                    {replaceTemplate(dict.result.collapseParts, '{count}', String(minimumVisibleCount))}
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function EmbeddedVideoList({ videos }: { videos: EmbeddedVideoInfo[] }) {
    const dict = useDictionary();
    const isMobile = useIsMobileViewport();
    const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileVisibleCount, setMobileVisibleCount] = useState(DEFAULT_VISIBLE_PARTS);
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filteredVideos = normalizedQuery
        ? videos.filter((video) => (video.title || '').toLowerCase().includes(normalizedQuery))
        : videos;
    const minimumVisibleCount = DEFAULT_VISIBLE_PARTS;
    const visibleCount = isMobile
        ? Math.min(filteredVideos.length, mobileVisibleCount)
        : filteredVideos.length;
    const visibleVideos = filteredVideos.slice(0, visibleCount);
    const remainingCount = Math.max(0, filteredVideos.length - visibleCount);
    const canCollapseMobile = isMobile && visibleCount >= filteredVideos.length && filteredVideos.length > minimumVisibleCount;

    const handleDownload = (url: string, key: string) => {
        setLoadingKeys(prev => new Set(prev).add(key));
        downloadFile(url);
        setTimeout(() => {
            setLoadingKeys(prev => {
                const next = new Set(prev);
                next.delete(key);
                return next;
            });
        }, 1500);
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 text-xs text-foreground/75">
                <span className="min-w-0">
                    <span>{dict.result.videoList}</span>
                    <span className="ml-2">
                        {replaceTemplate(dict.result.videoCount, '{count}', String(filteredVideos.length))}
                    </span>
                </span>
                <div className="flex items-center gap-2 shrink-0">
                    <Input
                        value={searchQuery}
                        onChange={(event) => {
                            setSearchQuery(event.target.value);
                            setMobileVisibleCount(minimumVisibleCount);
                        }}
                        placeholder={dict.result.collectionSearchPlaceholder}
                        aria-label={dict.result.collectionSearchPlaceholder}
                        className="w-32 sm:w-56 h-8"
                    />
                </div>
            </div>
            <div className="max-h-[min(56vh,26rem)] md:max-h-[min(60vh,32rem)] overflow-y-auto overscroll-contain pr-1">
                <div className="space-y-2 pr-2">
                    {filteredVideos.length === 0 && (
                        <p className="py-6 text-center text-sm text-muted-foreground">
                            {dict.result.collectionNoSearchResults}
                        </p>
                    )}
                    {visibleVideos.map((video, index) => {
                        const videoDownloadUrl = video.downloadVideoUrl || video.originDownloadVideoUrl || null;
                        const audioDownloadUrl = video.downloadAudioUrl || video.originDownloadAudioUrl || null;
                        const displayTitle = video.title?.trim()
                            || replaceTemplate(dict.result.articleVideoUntitled, '{index}', String(index + 1));
                        const videoKey = `${video.id || index}-video`;
                        const audioKey = `${video.id || index}-audio`;

                        return (
                            <div
                                key={video.id || index}
                                className="flex w-full max-w-full flex-col gap-2 overflow-hidden p-2 md:grid md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-2 md:p-3 rounded-lg border border-border hover:bg-muted/50"
                            >
                                <div className="flex w-full items-start gap-2 min-w-0 overflow-hidden">
                                    <span className="text-xs font-medium text-foreground/70 shrink-0">
                                        {index + 1}
                                    </span>
                                    <div className="flex w-full items-center gap-2 flex-1 min-w-0 overflow-hidden">
                                        <div className="text-[13px] truncate min-w-0 flex-1 max-w-[64vw] sm:max-w-none" title={displayTitle}>
                                            {displayTitle}
                                        </div>
                                        {video.duration != null && (
                                            <span className="text-xs text-foreground/65 shrink-0">
                                                {formatDuration(video.duration)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:flex md:gap-1 md:shrink-0">
                                    {shouldShowVideoDownloadButton(videoDownloadUrl) && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 text-xs"
                                            disabled={loadingKeys.has(videoKey)}
                                            onClick={() => handleDownload(videoDownloadUrl!, videoKey)}
                                        >
                                            {loadingKeys.has(videoKey) && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                                            {dict.result.downloadVideo}
                                        </Button>
                                    )}
                                    {audioDownloadUrl && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 text-xs"
                                            disabled={loadingKeys.has(audioKey)}
                                            onClick={() => handleDownload(audioDownloadUrl, audioKey)}
                                        >
                                            {loadingKeys.has(audioKey) && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                                            {dict.result.downloadAudio}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {isMobile && (remainingCount > 0 || canCollapseMobile) && (
                        <div className="rounded-lg border border-border/70 p-2">
                            {remainingCount > 0 ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-8 w-full text-xs"
                                    onClick={() => setMobileVisibleCount((prev) => Math.min(filteredVideos.length, prev + LOAD_MORE_BATCH))}
                                >
                                    {replaceTemplate(
                                        dict.result.loadMoreItems,
                                        '{count}',
                                        String(Math.min(LOAD_MORE_BATCH, remainingCount))
                                    )}
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-8 w-full text-xs"
                                    onClick={() => setMobileVisibleCount(minimumVisibleCount)}
                                >
                                    {replaceTemplate(dict.result.collapseParts, '{count}', String(minimumVisibleCount))}
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ImageNoteGrid({
    images,
    title,
    singleImageMode = false,
}: {
    images: string[];
    title: string;
    singleImageMode?: boolean;
}) {
    const dict = useDictionary()
    const [imageStates, setImageStates] = useState<ImageLoadState[]>(() => createInitialImageStates(images));
    const [isPackaging, setIsPackaging] = useState(false);
    const [packagingProgress, setPackagingProgress] = useState(0);

    useEffect(() => {
        setImageStates((previousStates) => {
            const nextStates = createInitialImageStates(images);
            const isSameImageSet =
                previousStates.length === nextStates.length
                && previousStates.every((state, index) => state.baseSrc === nextStates[index]?.baseSrc);

            return isSameImageSet ? previousStates : nextStates;
        });
    }, [images]);

    const updateImageState = (index: number, updater: (state: ImageLoadState) => ImageLoadState) => {
        setImageStates((prev) => prev.map((state, currentIndex) => (
            currentIndex === index ? updater(state) : state
        )));
    };

    const handleImageLoad = (index: number) => {
        updateImageState(index, (state) => ({
            ...state,
            loading: false,
            error: false,
        }));
    };

    const handleImageError = (index: number, originalUrl: string) => {
        updateImageState(index, (state) => {
            if (!state.usedFallback && state.src !== originalUrl) {
                return {
                    ...state,
                    loading: true,
                    error: false,
                    src: originalUrl,
                    usedFallback: true,
                };
            }

            return {
                ...state,
                loading: false,
                error: true,
            };
        });
    };

    const handleDownload = async (index: number, originalUrl: string) => {
        try {
            const state = imageStates[index];
            const { blob, sourceUrl } = await fetchImageBlobCandidates([
                state?.src ?? resolveImageSrc(originalUrl),
                originalUrl,
            ]);
            const extension = resolveImageDownloadExtension(sourceUrl, blob.type);
            triggerBlobDownload(blob, `${sanitizeFilename(title)}-${index + 1}.${extension}`);
        } catch (error) {
            console.error(`Failed to download image ${index}:`, error);
            toast.error(dict.errors.downloadError);
        }
    };

    const handlePackageDownload = async () => {
        setIsPackaging(true);
        setPackagingProgress(0);

        try {
            const { default: JSZip } = await import('jszip');
            const zip = new JSZip();
            let successCount = 0;

            // 遍历所有图片，添加到 zip
            for (let index = 0; index < images.length; index++) {
                const state = imageStates[index];
                const hasError = state?.error ?? false;

                if (!hasError) {
                    try {
                        const { blob, sourceUrl } = await fetchImageBlobCandidates([
                            state?.src ?? resolveImageSrc(images[index]!),
                            images[index]!,
                        ]);
                        const extension = resolveImageDownloadExtension(sourceUrl, blob.type);
                        zip.file(`${sanitizeFilename(title)}-${index + 1}.${extension}`, blob);
                        successCount++;
                    } catch (error) {
                        console.error(`Failed to add image ${index} to zip:`, error);
                    }
                }

                // 更新进度
                setPackagingProgress(Math.round(((index + 1) / images.length) * 100));
            }

            // 检查是否有成功添加的图片
            if (successCount === 0) {
                toast.error(dict.errors.allImagesLoadFailed);
                return;
            }
            // 生成 zip 文件
            const zipBlob = await zip.generateAsync({ type: 'blob' });

            // 触发下载
            triggerBlobDownload(zipBlob, `${sanitizeFilename(title)}.zip`);
        } catch (error) {
            console.error('Failed to package images:', error);
            toast.error(dict.errors.packageFailed);
        } finally {
            setIsPackaging(false);
            setPackagingProgress(0);
        }
    };

    // 计算加载完成的数量和成功数量
    const loadedCount = imageStates.filter((state) => !state.loading).length;
    const allLoaded = loadedCount === images.length;
    const successCount = imageStates.filter((state) => !state.error).length;
    const singleImageState = singleImageMode ? imageStates[0] : undefined;
    const shouldHideSingleImage = shouldHideSingleImagePreview(singleImageMode, singleImageState);

    if (shouldHideSingleImage) {
        return null;
    }

    return (
        <div className="space-y-2">
            {!singleImageMode && (
                <div className="flex items-center justify-between">
                    <div className="text-xs text-foreground/75">
                        <span className="inline-flex items-center gap-1">
                            {dict.result.imageNote}
                        </span>
                        <span className="ml-2">
                            {replaceTemplate(dict.result.imageCount, '{count}', String(images.length))}
                        </span>
                        {!allLoaded && (
                            <span className="ml-2 text-xs">
                                ({dict.result.imageLoadingProgress.replace('{loaded}', String(loadedCount)).replace('{total}', String(images.length))})
                            </span>
                        )}
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        disabled={!allLoaded || isPackaging || successCount === 0}
                        onClick={handlePackageDownload}
                        className="h-8 shrink-0 text-xs"
                    >
                        {isPackaging ? (
                            <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                {dict.result.packaging} {packagingProgress}%
                            </>
                        ) : (
                            <>
                                <Package className="h-3 w-3 mr-1" />
                                {dict.result.packageDownload}
                            </>
                        )}
                    </Button>
                </div>
            )}
            <div className={`${singleImageMode ? 'grid grid-cols-1' : 'grid grid-cols-2'} gap-2 max-h-[500px] overflow-y-auto pr-1`}>
                {images.map((imageUrl, index) => {
                    const state = imageStates[index];
                    const isLoading = state?.loading ?? true;
                    const hasError = state?.error ?? false;
                    const displaySrc = state?.src ?? resolveImageSrc(imageUrl);

                    return (
                        <div
                            key={index}
                            className="relative group border rounded-lg overflow-hidden bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                            <div className={`${singleImageMode ? 'aspect-video' : 'aspect-square'} relative bg-muted flex items-center justify-center`}>
                                {!hasError && (
                                    <Image
                                        src={displaySrc}
                                        alt={
                                            singleImageMode
                                                ? (title || dict.result.coverLabel)
                                                : replaceTemplate(dict.result.imageAlt, '{index}', String(index + 1))
                                        }
                                        fill
                                        unoptimized
                                        sizes={singleImageMode ? '(max-width: 1024px) 100vw, 720px' : '(max-width: 768px) 50vw, 33vw'}
                                        className={`object-cover transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                                        onLoad={() => handleImageLoad(index)}
                                        onError={() => handleImageError(index, imageUrl)}
                                    />
                                )}
                                {isLoading && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                        <p className="text-xs text-muted-foreground mt-2">{dict.result.loading}</p>
                                    </div>
                                )}
                                {!isLoading && hasError && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                                        <div className="text-2xl">🖼️</div>
                                        <p className="text-xs mt-2">
                                            {singleImageMode
                                                ? dict.result.coverLabel
                                                : replaceTemplate(dict.result.imageIndexLabel, '{index}', String(index + 1))}
                                        </p>
                                        <p className="text-[10px] mt-1 opacity-60">{dict.result.loadFailed}</p>
                                    </div>
                                )}
                            </div>
                            {!isLoading && !hasError && (
                                <div className="absolute bottom-2 right-2">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="h-8 w-8 p-0 shadow-md"
                                        onClick={() => void handleDownload(index, imageUrl)}
                                        title={dict.result.downloadImage}
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                            {!singleImageMode && (
                                <div className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                                    {index + 1}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
} 
