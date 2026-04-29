'use client';

import { startTransition, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { toast } from '@/lib/deferred-toast';
import { DeferredAudioExtractDialog } from '@/components/deferred-audio-extract-dialog';
import type { AudioExtractTask } from '@/components/audio-tool/types';
import { ArrowUp, Loader2, Link2 } from 'lucide-react';
import { AppTopBar } from '@/components/layout/app-top-bar';

import type { DownloadRecord } from './download-history';
import { useLocalStorageState } from '@/hooks/use-local-storage-state';
import { useInstallPrompt } from '@/hooks/use-install-prompt';
import type { UnifiedParseResult } from '@/lib/types';
import { Platform } from '@/lib/types';
import { DOWNLOAD_HISTORY_MAX_COUNT, DOWNLOAD_HISTORY_STORAGE_KEY } from '@/lib/constants';
import { useDictionary } from '@/i18n/client';
import { isApiRequestError, resolveApiErrorMessage } from '@/lib/api-errors';
import { getPlatformLabel, normalizePlatform } from '@/lib/platforms';
import { requestUnifiedParse } from '@/lib/unified-parse';

const UnifiedDownloaderLowerSections = dynamic(
    () => import('./unified-downloader-lower-sections').then((m) => m.UnifiedDownloaderLowerSections),
    { ssr: false }
);

interface UnifiedDownloaderProps {
    leftRail?: ReactNode;
    rightRail?: ReactNode;
    mobileAd?: ReactNode;
    mobileGuides?: ReactNode;
    heroMeta?: ReactNode;
    footer?: ReactNode;
}

function resolveSharePlaybackUrl(result: UnifiedParseResult['data'] | null): string | null {
    const sourceUrl = typeof result?.url === 'string' ? result.url.trim() : '';
    if (!sourceUrl) {
        return null;
    }

    return `/api/play?url=${encodeURIComponent(sourceUrl)}`;
}

export function UnifiedDownloader({
    leftRail,
    rightRail,
    mobileAd,
    mobileGuides,
    heroMeta,
    footer,
}: UnifiedDownloaderProps) {
    const dict = useDictionary()
    const searchParams = useSearchParams();
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [audioToolMounted, setAudioToolMounted] = useState(false);
    const [audioToolOpen, setAudioToolOpen] = useState(false);
    const [audioToolEntry, setAudioToolEntry] = useState<'toolbar' | 'result'>('toolbar');
    const [audioToolTask, setAudioToolTask] = useState<AudioExtractTask | null>(null);
    const [parseResult, setParseResult] = useState<UnifiedParseResult['data'] | null>(null);
    const [sharePlaybackEnabled, setSharePlaybackEnabled] = useState(false);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const historyRef = useRef<HTMLDivElement>(null);
    const urlInputRef = useRef<HTMLTextAreaElement>(null);
    const handledShareTaskRef = useRef<string | null>(null);

    const [downloadHistory, setDownloadHistory, historyHydrated] = useLocalStorageState<DownloadRecord[]>(DOWNLOAD_HISTORY_STORAGE_KEY, {
        defaultValue: []
    });
    const { canPrompt, promptInstall, dismiss } = useInstallPrompt();
    const hasPromptedInstall = useRef(false);
    const addToHistory = useCallback((record: DownloadRecord) => {
        const normalizedUrl = record.url.trim();
        setDownloadHistory(prev => [
            record,
            ...(prev || []).filter((item) => item.url.trim() !== normalizedUrl)
        ].slice(0, DOWNLOAD_HISTORY_MAX_COUNT));
    }, [setDownloadHistory]);

    const clearDownloadHistory = () => {
        setDownloadHistory([]);
    };

    const openToolbarAudioTool = () => {
        setAudioToolMounted(true);
        setAudioToolEntry('toolbar');
        setAudioToolTask(null);
        setAudioToolOpen(true);
    };

    const openResultAudioExtract = (task: AudioExtractTask) => {
        setAudioToolMounted(true);
        setAudioToolEntry('result');
        setAudioToolTask(task);
        setAudioToolOpen(true);
    };

    // 统一解析处理：只解析不自动下载
    const handleUnifiedParse = useCallback(async (videoUrl: string) => {
        void import('./unified-downloader-lower-sections');

        // 调用解析接口获取视频信息
        const apiResult = await requestUnifiedParse(videoUrl);
        const normalizedData = {
            ...apiResult.data,
            platform: normalizePlatform(apiResult.data.platform),
        };
        const platformCode = normalizedData.platform;
        const platformLabel = getPlatformLabel(platformCode, dict);

        // 添加到下载历史 - 如果没有 title，使用 desc
        // 使用 API 返回的规范 URL，避免口令等原始输入无法跳转
        const displayTitle = normalizedData.title || normalizedData.desc || dict.history.unknownTitle;
        const nextRecord: DownloadRecord = {
            url: normalizedData.url || videoUrl,
            title: displayTitle,
            timestamp: Date.now(),
            platform: platformCode as Platform
        };

        // Parse result card can be heavy on mobile. Mark as transition to keep interaction responsive.
        startTransition(() => {
            // 直接保存完整 parseResult.data，便于 ResultCard 渲染所有字段
            setParseResult(normalizedData);
            addToHistory(nextRecord);
        });

        // 显示成功提示
        toast.success(dict.toast.douyinParseSuccess, {
            description: `${platformLabel}: ${displayTitle}`,
        });

        // 首次解析成功后提示安装 PWA
        if (canPrompt && !hasPromptedInstall.current) {
            hasPromptedInstall.current = true;
            toast(dict.toast.installTitle, {
                description: dict.toast.installDescription,
                duration: 10000,
                action: {
                    label: dict.toast.installAction,
                    onClick: promptInstall,
                },
                onDismiss: dismiss,
            });
        }
    }, [addToHistory, canPrompt, dict, dismiss, promptInstall]);

    const closeParseResult = () => {
        setParseResult(null);
        setSharePlaybackEnabled(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setParseResult(null);
        setSharePlaybackEnabled(false);

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
            if (isApiRequestError(err)) {
                console.error('Unified parse request failed', {
                    code: err.code,
                    status: err.status,
                    requestId: err.requestId,
                    details: err.details,
                });
            }

            const errorMessage = resolveApiErrorMessage(err, dict);
            setError(errorMessage);
            toast.error(dict.errors.downloadFailed, {
                description: errorMessage
            });
        }

        setLoading(false);
    };

    const handleRedownload = (url: string) => {
        setUrl(url);
        setParseResult(null);
        setSharePlaybackEnabled(false);
        toast(dict.toast.linkFilledForRedownload, {
            description: dict.toast.clickToRedownloadDesc,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const sharedPlaySourceUrl = searchParams.get('play')?.trim() ?? '';
    const sharedAutoplayRequested = searchParams.get('autoplay') === '1';
    const sharePlaybackUrl = sharePlaybackEnabled ? resolveSharePlaybackUrl(parseResult) : null;
    const hasDownloadHistory = downloadHistory.length > 0;
    const showHistoryShortcut = historyHydrated && hasDownloadHistory;

    useEffect(() => {
        if (!sharedPlaySourceUrl) {
            return;
        }

        const taskKey = `${sharedPlaySourceUrl}::${sharedAutoplayRequested ? '1' : '0'}`;
        if (handledShareTaskRef.current === taskKey) {
            return;
        }
        handledShareTaskRef.current = taskKey;

        let cancelled = false;

        const runSharedPlayback = async () => {
            setLoading(true);
            setError('');
            setParseResult(null);
            setUrl(sharedPlaySourceUrl);
            setSharePlaybackEnabled(sharedAutoplayRequested);

            try {
                await handleUnifiedParse(sharedPlaySourceUrl);
            } catch (err) {
                if (cancelled) {
                    return;
                }

                if (isApiRequestError(err)) {
                    console.error('Shared playback parse failed', {
                        code: err.code,
                        status: err.status,
                        requestId: err.requestId,
                        details: err.details,
                    });
                }

                const errorMessage = resolveApiErrorMessage(err, dict);
                setError(errorMessage);
                setSharePlaybackEnabled(false);
                toast.error(dict.errors.downloadFailed, {
                    description: errorMessage,
                });
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void runSharedPlayback();

        return () => {
            cancelled = true;
        };
    }, [dict, handleUnifiedParse, sharedAutoplayRequested, sharedPlaySourceUrl]);

    useEffect(() => {
        let idleId: number | null = null;
        let timerId: ReturnType<typeof setTimeout> | null = null;

        const preloadInteractiveChunks = () => {
            void import('./unified-downloader-lower-sections');
        };

        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
            idleId = window.requestIdleCallback(() => {
                preloadInteractiveChunks();
            }, { timeout: 3000 });
        } else {
            timerId = setTimeout(() => {
                preloadInteractiveChunks();
            }, 1200);
        }

        return () => {
            if (idleId !== null && 'cancelIdleCallback' in window) {
                window.cancelIdleCallback(idleId);
            }
            if (timerId !== null) {
                clearTimeout(timerId);
            }
        };
    }, []);

    useEffect(() => {
        let ticking = false;

        const updateVisibility = () => {
            const shouldShow = window.scrollY > 800;
            setShowBackToTop((prev) => (prev === shouldShow ? prev : shouldShow));
            ticking = false;
        };

        const handleScroll = () => {
            if (ticking) {
                return;
            }
            ticking = true;
            window.requestAnimationFrame(updateVisibility);
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <AppTopBar
                showHistoryShortcut={showHistoryShortcut}
                onHistoryClick={() => {
                    if (historyRef.current) {
                        const top = historyRef.current.getBoundingClientRect().top + window.scrollY - 64;
                        window.scrollTo({ top, behavior: 'smooth' });
                    }
                }}
                showAudioTool
                onAudioToolClick={openToolbarAudioTool}
            />

            <DeferredAudioExtractDialog
                mounted={audioToolMounted}
                open={audioToolOpen}
                onOpenChange={(nextOpen) => {
                    setAudioToolOpen(nextOpen);
                    if (!nextOpen) {
                        setAudioToolTask(null);
                        setAudioToolEntry('toolbar');
                    }
                }}
                entry={audioToolEntry}
                autoExtractTask={audioToolTask}
            />

            <main className="flex-1 p-3 sm:p-4 md:p-4 pt-4">
                {/* PC端三栏布局，移动端垂直布局 */}
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
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
                                    <p className="text-xs text-foreground/70 text-center flex items-center justify-center gap-1.5 flex-wrap">
                                        {dict.unified.pageDescription}
                                    </p>
                                    {dict.unified.exampleUrl && (
                                        <div className="mx-auto flex max-w-full items-center justify-center">
                                            <button
                                                type="button"
                                                className="inline-flex max-w-full items-center gap-1 rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs text-foreground/65 transition-colors hover:border-primary/35 hover:bg-muted/70 hover:text-foreground"
                                                onClick={() => {
                                                    setUrl(dict.unified.exampleUrl!);
                                                    toast.success(dict.toast.linkFilled);
                                                    window.requestAnimationFrame(() => {
                                                        urlInputRef.current?.focus();
                                                        const input = urlInputRef.current;
                                                        if (input) {
                                                            const valueLength = input.value.length;
                                                            input.setSelectionRange(valueLength, valueLength);
                                                        }
                                                    });
                                                }}
                                            >
                                                <Link2 className="h-3.5 w-3.5 shrink-0 text-foreground/45" />
                                                <span className="shrink-0 text-foreground/45">{dict.unified.exampleLabel}</span>
                                                <span className="truncate text-left">{dict.unified.exampleUrl}</span>
                                            </button>
                                        </div>
                                    )}
                                    {heroMeta}
                                    <div className="rounded-md border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-xs text-foreground/85 break-words">
                                        {dict.page.copyrightBilibiliRestriction}
                                    </div>
                                </CardHeader>
                                <CardContent className="px-4 pb-4 pt-0">
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                         
                                            <Textarea
                                                id="url"
                                                ref={urlInputRef}
                                                value={url}
                                                onChange={(e) => setUrl(e.target.value)}
                                                placeholder={dict.unified.placeholder}
                                                required
                                                className="min-h-[120px] resize-none break-all"
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

                            {sharePlaybackEnabled && parseResult && (
                                <Card className="shrink-0">
                                    <CardHeader className="p-4 pb-2">
                                        <h2 className="text-base font-semibold">{dict.result.sharePlayPlayerTitle}</h2>
                                        <p className="text-xs text-muted-foreground line-clamp-1" title={parseResult.title}>
                                            {parseResult.title}
                                        </p>
                                    </CardHeader>
                                    <CardContent className="px-4 pb-4 pt-0">
                                        {sharePlaybackUrl ? (
                                            <video
                                                src={sharePlaybackUrl}
                                                controls
                                                autoPlay
                                                muted
                                                playsInline
                                                preload="metadata"
                                                className="w-full max-h-[60vh] rounded-lg bg-black"
                                            />
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                {dict.result.sharePlayUnavailable}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            <UnifiedDownloaderLowerSections
                                parseResult={parseResult}
                                onCloseParseResult={closeParseResult}
                                onOpenExtractAudio={openResultAudioExtract}
                                mobileAd={mobileAd}
                                mobileGuides={mobileGuides}
                                downloadHistory={downloadHistory}
                                clearHistory={clearDownloadHistory}
                                onRedownload={handleRedownload}
                                historyRef={historyRef}
                                historyHydrated={historyHydrated}
                            />
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

            <Button
                type="button"
                size="icon"
                className={`fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-30 h-10 w-10 rounded-full shadow-md transition-all duration-300 ease-out ${
                    showBackToTop
                        ? 'pointer-events-auto opacity-100 translate-y-0 scale-100'
                        : 'pointer-events-none opacity-0 translate-y-2 scale-95'
                }`}
                aria-label={dict.common.backToTop}
                onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
            >
                <ArrowUp className="h-4 w-4" />
            </Button>
        </div>
    );
}
