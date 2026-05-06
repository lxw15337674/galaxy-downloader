import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useDictionary } from '@/i18n/client';
import type { PageInfo } from '@/lib/types';
import { formatDuration } from '@/lib/utils';

import { LOAD_MORE_BATCH, useChunkedMobileList } from './use-chunked-mobile-list';
import { replaceTemplate } from './result-card-utils';
import { useTemporaryDownloadKeys } from './use-temporary-download-keys';

const DEFAULT_VISIBLE_PARTS = 100;

export function MultiPartList({ pages, currentPage }: { pages: PageInfo[]; currentPage?: number }) {
    const dict = useDictionary();
    const { loadingKeys, triggerDownload } = useTemporaryDownloadKeys();
    const {
        canCollapseMobile,
        collapse,
        isMobile,
        loadMore,
        minimumVisibleCount,
        remainingCount,
        visibleItems: visiblePages,
    } = useChunkedMobileList(pages, Math.max(DEFAULT_VISIBLE_PARTS, currentPage || 1));

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
                                        onClick={() => triggerDownload(page.downloadVideoUrl!, `${page.page}-video`)}
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
                                        onClick={() => triggerDownload(page.downloadAudioUrl!, `${page.page}-audio`)}
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
