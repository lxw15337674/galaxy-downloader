import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import dynamic from 'next/dynamic';
import { X, Download, Loader2, Package } from 'lucide-react';
import Image from "next/image";
import type { HomeDictionary } from '@/lib/i18n/types';
import { UnifiedParseResult, PageInfo } from "../../lib/types";
import { downloadFile, formatDuration, sanitizeFilename } from "../../lib/utils";
import { useState, useEffect, useRef } from 'react';
import { toast } from '@/lib/deferred-toast';

const ExtractAudioButton = dynamic(
    () => import("./ExtractAudioButton").then((m) => m.ExtractAudioButton),
    { ssr: false }
);

interface ResultCardProps {
    result: UnifiedParseResult['data'] | null | undefined
    onClose: () => void;
    dict: HomeDictionary;
}

function resolveCoverSrc(coverUrl: string): string {
    if (coverUrl.startsWith('http://') || coverUrl.startsWith('https://')) {
        return `/api/proxy-image?url=${encodeURIComponent(coverUrl)}`;
    }
    return coverUrl;
}

function replaceTemplate(template: string, token: string, value: string): string {
    return template.replace(token, value);
}

export function ResultCard({ result, onClose, dict }: ResultCardProps) {
    if (!result) return null;

    const isMultiPart = result.isMultiPart && result.pages && result.pages.length > 1;
    const isImageNote = result.noteType === 'image' && !!result.images?.length;
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
                <p className="text-sm text-muted-foreground break-all">
                    {displayTitle}
                    {result.duration != null && (
                        <span className="ml-2 text-xs">({formatDuration(result.duration)})</span>
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
                            dict={dict}
                            singleImageMode
                        />
                    )}
                    {isImageNote ? (
                        <ImageNoteGrid
                            images={result.images!}
                            title={displayTitle}
                            platform={result.platform}
                            dict={dict}
                        />
                    ) : isMultiPart ? (
                        <MultiPartList
                            pages={result.pages!}
                            currentPage={result.currentPage}
                            dict={dict}
                        />
                    ) : (
                        <SinglePartButtons result={result} dict={dict} />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * 单P视频的下载按钮
 */
function SinglePartButtons({ result, dict }: { result: NonNullable<UnifiedParseResult['data']>; dict: HomeDictionary }) {
    const showExtractAudio = result.platform === 'douyin' || result.platform === 'xiaohongshu' || result.platform === 'tiktok';
    const hideVideoDownload = result.platform === 'bilibili_tv';
    const videoDownloadUrl = result.downloadVideoUrl || result.originDownloadVideoUrl;
    const audioDownloadUrl = result.downloadAudioUrl || result.originDownloadAudioUrl || null;

    return (
        <>
            <div className="grid grid-cols-2 gap-2">
                {videoDownloadUrl && !hideVideoDownload && (
                    <Button
                        variant="outline"
                        className="flex items-center justify-center gap-2"
                        onClick={() => {
                            downloadFile(videoDownloadUrl)
                        }}
                    >
                        {dict.result.downloadVideo}
                    </Button>
                )}
                {audioDownloadUrl && (
                    <Button
                        variant="outline"
                        className="flex items-center justify-center gap-2"
                        onClick={() => {
                            downloadFile(audioDownloadUrl)
                        }}
                    >
                        {dict.result.downloadAudio}
                    </Button>
                )}

                {showExtractAudio && videoDownloadUrl && (
                    <ExtractAudioButton
                        videoUrl={videoDownloadUrl}
                        title={result.title}
                        dict={dict}
                    />
                )}
            </div>
        </>
    );
}

/**
 * 多P视频的分P列表
 */
function MultiPartList({ pages, currentPage, dict }: { pages: PageInfo[]; currentPage?: number; dict: HomeDictionary }) {
    return (
        <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
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
                            <span className="text-xs font-medium text-muted-foreground shrink-0">
                                P{page.page}
                            </span>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm line-clamp-2 md:truncate break-words" title={page.part}>
                                    {page.part}
                                </div>
                                <span className="text-xs text-muted-foreground md:hidden">
                                    {formatDuration(page.duration)}
                                </span>
                            </div>
                            <span className="text-xs text-muted-foreground shrink-0 hidden md:inline">
                                {formatDuration(page.duration)}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 md:flex md:gap-1 md:shrink-0">
                            {page.downloadVideoUrl && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => downloadFile(page.downloadVideoUrl!)}
                                >
                                    {dict.result.downloadVideo}
                                </Button>
                            )}
                            {page.downloadAudioUrl && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => downloadFile(page.downloadAudioUrl!)}
                                >
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

function ImageNoteGrid({
    images,
    title,
    platform,
    dict,
    singleImageMode = false,
}: {
    images: string[];
    title: string;
    platform: string;
    dict: HomeDictionary;
    singleImageMode?: boolean;
}) {
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

        // 初始化加载状态
        const initialStates = new Map<number, ImageLoadState>();
        images.forEach((_, index) => {
            initialStates.set(index, { loading: true, error: false, blobUrl: null });
        });
        setImageStates(initialStates);

        // 获取所有图片
        const fetchImages = async () => {
            await Promise.all(
                images.map(async (imageUrl, index) => {
                    try {
                        const referrerMap: Record<string, string> = {
                            xiaohongshu: 'https://www.xiaohongshu.com/',
                            douyin: 'https://www.douyin.com/',
                        };
                        const referrer = referrerMap[platform];
                        const shouldUseCustomReferrer =
                            !!referrer &&
                            (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'));

                        const response = await fetch(imageUrl, shouldUseCustomReferrer ? { referrer } : undefined);
                        if (!response.ok) {
                            throw new Error(`HTTP ${response.status}`);
                        }
                        const blob = await response.blob();
                        const blobUrl = URL.createObjectURL(blob);

                        // 存储到 ref 用于清理
                        currentBlobUrls.add(blobUrl);

                        // 更新状态
                        setImageStates(prev => {
                            const updated = new Map(prev);
                            updated.set(index, { loading: false, error: false, blobUrl });
                            return updated;
                        });
                    } catch (error) {
                        console.error(`Failed to load image ${index}:`, error);
                        setImageStates(prev => {
                            const updated = new Map(prev);
                            updated.set(index, { loading: false, error: true, blobUrl: null });
                            return updated;
                        });
                    }
                })
            );
        };

        fetchImages();

        // 清理函数：释放所有 blob URLs
        return () => {
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
            downloadFile(URL.createObjectURL(zipBlob), `${sanitizeFilename(title)}.zip`);
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

    return (
        <div className="space-y-3">
            {!singleImageMode && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
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
