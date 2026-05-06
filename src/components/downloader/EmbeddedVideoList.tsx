import { useState } from 'react';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDictionary } from '@/i18n/client';
import type { EmbeddedVideoInfo } from '@/lib/types';
import { formatDuration } from '@/lib/utils';

import { shouldShowVideoDownloadButton } from './result-card-visibility';
import { LOAD_MORE_BATCH, useChunkedMobileList } from './use-chunked-mobile-list';
import { replaceTemplate } from './result-card-utils';
import { useTemporaryDownloadKeys } from './use-temporary-download-keys';

const DEFAULT_VISIBLE_PARTS = 100;

export function EmbeddedVideoList({ videos, currentItemId }: { videos: EmbeddedVideoInfo[]; currentItemId?: string }) {
    const dict = useDictionary();
    const { loadingKeys, triggerDownload } = useTemporaryDownloadKeys();
    const [searchQuery, setSearchQuery] = useState('');
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filteredVideos = normalizedQuery
        ? videos.filter((video) => (video.title || '').toLowerCase().includes(normalizedQuery))
        : videos;
    const {
        canCollapseMobile,
        collapse,
        isMobile,
        loadMore,
        minimumVisibleCount,
        remainingCount,
        setMobileVisibleCount,
        visibleItems: visibleVideos,
    } = useChunkedMobileList(filteredVideos, DEFAULT_VISIBLE_PARTS);

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
                        const isCurrentItem = Boolean(currentItemId) && video.id === currentItemId;

                        return (
                            <div
                                key={video.id || index}
                                className={`flex w-full max-w-full flex-col gap-2 overflow-hidden p-2 md:grid md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-2 md:p-3 rounded-lg border ${
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:flex md:gap-1 md:shrink-0">
                                    {shouldShowVideoDownloadButton(videoDownloadUrl) && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 text-xs"
                                            disabled={loadingKeys.has(videoKey)}
                                            onClick={() => triggerDownload(videoDownloadUrl!, videoKey)}
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
                                            onClick={() => triggerDownload(audioDownloadUrl, audioKey)}
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
