import { useEffect, useState } from 'react';
import { Share2, X } from 'lucide-react';

import type { AudioExtractTask } from '@/components/audio-tool/types';
import { DeferredHlsDownloadDialog } from '@/components/deferred-hls-download-dialog';
import type { HlsDownloadDialogRequest } from '@/components/hls-download-dialog';
import type { MediaPreviewRequest } from '@/components/downloader/media-preview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HlsVideoPlayer } from '@/components/hls-video-player';
import { useDictionary } from '@/i18n/client';
import { toast } from '@/lib/deferred-toast';
import { buildHlsPlayProxyUrl, HLS_PLAYLIST_ACCEPT, isHlsPlaylistUrl } from '@/lib/hls-playback';
import type { UnifiedParseResult } from '@/lib/types';
import { formatDuration, sanitizeFilename } from '@/lib/utils';

import { EmbeddedVideoList } from './EmbeddedVideoList';
import { ImageNoteGrid } from './ImageNoteGrid';
import {
    buildMediaPreviewUrl,
    buildEmbeddedVideoPreview,
    buildPagePreview,
    buildPrimaryResultPreview,
    canSharePlayResult,
} from './media-preview';
import { MultiPartList } from './MultiPartList';
import { SinglePartButtons } from './SinglePartButtons';
import {
    resolveResultDisplayImages,
} from './result-card-visibility';
import {
    fetchImageBlobCandidates,
    replaceTemplate,
    resolveCoverSrc,
    resolveImageDownloadExtension,
    triggerBlobDownload,
} from './result-card-utils';

type ResultData = NonNullable<UnifiedParseResult['data']>;
type ActiveCollectionSource = 'result' | 'pages' | 'season';

function resolveSelectedPage(result: ResultData, selectedPage?: number) {
    if (!result.pages?.length) {
        return undefined;
    }

    return result.pages.find((page) => page.page === selectedPage)
        ?? result.pages.find((page) => page.page === result.currentPage)
        ?? result.pages[0];
}

function resolveSelectedVideo(result: ResultData, selectedItemId?: string) {
    if (!result.videos?.length) {
        return undefined;
    }

    return result.videos.find((video) => video.id === selectedItemId)
        ?? result.videos.find((video) => video.id === result.currentItemId)
        ?? result.videos[0];
}

function buildPageScopedResult(result: ResultData, page: NonNullable<ResultData['pages']>[number]): ResultData {
    return {
        ...result,
        title: page.part || result.title,
        duration: page.duration ?? result.duration,
        downloadVideoUrl: page.downloadVideoUrl ?? null,
        downloadAudioUrl: page.downloadAudioUrl ?? null,
        originDownloadVideoUrl: page.downloadVideoUrl ?? result.originDownloadVideoUrl ?? null,
        originDownloadAudioUrl: page.downloadAudioUrl ?? result.originDownloadAudioUrl ?? null,
        mediaActions: undefined,
        currentPage: page.page,
    };
}

function buildVideoScopedResult(result: ResultData, video: NonNullable<ResultData['videos']>[number]): ResultData {
    return {
        ...result,
        title: video.title || result.title,
        cover: video.cover ?? result.cover,
        duration: video.duration ?? result.duration,
        downloadVideoUrl: video.downloadVideoUrl ?? video.originDownloadVideoUrl ?? null,
        downloadAudioUrl: video.downloadAudioUrl ?? video.originDownloadAudioUrl ?? null,
        originDownloadVideoUrl: video.originDownloadVideoUrl ?? video.downloadVideoUrl ?? null,
        originDownloadAudioUrl: video.originDownloadAudioUrl ?? video.downloadAudioUrl ?? null,
        mediaActions: video.mediaActions,
        currentItemId: video.id,
    };
}

function buildSelectedPreview(
    sourceUrl: string,
    result: ResultData,
    source: ActiveCollectionSource,
    page: NonNullable<ResultData['pages']>[number] | undefined,
    video: NonNullable<ResultData['videos']>[number] | undefined,
    options: {
        autoplay?: boolean;
        preferAudio?: boolean;
    } = {}
) {
    if (source === 'pages' && page) {
        return buildPagePreview(sourceUrl, page, options);
    }

    if (source === 'season' && video) {
        return buildEmbeddedVideoPreview(sourceUrl, video, options);
    }

    return buildPrimaryResultPreview(result, options);
}

interface ResultCardProps {
    result: UnifiedParseResult['data'] | null | undefined;
    onClose: () => void;
    onOpenExtractAudio: (task: AudioExtractTask) => void;
    onRequestPreview: (request: MediaPreviewRequest) => void;
    activePreview?: MediaPreviewRequest | null;
}

