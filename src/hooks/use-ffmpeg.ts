'use client';

import { useState, useCallback } from 'react';
import type { ExtractStage, ProgressInfo } from '@/lib/ffmpeg';
import { sanitizeFilename } from '@/lib/utils';

export type FFmpegStatus = 'idle' | 'loading' | 'downloading' | 'converting' | 'completed' | 'error';

export interface UseFFmpegReturn {
  status: FFmpegStatus;
  progress: number;
  progressInfo: ProgressInfo | null;
  error: string | null;
  extractAudio: (videoUrl: string, title: string) => Promise<void>;
  reset: () => void;
}

export function useFFmpeg(): UseFFmpegReturn {
  const [status, setStatus] = useState<FFmpegStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [progressInfo, setProgressInfo] = useState<ProgressInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const extractAudio = useCallback(async (videoUrl: string, title: string) => {
    try {
      setStatus('loading');
      setProgress(0);
      setProgressInfo(null);
      setError(null);

      const { extractAudioFromVideo, downloadBlob } = await import('@/lib/ffmpeg');

      const audioBlob = await extractAudioFromVideo({
        videoUrl,
        onProgress: (prog: number, stage: ExtractStage, info?: ProgressInfo) => {
          setStatus(stage);
          setProgress(prog);
          if (info) {
            setProgressInfo(info);
          }
        },
      });

      // Trigger download
      downloadBlob(audioBlob, `${sanitizeFilename(title)}.mp3`);

      setStatus('completed');

      // Reset status after 2 seconds
      setTimeout(() => {
        setStatus('idle');
        setProgress(0);
        setProgressInfo(null);
      }, 2000);

    } catch (err) {
      console.error('Extract audio error:', err);
      setStatus('error');
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage || 'Unknown error');
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setProgress(0);
    setProgressInfo(null);
    setError(null);
  }, []);

  return { status, progress, progressInfo, error, extractAudio, reset };
}
