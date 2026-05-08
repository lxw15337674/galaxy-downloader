'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { ChevronsUpDown } from 'lucide-react';
import { toast } from '@/lib/deferred-toast';
import { useDictionary } from '@/i18n/client';
import { PlatformBadge } from '@/components/platform-badge';
import { Platform } from '../../lib/types';

export interface DownloadRecord {
    url: string;
    title: string;
    timestamp: number;
    platform: Platform;
}

interface DownloadHistoryProps {
    downloadHistory: DownloadRecord[];
    clearHistory: () => void;
    onRedownload?: (url: string) => void;
    defaultOpen?: boolean;
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

export function DownloadHistory({
    downloadHistory,
    clearHistory,
    onRedownload,
    defaultOpen = true,
}: DownloadHistoryProps) {
    const dict = useDictionary()
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const [searchQuery, setSearchQuery] = useState('');

    const handleConfirmClearHistory = () => {
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
                <CardHeader className="flex flex-row items-center justify-between gap-2 shrink-0 p-3 pb-2">
                    <CollapsibleTrigger asChild>
                        <Button
                            variant="ghost"
                            className="h-auto justify-start gap-1.5 rounded-md p-1 text-left hover:bg-muted/50"
                        >
                            <ChevronsUpDown className="size-4" />
                            <div className="space-y-1 text-left">
                                <h2 className="text-base font-semibold tracking-tight">
                                    {dict.history.title}
                                </h2>
                            </div>
                        </Button>
                    </CollapsibleTrigger>
                    <div className="flex items-center gap-2">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="h-8 text-xs"
                                >
                                    {dict.history.clear}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="sm:max-w-md">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{dict.history.clear}?</AlertDialogTitle>
                                    <AlertDialogDescription>{dict.history.title}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{dict.errors.cancel}</AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        onClick={handleConfirmClearHistory}
                                    >
                                        {dict.history.clear}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={dict.history.searchPlaceholder}
                            aria-label={dict.history.searchPlaceholder}
                            className="h-8 w-30 text-xs sm:w-56"
                        />
                    </div>
                </CardHeader>
                <CollapsibleContent className="flex-1 min-h-0 flex flex-col">
                    <CardContent className="flex-1 min-h-0 px-3 pb-3 pt-0 flex flex-col">
                        <div className="max-h-[min(56vh,26rem)] md:max-h-[min(60vh,32rem)] overflow-y-auto overscroll-contain pr-1">
                            <div className="space-y-2 pr-2">
                                {filteredHistory.length === 0 ? (
                                    <p className="py-5 text-center text-xs text-muted-foreground">
                                        {dict.history.noSearchResults}
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {filteredHistory.map((record: DownloadRecord, index: number) => {
                                            return (
                                                <div
                                                    key={index}
                                                    className="flex w-full max-w-full flex-col gap-2 overflow-hidden rounded-lg border border-border p-2 md:grid md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-2 hover:bg-muted/50"
                                                >
                                                    <div className="flex w-full min-w-0 flex-col gap-1 overflow-hidden">
                                                        <div className="line-clamp-2 text-[13px] font-medium leading-snug" title={record.title}>
                                                            {record.title}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                                                            <PlatformBadge platform={record.platform} />
                                                            <span>
                                                                {formatRecordTimestamp(record.timestamp)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:flex md:shrink-0 md:gap-1">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 text-xs"
                                                            onClick={() => {
                                                                window.open(record.url, '_blank');
                                                            }}
                                                        >
                                                            {dict.history.viewSource}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 text-xs"
                                                            onClick={() => handleRedownload(record.url)}
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
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}
