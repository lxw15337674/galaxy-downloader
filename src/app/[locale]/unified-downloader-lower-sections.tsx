'use client';

import type { ReactNode, RefObject } from 'react';
import dynamic from 'next/dynamic';
import type { AudioExtractTask } from '@/components/audio-tool/types';
import type { UnifiedParseResult } from '@/lib/types';
import { ResultCard } from '@/components/downloader/ResultCard';
import type { DownloadRecord } from './download-history';

const DownloadHistory = dynamic(
    () => import('./download-history').then((m) => m.DownloadHistory),
    { ssr: false }
);

interface UnifiedDownloaderLowerSectionsProps {
    parseResult: UnifiedParseResult['data'] | null;
    onCloseParseResult: () => void;
    onOpenExtractAudio: (task: AudioExtractTask) => void;
    mobileAd?: ReactNode;
    mobileGuides?: ReactNode;
    downloadHistory: DownloadRecord[];
    clearHistory: () => void;
    onRedownload: (url: string) => void;
    historyRef: RefObject<HTMLDivElement | null>;
    historyHydrated: boolean;
}

export function UnifiedDownloaderLowerSections({
    parseResult,
    onCloseParseResult,
    onOpenExtractAudio,
    mobileAd,
    mobileGuides,
    downloadHistory,
    clearHistory,
    onRedownload,
    historyRef,
    historyHydrated,
}: UnifiedDownloaderLowerSectionsProps) {
    const hasDownloadHistory = downloadHistory.length > 0;

    return (
        <>
            {parseResult && (
                <ResultCard
                    result={parseResult}
                    onClose={onCloseParseResult}
                    onOpenExtractAudio={onOpenExtractAudio}
                />
            )}

            {mobileAd && <div className="lg:hidden min-h-[250px] overflow-hidden">{mobileAd}</div>}

            <div ref={historyRef}>
                {hasDownloadHistory ? (
                    <DownloadHistory
                        downloadHistory={downloadHistory}
                        clearHistory={clearHistory}
                        onRedownload={onRedownload}
                    />
                ) : !historyHydrated ? (
                    <div className="min-h-[84px]" aria-hidden />
                ) : null}
            </div>

            {mobileGuides && <div className="lg:hidden flex flex-col gap-4">{mobileGuides}</div>}
        </>
    );
}
