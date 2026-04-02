import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Download, ExternalLink, Loader2, Package } from 'lucide-react';
import Image from "next/image";
import { useDictionary } from '@/i18n/client';
import type { AudioExtractTask } from '@/components/audio-tool/types';
import { UnifiedParseResult, PageInfo, EmbeddedVideoInfo } from "../../lib/types";
import { downloadFile, formatDuration, sanitizeFilename } from "../../lib/utils";
import { useState, useEffect, useRef } from 'react';
import { toast } from '@/lib/deferred-toast';
import { normalizePlatform } from "@/lib/platforms";
import {
    getResultMediaActions,
    shouldHideSingleImagePreview,
    shouldShowVideoDownloadButton,
} from "./result-card-visibility";

interface ResultCardProps {
    result: UnifiedParseResult['data'] | null | undefined
    onClose: () => void;
    onOpenExtractAudio: (task: AudioExtractTask) => void;
}

function resolveCoverSrc(coverUrl: string): string {
    if (coverUrl.startsWith('http://') || coverUrl.startsWith('https://')) {
        return `/api/proxy-image?url=${encodeURIComponent(coverUrl)}`;
    }
    return coverUrl;
}

function resolveImageSrc(imageUrl: string): string {
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
    }
    return imageUrl;
}

function replaceTemplate(template: string, token: string, value: string): string {
    return template.replace(token, value);
}

function triggerBlobDownload(blob: Blob, filename: string) {
    const objectUrl = URL.createObjectURL(blob);
    downloadFile(objectUrl, filename);

    // Revoke after the click has been dispatched so browsers can resolve the blob URL.
    window.setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
    }, 1000);
}

