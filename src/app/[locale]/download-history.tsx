'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronsUpDown } from 'lucide-react';
import { toast } from '@/lib/deferred-toast';
import { Platform } from '../../lib/types';
import type { HomeDictionary } from '../../lib/i18n/types';

export interface DownloadRecord {
    url: string;
    title: string;
    timestamp: number;
    platform: Platform;
}

interface DownloadHistoryProps {
    dict: HomeDictionary;
    downloadHistory: DownloadRecord[];
    clearHistory: () => void;
    onRedownload?: (url: string) => void;
}

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
});

function formatRecordTimestamp(timestamp: number): string {
    return DATE_TIME_FORMATTER.format(new Date(timestamp)).replace(',', '');
}

// 获取平台标签样式
const getPlatformBadge = (platform: Platform, dict: HomeDictionary) => {
    switch (platform) {
        case 'bili':
        case 'bilibili':
            return {
                text: dict.history.platforms.bilibili,
                className: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300'
            };
        case 'bilibili_tv':
            return {
                text: dict.history.platforms.bilibiliTv,
                className: 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300'
            };
        case 'douyin':
            return {
                text: dict.history.platforms.douyin,
                className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
            };
        case 'xiaohongshu':
            return {
                text: dict.history.platforms.xiaohongshu,
                className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
            }
        case 'tiktok':
            return {
                text: dict.history.platforms.tiktok,
                className: 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300'
            }
        default:
            return {
                text: dict.history.platforms.unknown,
                className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            };
    }
};

export function DownloadHistory({ dict, downloadHistory, clearHistory, onRedownload }: DownloadHistoryProps) {
    const [isOpen, setIsOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const handleClearHistory = () => {
        const confirmed = window.confirm(`${dict.history.clear}?`);
        if (!confirmed) {
            return;
        }

        clearHistory();
        toast.success(dict.history.cleared);
    };

    const handleRedownload = (url: string) => {
        onRedownload?.(url);
    };

    if (!downloadHistory || downloadHistory.length === 0) {
        return null;
    }

    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filteredHistory = normalizedQuery
        ? downloadHistory.filter((record) => {
            return record.title.toLowerCase().includes(normalizedQuery);
        })
        : downloadHistory;

    return (
        <Card className="flex-1 min-h-0 flex flex-col">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CardHeader className="flex flex-row items-center justify-between pb-2 shrink-0 p-4">
                    <CollapsibleTrigger className="flex items-center gap-2 hover:bg-muted/50 rounded-md p-1 -m-1">
                        <Button variant="ghost" size="icon" className="size-8">
                            <ChevronsUpDown className="size-8" />
                        </Button>
                        <div className="space-y-1 text-left">
                            <h2 className="text-lg font-semibold tracking-tight">
                                {dict.history.title}
                            </h2>
                        </div>
                    </CollapsibleTrigger>
                    <div className="flex items-center gap-2">
                        <Button variant="destructive" size="sm" onClick={handleClearHistory}>
                            {dict.history.clear}
                        </Button>
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={dict.history.searchPlaceholder}
                            aria-label={dict.history.searchPlaceholder}
                            className="w-40 sm:w-56"
                        />
                    </div>
                </CardHeader>
                <CollapsibleContent className="flex-1 min-h-0 flex flex-col">
                    <CardContent className="flex-1 min-h-0 p-0 flex flex-col">
                        <ScrollArea className="h-full flex-1">
                            <div className="px-4 md:px-6 pb-4 md:pb-6">
                                {filteredHistory.length === 0 ? (
                                    <p className="py-6 text-center text-sm text-muted-foreground">
                                        {dict.history.noSearchResults}
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {filteredHistory.map((record: DownloadRecord, index: number) => {
                                            const platformBadge = getPlatformBadge(record.platform, dict);
                                            return (
                                                <div
                                                    key={index}
                                                    className="flex flex-col md:flex-row md:items-center md:justify-between p-2 md:p-3 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors gap-3"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-sm mb-1.5 line-clamp-2" title={record.title} >
                                                            {record.title}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                                                            <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${platformBadge.className}`}>
                                                                {platformBadge.text}
                                                            </span>
                                                            <span>
                                                                {formatRecordTimestamp(record.timestamp)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 md:ml-4 shrink-0">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                window.open(record.url, '_blank');
                                                            }}
                                                            className="flex-1 md:flex-none"
                                                        >
                                                            {dict.history.viewSource}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleRedownload(record.url)}
                                                            className="flex-1 md:flex-none"
                                                        >
                                                            {dict.history.redownload}
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}
