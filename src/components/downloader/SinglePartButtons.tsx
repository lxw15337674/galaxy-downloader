import { useState } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';

import type { AudioExtractTask } from '@/components/audio-tool/types';
import { Button } from '@/components/ui/button';
import { useDictionary } from '@/i18n/client';
import type { UnifiedParseResult } from '@/lib/types';
import { downloadFile } from '@/lib/utils';

import { getResultMediaActions } from './result-card-visibility';

export function SinglePartButtons({
    result,
    onOpenExtractAudio,
}: {
    result: NonNullable<UnifiedParseResult['data']>;
    onOpenExtractAudio: (task: AudioExtractTask) => void;
}) {
    const dict = useDictionary();
    const [videoLoading, setVideoLoading] = useState(false);
    const [audioLoading, setAudioLoading] = useState(false);
    const videoDownloadUrl = result.downloadVideoUrl || result.originDownloadVideoUrl;
    const audioDownloadUrl = result.downloadAudioUrl || result.originDownloadAudioUrl || null;
    const { videoAction, audioAction } = getResultMediaActions({
        mediaActions: result.mediaActions,
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

    const handleDownload = (url: string, setLoading: (value: boolean) => void) => {
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
            mediaActions: result.mediaActions,
        });
    };
    const actionCount = Number(showVideoDownload) + Number(showAudioDownload);

    return (
        <>
            <div className={`grid gap-2 ${actionCount > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                {showVideoDownload && (
                    <Button
                        variant="outline"
                        className="h-8 flex items-center justify-center gap-2 text-xs"
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
                        className="h-8 flex items-center justify-center gap-2 text-xs"
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