export function ResultCard({ result, onClose, onOpenExtractAudio }: ResultCardProps) {
    const dict = useDictionary()
    if (!result) return null;

    const isMultiPart = result.isMultiPart && result.pages && result.pages.length > 1;
    const isImageNote = result.noteType === 'image' && !!result.images?.length;
    const hasEmbeddedVideos = !!result.videos?.length;
    const coverUrl = typeof result.cover === 'string' ? result.cover.trim() : '';
    const shouldShowCover = !isImageNote && coverUrl.length > 0;
    const coverSrc = shouldShowCover ? resolveCoverSrc(coverUrl) : '';

    const displayTitle = result.title;
    return (
        <Card>
            <CardHeader className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg">{dict.result.title}</CardTitle>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <p
                    className="line-clamp-2 text-sm text-foreground/80 break-words"
                    title={displayTitle}
                >
                    {displayTitle}
                    {result.duration != null && (
                        <span className="ml-2 text-xs text-foreground/70">({formatDuration(result.duration)})</span>
                    )}
                </p>
            </CardHeader>
            <CardContent className="px-4 py-2">
                <div className="space-y-4">
                    {shouldShowCover && (
                        <ImageNoteGrid
                            images={[coverSrc]}
                            title={displayTitle}
                            platform={result.platform}
                            singleImageMode
                        />
                    )}
                    {isImageNote ? (
                        <ImageNoteGrid
                            images={result.images!}
                            title={displayTitle}
                            platform={result.platform}
                        />
                    ) : isMultiPart ? (
                        <MultiPartList
                            pages={result.pages!}
                            currentPage={result.currentPage}
                        />
                    ) : hasEmbeddedVideos ? (
                        <EmbeddedVideoList videos={result.videos!} />
                    ) : (
                        <SinglePartButtons result={result} onOpenExtractAudio={onOpenExtractAudio} />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * 单P视频的下载按钮
 */
function SinglePartButtons({
    result,
    onOpenExtractAudio,
}: {
    result: NonNullable<UnifiedParseResult['data']>;
    onOpenExtractAudio: (task: AudioExtractTask) => void;
}) {
    const dict = useDictionary()
    const [videoLoading, setVideoLoading] = useState(false);
    const [audioLoading, setAudioLoading] = useState(false);
    const videoDownloadUrl = result.downloadVideoUrl || result.originDownloadVideoUrl;
    const audioDownloadUrl = result.downloadAudioUrl || result.originDownloadAudioUrl || null;
    const { videoAction, audioAction } = getResultMediaActions({
        videoAudioMode: result.videoAudioMode,
        videoDownloadUrl,
        audioDownloadUrl,
    });
    const showVideoDownload = videoAction !== 'hide';
    const showAudioDownload = audioAction !== 'hide';
    const showOriginVideoLink =
        typeof result.originDownloadVideoUrl === 'string'
        && result.originDownloadVideoUrl.length > 0
        && result.originDownloadVideoUrl !== videoDownloadUrl;
    const showOriginAudioLink =
        typeof result.originDownloadAudioUrl === 'string'
        && result.originDownloadAudioUrl.length > 0
        && result.originDownloadAudioUrl !== audioDownloadUrl;

    const handleDownload = (url: string, setLoading: (v: boolean) => void) => {
        setLoading(true);
        downloadFile(url);
        setTimeout(() => setLoading(false), 1500);
    };

    const openResultTask = (action: AudioExtractTask['action']) => {
        onOpenExtractAudio({
            action,
            title: result.title || result.desc || undefined,
            sourceUrl: result.url || null,
            audioUrl: audioDownloadUrl,
            videoUrl: videoDownloadUrl || null,
            videoAudioMode: result.videoAudioMode,
        });
    };

    return (
        <>
            <div className="grid grid-cols-2 gap-2">
                {showVideoDownload && (
                    <Button
                        variant="outline"
                        className="flex items-center justify-center gap-2"
                        disabled={videoLoading}
                        onClick={() => {
                            if (videoAction === 'merge-then-download') {
                                openResultTask('merge-video');
                                return;
                            }

                            handleDownload(videoDownloadUrl!, setVideoLoading);
                        }}
                    >
                        {videoLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {videoAction === 'merge-then-download'
                            ? dict.result.mergeDownloadVideo
                            : dict.result.downloadVideo}
                    </Button>
                )}
                {showAudioDownload && (
                    <Button
                        variant="outline"
                        className="flex items-center justify-center gap-2"
                        disabled={audioLoading}
                        onClick={() => {
                            if (audioAction === 'extract-audio') {
                                openResultTask('extract-audio');
                                return;
                            }

                            handleDownload(audioDownloadUrl!, setAudioLoading);
                        }}
                    >
                        {audioLoading && audioAction === 'direct-download' && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        {audioAction === 'direct-download'
                            ? dict.result.downloadAudio
                            : dict.extractAudio.button}
                    </Button>
                )}
            </div>
            {videoAction === 'merge-then-download' && (
                <p className="text-xs text-muted-foreground">
                    {dict.result.mergeDownloadVideoHint}
                </p>
            )}
            {(showOriginVideoLink || showOriginAudioLink) && (
                <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs text-muted-foreground">
                    {showOriginVideoLink && (
                        <Button variant="link" size="sm" className="h-auto px-0 py-0 text-xs" asChild>
                            <a
                                href={result.originDownloadVideoUrl!}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                                {dict.result.originDownloadVideo}
                            </a>
                        </Button>
                    )}
                    {showOriginAudioLink && (
                        <Button variant="link" size="sm" className="h-auto px-0 py-0 text-xs" asChild>
                            <a
                                href={result.originDownloadAudioUrl!}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                                {dict.result.originDownloadAudio}
                            </a>
                        </Button>
                    )}
                </div>
            )}
        </>
    );
}

/**
 * 多P视频的分P列表
 */
function MultiPartList({ pages, currentPage }: { pages: PageInfo[]; currentPage?: number }) {
    const dict = useDictionary()
    const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());

    const handleDownload = (url: string, key: string) => {
        setLoadingKeys(prev => new Set(prev).add(key));
        downloadFile(url);
        setTimeout(() => {
            setLoadingKeys(prev => {
                const next = new Set(prev);
                next.delete(key);
                return next;
            });
        }, 1500);
    };

    return (
        <div className="space-y-2">
            <div className="text-sm text-foreground/75">
                {replaceTemplate(dict.result.totalParts, '{count}', String(pages.length))}
            </div>
            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                {pages.map((page) => (
                    <div
                        key={page.page}
                        className={`flex flex-col md:flex-row md:items-center gap-2 p-2 md:p-3 rounded-lg border ${
                            page.page === currentPage
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:bg-muted/50'
                        }`}
                    >
                        <div className="flex items-start md:items-center gap-2 flex-1 min-w-0">
                            <span className="text-xs font-medium text-foreground/70 shrink-0">
                                P{page.page}
                            </span>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm line-clamp-2 md:truncate break-words" title={page.part}>
                                    {page.part}
                                </div>
                                <span className="text-xs text-foreground/65 md:hidden">
                                    {formatDuration(page.duration)}
                                </span>
                            </div>
                            <span className="text-xs text-foreground/65 shrink-0 hidden md:inline">
                                {formatDuration(page.duration)}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 md:flex md:gap-1 md:shrink-0">
                            {page.downloadVideoUrl && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={loadingKeys.has(`${page.page}-video`)}
                                    onClick={() => handleDownload(page.downloadVideoUrl!, `${page.page}-video`)}
                                >
                                    {loadingKeys.has(`${page.page}-video`) && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                                    {dict.result.downloadVideo}
                                </Button>
                            )}
                            {page.downloadAudioUrl && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={loadingKeys.has(`${page.page}-audio`)}
                                    onClick={() => handleDownload(page.downloadAudioUrl!, `${page.page}-audio`)}
                                >
                                    {loadingKeys.has(`${page.page}-audio`) && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                                    {dict.result.downloadAudio}
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function EmbeddedVideoList({ videos }: { videos: EmbeddedVideoInfo[] }) {
    const dict = useDictionary();
    const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());

    const handleDownload = (url: string, key: string) => {
        setLoadingKeys(prev => new Set(prev).add(key));
        downloadFile(url);
        setTimeout(() => {
            setLoadingKeys(prev => {
                const next = new Set(prev);
                next.delete(key);
                return next;
            });
        }, 1500);
    };

    return (
        <div className="space-y-2">
            <div className="text-sm text-foreground/75">
                <span>{dict.result.articleVideoList}</span>
                <span className="ml-2">
                    {replaceTemplate(dict.result.articleVideoCount, '{count}', String(videos.length))}
                </span>
            </div>
            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                {videos.map((video, index) => {
                    const videoDownloadUrl = video.downloadVideoUrl || video.originDownloadVideoUrl || null;
                    const loadingKey = `${video.id || index}-video`;
                    const displayTitle = video.title?.trim()
                        || replaceTemplate(dict.result.articleVideoUntitled, '{index}', String(index + 1));

                    return (
                        <div
                            key={video.id || index}
                            className="flex flex-col md:flex-row md:items-center gap-2 p-2 md:p-3 rounded-lg border border-border hover:bg-muted/50"
                        >
                            <div className="flex items-start md:items-center gap-2 flex-1 min-w-0">
                                <span className="text-xs font-medium text-foreground/70 shrink-0">
                                    {index + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm line-clamp-2 md:truncate break-words" title={displayTitle}>
                                        {displayTitle}
                                    </div>
                                    {video.duration != null && (
                                        <span className="text-xs text-foreground/65 md:hidden">
                                            {formatDuration(video.duration)}
                                        </span>
                                    )}
                                </div>
                                {video.duration != null && (
                                    <span className="text-xs text-foreground/65 shrink-0 hidden md:inline">
                                        {formatDuration(video.duration)}
                                    </span>
                                )}
                            </div>
                            <div className="md:shrink-0">
                                {shouldShowVideoDownloadButton(videoDownloadUrl) && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={loadingKeys.has(loadingKey)}
                                        onClick={() => handleDownload(videoDownloadUrl!, loadingKey)}
                                    >
                                        {loadingKeys.has(loadingKey) && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                                        {dict.result.downloadVideo}
                                    </Button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function ImageNoteGrid({
    images,
    title,
    platform,
    singleImageMode = false,
}: {
    images: string[];
    title: string;
    platform: string;
    singleImageMode?: boolean;
}) {
    const dict = useDictionary()
    // 合并的状态类型
    type ImageLoadState = {
        loading: boolean;
        error: boolean;
        blobUrl: string | null;
    };

    const [imageStates, setImageStates] = useState<Map<number, ImageLoadState>>(new Map());
    const [isPackaging, setIsPackaging] = useState(false);
    const [packagingProgress, setPackagingProgress] = useState(0);

    // 使用 ref 管理 blob URLs，避免依赖问题
    const blobUrlsRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        const currentBlobUrls = new Set<string>();
        blobUrlsRef.current = currentBlobUrls;
        let cancelled = false;
        let rafId: number | null = null;

        // 初始化加载状态
        const initialStates = new Map<number, ImageLoadState>();
        images.forEach((_, index) => {
            initialStates.set(index, { loading: true, error: false, blobUrl: null });
        });
        setImageStates(initialStates);
        const draftStates = new Map(initialStates);

        const flushStates = () => {
            rafId = null;
            if (cancelled) {
                return;
            }
            setImageStates(new Map(draftStates));
        };

        const scheduleFlush = () => {
            if (cancelled || rafId !== null) {
                return;
            }
            rafId = window.requestAnimationFrame(flushStates);
        };

        // 获取所有图片
        const fetchImages = async () => {
            await Promise.all(
                images.map(async (imageUrl, index) => {
                    const resolvedImageUrl = resolveImageSrc(imageUrl);
                    try {
                        const referrerMap: Record<string, string> = {
                            xiaohongshu: 'https://www.xiaohongshu.com/',
                            douyin: 'https://www.douyin.com/',
                            instagram: 'https://www.instagram.com/',
                            x: 'https://x.com/',
                        };
                        const referrer = referrerMap[normalizePlatform(platform)];
                        const shouldUseCustomReferrer =
                            !!referrer &&
                            resolvedImageUrl === imageUrl &&
                            (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'));

                        const response = await fetch(resolvedImageUrl, shouldUseCustomReferrer ? { referrer } : undefined);
                        if (!response.ok) {
                            throw new Error(`HTTP ${response.status}`);
                        }
                        const blob = await response.blob();
                        const blobUrl = URL.createObjectURL(blob);

                        // 存储到 ref 用于清理
                        currentBlobUrls.add(blobUrl);

                        draftStates.set(index, { loading: false, error: false, blobUrl });
                        scheduleFlush();
                    } catch (error) {
                        console.error(`Failed to load image ${index}:`, error);
                        if (resolvedImageUrl !== imageUrl) {
                            try {
                                const response = await fetch(imageUrl);
                                if (!response.ok) {
                                    throw new Error(`HTTP ${response.status}`);
                                }
                                const blob = await response.blob();
                                const blobUrl = URL.createObjectURL(blob);

                                currentBlobUrls.add(blobUrl);

                                draftStates.set(index, { loading: false, error: false, blobUrl });
                                scheduleFlush();
                                return;
                            } catch (fallbackError) {
                                console.error(`Fallback image load failed ${index}:`, fallbackError);
                            }
                        }
                        draftStates.set(index, { loading: false, error: true, blobUrl: null });
                        scheduleFlush();
                    }
                })
            );

            if (cancelled) {
                return;
            }
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
            setImageStates(new Map(draftStates));
        };

        void fetchImages();

        // 清理函数：释放所有 blob URLs
        return () => {
            cancelled = true;
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
            }
            currentBlobUrls.forEach(blobUrl => {
                URL.revokeObjectURL(blobUrl);
            });
            currentBlobUrls.clear();
        };
    }, [images, platform]);

    const handleDownload = (index: number, originalUrl: string) => {
        const state = imageStates.get(index);
        if (state?.blobUrl) {
            // 如果有 blob，直接下载
            downloadFile(state.blobUrl, `${sanitizeFilename(title)}-${index + 1}.jpg`);
        } else {
            // 否则在新标签打开原始 URL
            window.open(originalUrl, '_blank');
        }
    };

    const handlePackageDownload = async () => {
        setIsPackaging(true);
        setPackagingProgress(0);

        try {
            const { default: JSZip } = await import('jszip');
            const zip = new JSZip();
            let successCount = 0;
            let failCount = 0;

            // 遍历所有图片，添加到 zip
            for (let index = 0; index < images.length; index++) {
                const state = imageStates.get(index);
                const blobUrl = state?.blobUrl;
                const hasError = state?.error;

                if (blobUrl && !hasError) {
                    try {
                        // 从 blob URL 获取实际的 blob 数据
                        const response = await fetch(blobUrl);
                        const blob = await response.blob();
                        zip.file(`${sanitizeFilename(title)}-${index + 1}.jpg`, blob);
                        successCount++;
                    } catch (error) {
                        console.error(`Failed to add image ${index} to zip:`, error);
                        failCount++;
                    }
                } else {
                    failCount++;
                }

                // 更新进度
                setPackagingProgress(Math.round(((index + 1) / images.length) * 100));
            }

            // 检查是否有成功添加的图片
            if (successCount === 0) {
                toast.error(dict.errors.allImagesLoadFailed);
                return;
            }
            // 生成 zip 文件
            const zipBlob = await zip.generateAsync({ type: 'blob' });

            // 触发下载
            triggerBlobDownload(zipBlob, `${sanitizeFilename(title)}.zip`);
        } catch (error) {
            console.error('Failed to package images:', error);
            toast.error(dict.errors.packageFailed);
        } finally {
            setIsPackaging(false);
            setPackagingProgress(0);
        }
    };

    // 计算加载完成的数量和成功数量
    const loadedCount = Array.from(imageStates.values()).filter(state => !state.loading).length;
    const allLoaded = loadedCount === images.length;
    const successCount = Array.from(imageStates.values()).filter(state => !state.error && state.blobUrl).length;
    const singleImageState = singleImageMode ? imageStates.get(0) : undefined;
    const shouldHideSingleImage = shouldHideSingleImagePreview(singleImageMode, singleImageState);

    if (shouldHideSingleImage) {
        return null;
    }

    return (
        <div className="space-y-3">
            {!singleImageMode && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-foreground/75">
                        <span className="inline-flex items-center gap-1">
                            {dict.result.imageNote}
                        </span>
                        <span className="ml-2">
                            {replaceTemplate(dict.result.imageCount, '{count}', String(images.length))}
                        </span>
                        {!allLoaded && (
                            <span className="ml-2 text-xs">
                                ({dict.result.imageLoadingProgress.replace('{loaded}', String(loadedCount)).replace('{total}', String(images.length))})
                            </span>
                        )}
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        disabled={!allLoaded || isPackaging || successCount === 0}
                        onClick={handlePackageDownload}
                        className="shrink-0"
                    >
                        {isPackaging ? (
                            <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                {dict.result.packaging} {packagingProgress}%
                            </>
                        ) : (
                            <>
                                <Package className="h-3 w-3 mr-1" />
                                {dict.result.packageDownload}
                            </>
                        )}
                    </Button>
                </div>
            )}
            <div className={`${singleImageMode ? 'grid grid-cols-1' : 'grid grid-cols-2'} gap-3 max-h-[500px] overflow-y-auto pr-1`}>
                {images.map((imageUrl, index) => {
                    const state = imageStates.get(index);
                    const isLoading = state?.loading ?? true;
                    const hasError = state?.error ?? false;
                    const blobUrl = state?.blobUrl ?? null;

                    return (
                        <div
                            key={index}
                            className="relative group border rounded-lg overflow-hidden bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                            <div className={`${singleImageMode ? 'aspect-video' : 'aspect-square'} relative bg-muted flex items-center justify-center`}>
                                {isLoading && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                        <p className="text-xs text-muted-foreground mt-2">{dict.result.loading}</p>
                                    </div>
                                )}
                                {!isLoading && hasError && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                                        <div className="text-2xl">🖼️</div>
                                        <p className="text-xs mt-2">
                                            {singleImageMode
                                                ? dict.result.coverLabel
                                                : replaceTemplate(dict.result.imageIndexLabel, '{index}', String(index + 1))}
                                        </p>
                                        <p className="text-[10px] mt-1 opacity-60">{dict.result.loadFailed}</p>
                                    </div>
                                )}
                                {!isLoading && !hasError && blobUrl && (
                                    <Image
                                        src={blobUrl}
                                        alt={
                                            singleImageMode
                                                ? (title || dict.result.coverLabel)
                                                : replaceTemplate(dict.result.imageAlt, '{index}', String(index + 1))
                                        }
                                        fill
                                        unoptimized
                                        sizes={singleImageMode ? '(max-width: 1024px) 100vw, 720px' : '(max-width: 768px) 50vw, 33vw'}
                                        className="object-cover"
                                    />
                                )}
                            </div>
                            {!isLoading && (
                                <div className="absolute bottom-2 right-2">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="h-8 w-8 p-0 shadow-md"
                                        onClick={() => handleDownload(index, imageUrl)}
                                        title={blobUrl ? dict.result.downloadImage : dict.result.viewLargeImage}
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                            {!singleImageMode && (
                                <div className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                                    {index + 1}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
} 
