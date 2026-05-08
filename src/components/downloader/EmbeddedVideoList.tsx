import { useEffect, useMemo, useRef, useState } from 'react';
import { Play } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDictionary } from '@/i18n/client';
import type { EmbeddedVideoInfo } from '@/lib/types';
import { formatDuration } from '@/lib/utils';

import { MediaActionIconButton } from './MediaActionIconButton';
import { shouldShowVideoDownloadButton } from './result-card-visibility';
import { LOAD_MORE_BATCH, useChunkedMobileList } from './use-chunked-mobile-list';
import { replaceTemplate } from './result-card-utils';
import { useTemporaryDownloadKeys } from './use-temporary-download-keys';
import { VideoDownloadIcon, AudioDownloadIcon } from './CustomIcons';

const DEFAULT_VISIBLE_PARTS = 100;

export function EmbeddedVideoList({
    videos,
    currentItemId,
    autoScrollKey,
    autoScrollItemId,
    onSelectItem,
}: {
    videos: EmbeddedVideoInfo[];
    currentItemId?: string;
    autoScrollKey?: string;
    autoScrollItemId?: string;
    onSelectItem?: (itemId: string) => void;
}) {
    const dict = useDictionary();
    const { loadingKeys, triggerDownload } = useTemporaryDownloadKeys();
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef<HTMLDivElement | null>(null);
    const itemRefs = useRef(new Map<string, HTMLDivElement>());
    const lastAutoScrolledKeyRef = useRef<string | null>(null);
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filteredVideos = normalizedQuery
        ? videos.filter((video) => (video.title || '').toLowerCase().includes(normalizedQuery))
        : videos;
    const autoScrollIndex = useMemo(
        () => filteredVideos.findIndex((video) => video.id === autoScrollItemId),
        [autoScrollItemId, filteredVideos]
    );
    const {
        canCollapseMobile,
        collapse,
        isMobile,
        loadMore,
        minimumVisibleCount,
        remainingCount,
        setMobileVisibleCount,
        visibleItems: visibleVideos,
    } = useChunkedMobileList(
        filteredVideos,
        autoScrollIndex >= 0 ? Math.max(DEFAULT_VISIBLE_PARTS, autoScrollIndex + 1) : DEFAULT_VISIBLE_PARTS
    );

    useEffect(() => {
        if (autoScrollIndex < 0) {
            return;
        }

        setMobileVisibleCount((previous) => Math.max(previous, autoScrollIndex + 1));
    }, [autoScrollIndex, setMobileVisibleCount]);

    useEffect(() => {
        if (!autoScrollKey || !autoScrollItemId || lastAutoScrolledKeyRef.current === autoScrollKey) {
            return;
        }

        const element = itemRefs.current.get(autoScrollItemId);
        if (!element || !containerRef.current) {
            return;
        }

        window.requestAnimationFrame(() => {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
            lastAutoScrolledKeyRef.current = autoScrollKey;
        });
    }, [autoScrollItemId, autoScrollKey, visibleVideos.length]);

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
            <div
                ref={containerRef}
                className="max-h-[min(56vh,26rem)] md:max-h-[min(60vh,32rem)] overflow-y-auto overscroll-contain pr-1"
            >
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
                        const isCurrentItem = Boolean(currentItemId) && video.id === currentItemId;
                        const actionCount = 1 + Number(shouldShowVideoDownloadButton(videoDownloadUrl)) + Number(Boolean(audioDownloadUrl));
                        const actionGridClass = actionCount >= 3
                            ? 'grid-cols-3'
                            : actionCount === 2
                                ? 'grid-cols-2'
                                : 'grid-cols-1';

                        return (
                            <div
                                key={video.id || index}
                                ref={(element) => {
                                    if (!video.id) {
                                        return;
                                    }

                                    if (element) {
                                        itemRefs.current.set(video.id, element);
                                    } else {
                                        itemRefs.current.delete(video.id);
                                    }
                                }}
                                className={`flex w-full max-w-full flex-col gap-2 overflow-hidden rounded-lg border p-2 text-left transition-colors md:grid md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-2 md:p-3 ${
                                    isCurrentItem
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border hover:bg-muted/50'
                                }`}
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
                                <div
                                    className={`grid w-full gap-2 ${actionGridClass} md:flex md:w-auto md:justify-end md:gap-1 md:shrink-0`}
                                >
                                    <MediaActionIconButton
                                        label={`${dict.result.playVideo}: ${displayTitle}`}
                                        icon={Play}
                                        variant="secondary"
                                        disabled={isCurrentItem}
                                        className="w-full md:w-8"
                                        onClick={() => onSelectItem?.(video.id)}
                                    />
                                    {shouldShowVideoDownloadButton(videoDownloadUrl) && (
                                        <MediaActionIconButton
                                            label={dict.result.downloadVideo}
                                            icon={VideoDownloadIcon}
                                            variant="default"
                                            disabled={loadingKeys.has(videoKey)}
                                            loading={loadingKeys.has(videoKey)}
                                            className="w-full md:w-8"
                                            onClick={() => triggerDownload(videoDownloadUrl!, videoKey)}
                                        />
                                    )}
                                    {audioDownloadUrl && (
                                        <MediaActionIconButton
                                            label={dict.result.downloadAudio}
                                            icon={AudioDownloadIcon}
                                            variant="default"
                                            disabled={loadingKeys.has(audioKey)}
                                            loading={loadingKeys.has(audioKey)}
                                            className="w-full md:w-8"
                                            onClick={() => triggerDownload(audioDownloadUrl, audioKey)}
                                        />
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
                                    onClick={loadMore}
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
                                    onClick={collapse}
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