export function ResultCard({ 
    result, 
    onClose, 
    onOpenExtractAudio, 
    onRequestPreview,
    activePreview,
}: ResultCardProps) {
    if (!result) return null;

    return (
        <ResultCardContent
            result={result}
            onClose={onClose}
            onOpenExtractAudio={onOpenExtractAudio}
            onRequestPreview={onRequestPreview}
            activePreview={activePreview}
        />
    );
}

function ResultCardContent({
    result,
    onClose,
    onOpenExtractAudio,
    onRequestPreview,
    activePreview,
}: Omit<ResultCardProps, 'result'> & { result: ResultData }) {
    const dict = useDictionary();
    const activeListKey = `${result?.url ?? ''}-${result?.currentPage ?? ''}-${result?.currentItemId ?? ''}`;
    const defaultBiliList = result?.currentItemId ? 'season' : 'pages';
    const [activeBiliListState, setActiveBiliListState] = useState<{
        key: string;
        value: 'pages' | 'season';
    }>({
        key: activeListKey,
        value: defaultBiliList,
    });
    const [selectionState, setSelectionState] = useState<{
        key: string;
        currentPage?: number;
        currentItemId?: string;
    }>({
        key: activeListKey,
        currentPage: result?.currentPage,
        currentItemId: result?.currentItemId,
    });
    const [hlsDownloadRequest, setHlsDownloadRequest] = useState<HlsDownloadDialogRequest | null>(null);

    const activeBiliList = activeBiliListState.key === activeListKey
        ? activeBiliListState.value
        : defaultBiliList;
    const setActiveBiliList = (value: 'pages' | 'season') => {
        setActiveBiliListState({
            key: activeListKey,
            value,
        });
    };

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
    const shareSourceUrl = typeof result.url === 'string' ? result.url.trim() : '';
    const canSharePlayLink = shareSourceUrl.length > 0 && canSharePlayResult(result);
    const selectedPageNumber = selectionState.key === activeListKey
        ? selectionState.currentPage
        : result.currentPage;
    const selectedItemId = selectionState.key === activeListKey
        ? selectionState.currentItemId
        : result.currentItemId;
    const currentPage = resolveSelectedPage(result, selectedPageNumber);
    const currentVideo = resolveSelectedVideo(result, selectedItemId);
    const activeCollectionSource: ActiveCollectionSource = showSeasonList
        ? 'season'
        : showMultiPartList
            ? 'pages'
            : hasEmbeddedVideos
                ? 'season'
                : isMultiPart
                    ? 'pages'
                    : 'result';
    const effectiveResult = activeCollectionSource === 'pages' && currentPage
        ? buildPageScopedResult(result, currentPage)
        : activeCollectionSource === 'season' && currentVideo
            ? buildVideoScopedResult(result, currentVideo)
            : result;
    const previewPreference = activePreview?.mediaType === 'audio';
    const primaryPreview = buildSelectedPreview(
        shareSourceUrl,
        effectiveResult,
        activeCollectionSource,
        currentPage,
        currentVideo,
        {
            autoplay: false,
            preferAudio: previewPreference,
        }
    );
    const selectedCoverUrl = activeCollectionSource === 'season' && currentVideo?.cover
        ? currentVideo.cover.trim()
        : coverUrl;
    const coverSrc = selectedCoverUrl.length > 0 ? resolveCoverSrc(selectedCoverUrl) : '';
    const playerPreview = primaryPreview ? {
        ...primaryPreview,
        autoplay: activePreview?.autoplay ?? primaryPreview.autoplay,
        origin: activePreview?.origin ?? primaryPreview.origin,
    } : null;
    const hlsPlaybackUrl = playerPreview?.mediaType === 'video'
        && isHlsPlaylistUrl(effectiveResult.originDownloadVideoUrl)
        ? buildHlsPlayProxyUrl(
            effectiveResult.originDownloadVideoUrl,
            effectiveResult.url || effectiveResult.originDownloadVideoUrl,
            HLS_PLAYLIST_ACCEPT
        )
        : null;
    const playerUrl = hlsPlaybackUrl || (playerPreview ? buildMediaPreviewUrl(playerPreview) : null);
    const previewItem = activeCollectionSource === 'pages'
        ? (currentPage ? String(currentPage.page) : undefined)
        : activeCollectionSource === 'season'
            ? currentVideo?.id
            : undefined;

    useEffect(() => {
        if (!activePreview || !primaryPreview) {
            return;
        }

        if (activePreview.sourceUrl !== primaryPreview.sourceUrl) {
            return;
        }

        if (
            activePreview.mediaType === primaryPreview.mediaType
            && activePreview.item === primaryPreview.item
            && activePreview.sourceUrl === primaryPreview.sourceUrl
        ) {
            return;
        }

        onRequestPreview({
            ...primaryPreview,
            autoplay: activePreview.autoplay ?? primaryPreview.autoplay,
        });
    }, [
        activePreview,
        onRequestPreview,
        primaryPreview,
    ]);

    const handleSelectPage = (pageNumber: number) => {
        const page = result.pages?.find((item) => item.page === pageNumber);
        if (!page) {
            return;
        }

        setSelectionState((previous) => ({
            key: activeListKey,
            currentPage: pageNumber,
            currentItemId: previous.key === activeListKey ? previous.currentItemId : result.currentItemId,
        }));
    };

    const handleSelectVideo = (itemId: string) => {
        const video = result.videos?.find((item) => item.id === itemId);
        if (!video) {
            return;
        }

        setSelectionState((previous) => ({
            key: activeListKey,
            currentPage: previous.key === activeListKey ? previous.currentPage : result.currentPage,
            currentItemId: itemId,
        }));
    };

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
            shareUrl.searchParams.set('play', shareSourceUrl);
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

    const displayTitle = effectiveResult.title && effectiveResult.title !== result.title
        ? `${result.title} · ${effectiveResult.title}`
        : effectiveResult.title || result.title;
    const displayDuration = effectiveResult.duration ?? result.duration;
    const handleDownloadCover = async () => {
        if (!selectedCoverUrl) {
            return;
        }

        try {
            const { blob, sourceUrl } = await fetchImageBlobCandidates([
                coverSrc,
                selectedCoverUrl,
            ]);
            const extension = resolveImageDownloadExtension(sourceUrl, blob.type);
            triggerBlobDownload(blob, `${sanitizeFilename(displayTitle || dict.result.coverLabel)}-cover.${extension}`);
        } catch (error) {
            console.error('Failed to download cover:', error);
            toast.error(dict.errors.downloadError);
        }
    };

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
                    {displayDuration != null && (
                        <span className="ml-2 text-xs text-foreground/70">({formatDuration(displayDuration)})</span>
                    )}
                </p>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0">
                <div className="space-y-2">
                    {playerPreview && playerUrl ? (
                        <div className="overflow-hidden rounded-lg bg-black">
                            {playerPreview.mediaType === 'audio' ? (
                                <audio
                                    key={playerUrl}
                                    src={playerUrl}
                                    controls
                                    autoPlay={playerPreview.autoplay}
                                    preload="metadata"
                                    className="w-full"
                                />
                            ) : (
                                hlsPlaybackUrl ? (
                                    <HlsVideoPlayer
                                        key={playerUrl}
                                        src={playerUrl}
                                        autoPlay={playerPreview.autoplay}
                                        muted={playerPreview.origin === 'share' && playerPreview.autoplay}
                                        playsInline
                                        preload="metadata"
                                        poster={coverSrc || undefined}
                                        className="w-full min-h-[240px] max-h-[50vh] bg-black"
                                    />
                                ) : (
                                    <video
                                        key={playerUrl}
                                        src={playerUrl}
                                        controls
                                        autoPlay={playerPreview.autoplay}
                                        muted={playerPreview.origin === 'share' && playerPreview.autoplay}
                                        playsInline
                                        preload="metadata"
                                        poster={coverSrc || undefined}
                                        className="w-full min-h-[240px] max-h-[50vh] bg-black"
                                    />
                                )
                            )}
                        </div>
                    ) : !isImageNote && coverSrc ? (
                        <ImageNoteGrid
                            images={[coverSrc]}
                            title={displayTitle}
                            singleImageMode
                        />
                    ) : null}
                    {isImageNote ? (
                        <ImageNoteGrid
                            images={displayImages}
                            title={displayTitle}
                        />
                    ) : (
                        <>
                            <SinglePartButtons
                                result={effectiveResult}
                                previewItem={previewItem}
                                onDownloadCover={selectedCoverUrl ? handleDownloadCover : undefined}
                                onOpenExtractAudio={onOpenExtractAudio}
                                onOpenHlsDownload={setHlsDownloadRequest}
                                onRequestPreview={onRequestPreview}
                            />
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
                                            key={`pages-${result.url ?? ''}-${selectedPageNumber ?? ''}-${result.pages?.length ?? 0}`}
                                            pages={result.pages!}
                                            currentPage={currentPage?.page}
                                            onSelectPage={handleSelectPage}
                                        />
                                    ) : showSeasonList ? (
                                        <EmbeddedVideoList
                                            key={`videos-${result.url ?? ''}-${result.currentItemId ?? ''}-${result.videos?.length ?? 0}`}
                                            videos={result.videos!}
                                            currentItemId={currentVideo?.id}
                                            autoScrollKey={activeListKey}
                                            autoScrollItemId={result.currentItemId}
                                            onSelectItem={handleSelectVideo}
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
                <DeferredHlsDownloadDialog
                    open={Boolean(hlsDownloadRequest)}
                    onOpenChange={(open) => {
                        if (!open) {
                            setHlsDownloadRequest(null);
                        }
                    }}
                    request={hlsDownloadRequest}
                />
            </CardContent>
        </Card>
    );
}
