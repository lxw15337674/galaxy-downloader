import { useState } from 'react';
import { Download, ExternalLink, ImageDown, MonitorPlay, Headphones } from 'lucide-react';

import type { AudioExtractTask } from '@/components/audio-tool/types';
import type { HlsDownloadDialogRequest } from '@/components/hls-download-dialog';
import type { MediaPreviewRequest } from '@/components/downloader/media-preview';
import { Button } from '@/components/ui/button';
import { useDictionary } from '@/i18n/client';
import { isHlsPlaylistUrl } from '@/lib/hls-playback';
import type { UnifiedParseResult } from '@/lib/types';
import { downloadFile } from '@/lib/utils';

import { MediaActionIconButton } from './MediaActionIconButton';
import { canPreviewResultAudio, canPreviewResultVideo } from './media-preview';
import { getResultMediaActions } from './result-card-visibility';
import { VideoDownloadIcon, AudioDownloadIcon } from './CustomIcons';

export function SinglePartButtons({
    result,
    previewItem,
    onDownloadCover,
    onOpenExtractAudio,
    onOpenHlsDownload,
    onRequestPreview,
}: {
    result: NonNullable<UnifiedParseResult['data']>;
    previewItem?: string;
    onDownloadCover?: () => Promise<void> | void;
    onOpenExtractAudio: (task: AudioExtractTask) => void;
    onOpenHlsDownload: (request: HlsDownloadDialogRequest) => void;
    onRequestPreview: (request: MediaPreviewRequest) => void;
}) {
    const dict = useDictionary();
    const [videoLoading, setVideoLoading] = useState(false);
    const [audioLoading, setAudioLoading] = useState(false);
    const [coverLoading, setCoverLoading] = useState(false);
    const previewSourceUrl = typeof result.url === 'string' ? result.url.trim() : '';
    const videoDownloadUrl = result.downloadVideoUrl || result.originDownloadVideoUrl;
    const audioDownloadUrl = result.downloadAudioUrl || result.originDownloadAudioUrl || null;
    const { videoAction, audioAction } = getResultMediaActions({
        mediaActions: result.mediaActions,
        videoDownloadUrl,
        audioDownloadUrl,
    });
    const showVideoDownload = videoAction !== 'hide';
    const showAudioDownload = audioAction !== 'hide';
    const showCoverDownload = Boolean(onDownloadCover);
    const showVideoPreview = previewSourceUrl.length > 0 && canPreviewResultVideo(result);
    const showAudioPreview = previewSourceUrl.length > 0 && canPreviewResultAudio(result);
    const showOriginVideoLink =
        typeof result.originDownloadVideoUrl === 'string'
        && result.originDownloadVideoUrl.length > 0
        && result.originDownloadVideoUrl !== videoDownloadUrl;
    const showOriginAudioLink =
        typeof result.originDownloadAudioUrl === 'string'
        && result.originDownloadAudioUrl.length > 0
        && result.originDownloadAudioUrl !== audioDownloadUrl;
    const showBrowserHlsDownload = isHlsPlaylistUrl(result.originDownloadVideoUrl);

    const handleDownload = (url: string, setLoading: (value: boolean) => void) => {
        setLoading(true);
        downloadFile(url);
        setTimeout(() => setLoading(false), 1500);
    };

    const openBrowserHlsDownload = () => {
        if (!result.originDownloadVideoUrl) {
            return;
        }

        onOpenHlsDownload({
            sourceUrl: result.originDownloadVideoUrl,
            refererUrl: result.url || result.originDownloadVideoUrl,
            title: result.title || result.desc || dict.history.unknownTitle,
        });
    };

    const openResultTask = (action: AudioExtractTask['action']) => {
        onOpenExtractAudio({
            action,
            title: result.title || result.desc || undefined,
            sourceUrl: result.url || null,
            audioUrl: audioDownloadUrl,
            videoUrl: videoDownloadUrl || null,
            mediaActions: result.mediaActions,
        });
    };
    const previewTitle = result.title || result.desc || dict.result.title;
    const actionCount = Number(showVideoPreview)
        + Number(showVideoDownload)
        + Number(showBrowserHlsDownload)
        + Number(showAudioPreview)
        + Number(showAudioDownload)
        + Number(showCoverDownload);
    const actionGridClass = actionCount >= 5
        ? 'grid-cols-2 sm:grid-cols-5'
        : actionCount === 4
        ? 'grid-cols-4'
        : actionCount === 3
            ? 'grid-cols-3'
            : actionCount === 2
                ? 'grid-cols-2'
                : 'grid-cols-1';
    const actionButtonClass = 'w-full min-w-0';

    return (
        <>
            <div className={`grid ${actionGridClass} gap-2`}>
                {showVideoPreview && (
                    <MediaActionIconButton
                        label={dict.result.playVideo}
                        icon={MonitorPlay}
                        variant="secondary"
                        className={actionButtonClass}
                        onClick={() => onRequestPreview({
                            mediaType: 'video',
                            sourceUrl: previewSourceUrl,
                            title: previewTitle,
                            item: previewItem,
                        })}
                    />
                )}
                {showAudioPreview && (
                    <MediaActionIconButton
                        label={dict.result.playAudio}
                        icon={Headphones}
                        variant="secondary"
                        className={actionButtonClass}
                        onClick={() => onRequestPreview({
                            mediaType: 'audio',
                            sourceUrl: previewSourceUrl,
                            title: previewTitle,
                            item: previewItem,
                        })}
                    />
                )}
                {showVideoDownload && (
                    <MediaActionIconButton
                        label={videoAction === 'merge-then-download'
                            ? dict.result.mergeDownloadVideo
                            : dict.result.downloadVideo}
                        icon={VideoDownloadIcon}
                        variant="default"
                        className={actionButtonClass}
                        disabled={videoLoading}
                        loading={videoLoading}
                        onClick={() => {
                            if (videoAction === 'merge-then-download') {
                                openResultTask('merge-video');
                                return;
                            }

                            handleDownload(videoDownloadUrl!, setVideoLoading);
                        }}
                    />
                )}
                {showBrowserHlsDownload && (
                    <MediaActionIconButton
                        label={dict.result.browserDownloadVideo}
                        icon={Download}
                        variant="outline"
                        className={actionButtonClass}
                        onClick={openBrowserHlsDownload}
                    />
                )}
                {showAudioDownload && (
                    <MediaActionIconButton
                        label={audioAction === 'direct-download'
                            ? dict.result.downloadAudio
                            : dict.extractAudio.button}
                        icon={AudioDownloadIcon}
                        variant="default"
                        className={actionButtonClass}
                        disabled={audioLoading}
                        loading={audioLoading && audioAction === 'direct-download'}
                        onClick={() => {
                            if (audioAction === 'extract-audio') {
                                openResultTask('extract-audio');
                                return;
                            }

                            handleDownload(audioDownloadUrl!, setAudioLoading);
                        }}
                    />
                )}
                {showCoverDownload && (
                    <MediaActionIconButton
                        label={dict.result.downloadCover}
                        icon={ImageDown}
                        variant="default"
                        className={actionButtonClass}
                        disabled={coverLoading}
                        loading={coverLoading}
                        onClick={async () => {
                            setCoverLoading(true);
                            try {
                                await onDownloadCover?.();
                            } finally {
                                setCoverLoading(false);
                            }
                        }}
                    />
                )}
            </div>
            {videoAction === 'merge-then-download' && (
                <p className="text-xs text-muted-foreground">
                    {dict.result.mergeDownloadVideoHint}
                </p>
            )}
            {showBrowserHlsDownload && (
                <p className="text-xs text-muted-foreground">
                    {dict.result.browserDownloadVideoHint}
                </p>
            )}
            {result.noteType === 'audio' && (
                <p className="text-xs text-muted-foreground">
                    {dict.result.pureMusicHint}
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
