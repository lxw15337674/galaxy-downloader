import { useState } from 'react';
import { Share2, X } from 'lucide-react';

import type { AudioExtractTask } from '@/components/audio-tool/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDictionary } from '@/i18n/client';
import { toast } from '@/lib/deferred-toast';
import type { UnifiedParseResult } from '@/lib/types';
import { formatDuration } from '@/lib/utils';

import { EmbeddedVideoList } from './EmbeddedVideoList';
import { ImageNoteGrid } from './ImageNoteGrid';
import { MultiPartList } from './MultiPartList';
import { SinglePartButtons } from './SinglePartButtons';
import {
    resolveResultDisplayImages,
    shouldShowVideoDownloadButton,
} from './result-card-visibility';
import { replaceTemplate, resolveCoverSrc } from './result-card-utils';

interface ResultCardProps {
    result: UnifiedParseResult['data'] | null | undefined;
    onClose: () => void;
    onOpenExtractAudio: (task: AudioExtractTask) => void;
}

export function ResultCard({ result, onClose, onOpenExtractAudio }: ResultCardProps) {
    const dict = useDictionary();
    const activeListKey = `${result?.url ?? ''}-${result?.currentPage ?? ''}-${result?.currentItemId ?? ''}`;
    const [activeBiliListState, setActiveBiliListState] = useState<{
        key: string;
        value: 'pages' | 'season';
    }>({
        key: activeListKey,
        value: 'pages',
    });

    if (!result) return null;

    const activeBiliList = activeBiliListState.key === activeListKey
        ? activeBiliListState.value
        : 'pages';
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
                                            key={`videos-${result.url ?? ''}-${result.currentItemId ?? ''}-${result.videos?.length ?? 0}`}
                                            videos={result.videos!}
                                            currentItemId={result.currentItemId}
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
