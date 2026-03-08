'use client';

import { useState, useRef, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

import { toast } from '@/lib/deferred-toast';
import { Loader2, HelpCircle, Menu, Github, History } from 'lucide-react';
import type { HomeDictionary } from '@/lib/i18n/types';
import type { Locale } from "@/lib/i18n/config";
import { DeferredLanguageSwitcher } from "@/components/deferred-language-switcher";
import { DeferredFeedbackDialog } from '@/components/deferred-feedback-dialog';
import { DeferredChangelogDialog } from '@/components/deferred-changelog-dialog';
import { API_ENDPOINTS } from '@/lib/config';
import { appendLangQuery, buildApiI18nHeaders } from '@/lib/api-i18n';

import type { DownloadRecord } from './download-history';
import { useLocalStorageState } from '@/hooks/use-local-storage-state';
import type { UnifiedParseResult } from '@/lib/types';
import { Platform } from '@/lib/types';
import { DOWNLOAD_HISTORY_MAX_COUNT, DOWNLOAD_HISTORY_STORAGE_KEY } from '@/lib/constants';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

const DownloadHistory = dynamic(
    () => import('./download-history').then((m) => m.DownloadHistory),
    { ssr: false }
);
const ResultCard = dynamic(
    () => import('@/components/downloader/ResultCard').then((m) => m.ResultCard),
    { ssr: false }
);

interface UnifiedDownloaderProps {
    dict: HomeDictionary;
    locale: Locale;
    leftRail?: ReactNode;
    rightRail?: ReactNode;
    mobileAd?: ReactNode;
    mobileGuides?: ReactNode;
    heroMeta?: ReactNode;
    footer?: ReactNode;
}

type UnifiedParseSuccessResult = UnifiedParseResult & {
    success: true;
    data: NonNullable<UnifiedParseResult['data']>;
};

async function requestUnifiedParse(videoUrl: string, locale: Locale): Promise<UnifiedParseSuccessResult> {
    const params = new URLSearchParams({ url: videoUrl });
    const requestUrl = appendLangQuery(`${API_ENDPOINTS.unified.parse}?${params.toString()}`, locale);
    const response = await fetch(requestUrl, {
        method: 'GET',
        cache: 'no-store',
        headers: buildApiI18nHeaders(locale),
    });

    let payload: UnifiedParseResult | null = null;
    try {
        payload = await response.json() as UnifiedParseResult;
    } catch {
        throw new Error('');
    }

    if (!response.ok || !payload?.success || !payload.data) {
        throw new Error(payload?.error || '');
    }

    return payload as UnifiedParseSuccessResult;
}

export function UnifiedDownloader({
    dict,
    locale,
    leftRail,
    rightRail,
    mobileAd,
    mobileGuides,
    heroMeta,
    footer,
}: UnifiedDownloaderProps) {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [parseResult, setParseResult] = useState<UnifiedParseResult['data'] | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const historyRef = useRef<HTMLDivElement>(null);

    const [downloadHistory, setDownloadHistory] = useLocalStorageState<DownloadRecord[]>(DOWNLOAD_HISTORY_STORAGE_KEY, {
        defaultValue: []
    });
    const addToHistory = (record: DownloadRecord) => {
        setDownloadHistory(prev => [record, ...(prev || []).slice(0, DOWNLOAD_HISTORY_MAX_COUNT - 1)]);
    };

    const clearDownloadHistory = () => {
        setDownloadHistory([]);
    };

    const getPlatformLabel = (platform: string): string => {
        switch (platform) {
            case 'bili':
            case 'bilibili':
                return dict.history.platforms.bilibili;
            case 'bilibili_tv':
                return dict.history.platforms.bilibiliTv;
            case 'douyin':
                return dict.history.platforms.douyin;
            case 'xiaohongshu':
                return dict.history.platforms.xiaohongshu;
            case 'tiktok':
                return dict.history.platforms.tiktok;
            default:
                return dict.history.platforms.unknown;
        }
    };

    // 统一解析处理：只解析不自动下载
    const handleUnifiedParse = async (videoUrl: string) => {
        // 调用解析接口获取视频信息
        const apiResult = await requestUnifiedParse(videoUrl, locale);
        const platformCode = apiResult.data.platform;
        const platformLabel = getPlatformLabel(platformCode);

        // 直接保存完整 parseResult.data，便于 ResultCard 渲染所有字段
        setParseResult(apiResult.data);

        // 添加到下载历史 - 如果没有 title，使用 desc
        // 使用 API 返回的规范 URL，避免口令等原始输入无法跳转
        const displayTitle = apiResult.data.title || apiResult.data.desc || dict.history.unknownTitle;
        const newRecord: DownloadRecord = {
            url: apiResult.data.url || videoUrl,
            title: displayTitle,
            timestamp: Date.now(),
            platform: platformCode as Platform
        };
        addToHistory(newRecord);

        // 显示成功提示
        toast.success(dict.toast.douyinParseSuccess, {
            description: `${platformLabel}: ${displayTitle}`,
        });
    };

    const closeParseResult = () => {
        setParseResult(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setParseResult(null);

        if (!url.trim()) {
            setError(dict.errors.emptyUrl);
            setLoading(false);
            return;
        }

        try {
            // 使用统一接口处理所有平台，后端负责所有检测和处理
            await handleUnifiedParse(url.trim());

            setUrl('');
        } catch (err) {
            const errorMessage = err instanceof Error && err.message ? err.message : dict.errors.downloadError;
            setError(errorMessage);
            toast.error(dict.errors.downloadFailed, {
                description: errorMessage
            });
        }

        setLoading(false);
    };

    const handleRedownload = (url: string) => {
        setUrl(url);
        toast(dict.toast.linkFilledForRedownload, {
            description: dict.toast.clickToRedownloadDesc,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <div
                className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm"
                style={{ paddingTop: 'env(safe-area-inset-top)' }}
            >
                <div className="md:hidden max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                        {downloadHistory.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-1.5"
                                onClick={() => {
                                    if (historyRef.current) {
                                        const top = historyRef.current.getBoundingClientRect().top + window.scrollY - 64;
                                        window.scrollTo({ top, behavior: 'smooth' });
                                    }
                                }}
                            >
                                <History className="h-4 w-4" />
                                <span>{dict.history.title}</span>
                            </Button>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <DeferredFeedbackDialog locale={locale} dict={dict} />
                        <DeferredLanguageSwitcher currentLocale={locale} dict={dict} compact />
                        <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" aria-label={dict.page.openMenuLabel}>
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="top-auto bottom-4 left-1/2 w-[calc(100%-2rem)] max-w-sm translate-x-[-50%] translate-y-0 rounded-xl p-4">
                                <DialogHeader>
                                    <DialogTitle className="text-base">{dict.unified.pageTitle}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-2">
                                    <Button variant="outline" className="w-full justify-start" asChild>
                                        <a href="https://github.com/lxw15337674/galaxy-downloader" target="_blank" rel="noopener noreferrer" onClick={() => setMobileMenuOpen(false)}>
                                            <Github className="h-4 w-4" />
                                            <span>GitHub</span>
                                        </a>
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start" asChild>
                                        <Link href={`/${locale}/faq`} prefetch={false} onClick={() => setMobileMenuOpen(false)}>
                                            <HelpCircle className="h-4 w-4" />
                                            <span>{dict.page.faqLinkText}</span>
                                        </Link>
                                    </Button>
                                    <DeferredChangelogDialog
                                        locale={locale}
                                        dict={dict}
                                        triggerClassName="w-full justify-start"
                                    />
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
                <div className="hidden md:flex max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-3 justify-end items-center gap-1">
                    <Button variant="ghost" size="sm" asChild>
                        <a href="https://github.com/lxw15337674/galaxy-downloader" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                            <Github className="h-4 w-4" />
                            <span>GitHub</span>
                        </a>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/${locale}/faq`} prefetch={false} className="flex items-center gap-1">
                            <HelpCircle className="h-4 w-4" />
                            <span>{dict.page.faqLinkText}</span>
                        </Link>
                    </Button>
                    <DeferredFeedbackDialog locale={locale} dict={dict} />
                    <DeferredChangelogDialog locale={locale} dict={dict} />
                    <DeferredLanguageSwitcher currentLocale={locale} dict={dict} />
                </div>
            </div>

            <main className="flex-1 p-3 sm:p-4 md:p-6 pt-4">
                {/* PC端三栏布局，移动端垂直布局 */}
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* 左栏：快速入门指南 (PC端显示，移动端隐藏) */}
                        <div className="hidden lg:block">
                            <div className="sticky top-20 flex flex-col gap-4">
                                {leftRail}
                            </div>
                        </div>

                        {/* 中栏：主要功能区域 */}
                        <div className="lg:col-span-2 flex flex-col gap-4">
                            <Card className="shrink-0">
                                <CardHeader className="p-4">
                                    <h1 className="text-2xl text-center font-semibold tracking-tight">
                                        {dict.unified.pageTitle}
                                    </h1>
                                    <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5 flex-wrap">
                                        {dict.unified.pageDescription}
                                        <span className="inline-flex items-center rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400 ring-1 ring-inset ring-green-500/30">
                                            {dict.unified.newBadge}
                                        </span>
                                    </p>
                                    {heroMeta}
                                </CardHeader>
                                <CardContent className="p-4">
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <Textarea
                                                id="url"
                                                value={url}
                                                onChange={(e) => setUrl(e.target.value)}
                                                placeholder={dict.unified.placeholder}
                                                required
                                                className="min-h-[80px] resize-none break-all"
                                            />
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="flex-1"
                                                    onClick={async () => {
                                                        try {
                                                            const text = await navigator.clipboard.readText();
                                                            setUrl(text);

                                                            // 显示链接已粘贴提示
                                                            toast.success(dict.toast.linkFilled);
                                                        } catch (err) {
                                                            console.error('Failed to read clipboard:', err);
                                                            toast.error(dict.errors.clipboardFailed, {
                                                                description: dict.errors.clipboardPermission,
                                                            });
                                                        }
                                                    }}
                                                >
                                                    {dict.form.pasteButton}
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    className="flex-1 flex items-center justify-center gap-2"
                                                    disabled={loading || !url.trim()}
                                                >
                                                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                                    {loading ? dict.form.downloading : dict.form.downloadButton}
                                                </Button>
                                            </div>
                                        </div>
                                        {error && (
                                            <p className="text-sm text-destructive text-center">{error}</p>
                                        )}
                                    </form>
                                </CardContent>
                            </Card>

                            {parseResult && (
                                <ResultCard
                                    result={parseResult}
                                    onClose={closeParseResult}
                                    dict={dict}
                                />
                            )}

                            {mobileAd && <div className="lg:hidden">{mobileAd}</div>}

                            {/* 历史记录 */}
                            {downloadHistory.length > 0 && (
                                <div ref={historyRef}>
                                <DownloadHistory
                                    dict={dict}
                                    downloadHistory={downloadHistory}
                                    clearHistory={clearDownloadHistory}
                                    onRedownload={handleRedownload}
                                />
                                </div>
                            )}

                            {/* 移动端帮助卡片 - 放在历史记录下方 */}
                            {mobileGuides && <div className="lg:hidden flex flex-col gap-4">{mobileGuides}</div>}
                        </div>

                        {/* 右栏：平台支持指南 (PC端显示，移动端隐藏) */}
                        <div className="hidden lg:block">
                            <div className="sticky top-20 flex flex-col gap-4">
                                {rightRail}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {footer}
        </div>
    );
} 
