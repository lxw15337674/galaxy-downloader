'use client';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, Music, AlertCircle, CheckCircle } from 'lucide-react';
import { useFFmpeg, FFmpegStatus } from '@/hooks/use-ffmpeg';
import type { Dictionary } from '@/lib/i18n/types';
import { formatBytes } from '@/lib/utils';

interface ExtractAudioButtonProps {
  videoUrl: string;
  title: string;
  dict: Dictionary;
}

export function ExtractAudioButton({ videoUrl, title, dict }: ExtractAudioButtonProps) {
  const { status, progress, progressInfo, error, extractAudio, reset } = useFFmpeg();

  const handleClick = () => {
    if (status === 'error') {
      reset();
      return;
    }
    if (status === 'idle') {
      extractAudio(videoUrl, title);
    }
  };

  const getButtonContent = () => {
    switch (status) {
      case 'loading':
        return (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {dict.extractAudio.loading}
          </>
        );
      case 'downloading':
        // 简洁版：显示百分比和大小
        if (progressInfo?.loaded && progressInfo?.total && dict.extractAudio.downloadingWithSize) {
          return dict.extractAudio.downloadingWithSize
            .replace('{progress}', String(Math.floor(progress)))
            .replace('{loaded}', formatBytes(progressInfo.loaded))
            .replace('{total}', formatBytes(progressInfo.total));
        }
        return dict.extractAudio.downloading.replace('{progress}', String(Math.floor(progress)));
      case 'converting':
        return dict.extractAudio.converting.replace('{progress}', String(Math.floor(progress)));
      case 'completed':
        return (
          <>
            <CheckCircle className="h-4 w-4" />
            {dict.extractAudio.completed}
          </>
        );
      case 'error':
        return (
          <>
            <AlertCircle className="h-4 w-4" />
            {dict.extractAudio.retry}
          </>
        );
      default:
        return dict.extractAudio.button;
    }
  };

  const isProcessing = (['loading', 'downloading', 'converting'] as FFmpegStatus[]).includes(status);
  const showProgress = (['downloading', 'converting'] as FFmpegStatus[]).includes(status);

  return (
    <div className="space-y-2">
      <Button
        variant={status === 'error' ? 'destructive' : 'outline'}
        className="w-full flex items-center justify-center gap-2"
        onClick={handleClick}
        disabled={isProcessing}
      >
        {getButtonContent()}
      </Button>

      {showProgress && (
        <Progress value={Math.floor(progress)} className="h-2" />
      )}

      {error && (
        <p className="text-xs text-destructive text-center">{error}</p>
      )}
    </div>
  );
}
