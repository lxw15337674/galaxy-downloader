import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpegInstance: FFmpeg | null = null;
let loadPromise: Promise<FFmpeg> | null = null;

// Keep this aligned with the installed @ffmpeg/ffmpeg package's expected core build.
const FFMPEG_CORE_VERSION = '0.12.9';
const FFMPEG_CORE_BASE_URLS = [
  `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${FFMPEG_CORE_VERSION}/dist/esm`,
  `https://unpkg.com/@ffmpeg/core@${FFMPEG_CORE_VERSION}/dist/esm`,
];

export async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance?.loaded) {
    return ffmpegInstance;
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    const ffmpeg = new FFmpeg();

    ffmpeg.on('log', ({ message }) => {
      console.log('[FFmpeg]', message);
    });

    try {
      let lastError: unknown = null;

      // The FFmpeg wrapper uses a module worker and loads ffmpeg-core with import().
      // That means the core asset must be the ESM build, not the UMD one.
      for (const baseURL of FFMPEG_CORE_BASE_URLS) {
        try {
          const coreURL = await toBlobURL(
            `${baseURL}/ffmpeg-core.js`,
            'text/javascript'
          );
          const wasmURL = await toBlobURL(
            `${baseURL}/ffmpeg-core.wasm`,
            'application/wasm'
          );

          await ffmpeg.load({
            coreURL,
            wasmURL,
          });
          console.log('[FFmpeg] Loaded single-thread core from:', baseURL);
          lastError = null;
          break;
        } catch (candidateError) {
          lastError = candidateError;
          console.warn('[FFmpeg] Failed to load core from:', baseURL, candidateError);
        }
      }

      if (lastError) {
        throw lastError;
      }
    } catch (err) {
      loadPromise = null;
      throw new Error(`Failed to load FFmpeg: ${err instanceof Error ? err.message : String(err)}`);
    }

    ffmpegInstance = ffmpeg;
    return ffmpeg;
  })();

  return loadPromise;
}

export type ExtractStage = 'downloading' | 'converting';

export interface ProgressInfo {
  loaded?: number;
  total?: number;
}

export interface ExtractAudioOptions {
  videoUrl: string;
  onProgress?: (progress: number, stage: ExtractStage, info?: ProgressInfo) => void;
}

async function downloadVideoData(
  videoUrl: string,
  onProgress?: (progress: number, stage: ExtractStage, info?: ProgressInfo) => void
): Promise<Uint8Array> {
  const response = await fetch(videoUrl, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const total = Number(response.headers.get('content-length') || '0');

  if (!response.body) {
    const fallbackData = new Uint8Array(await response.arrayBuffer());
    onProgress?.(100, 'downloading', { loaded: fallbackData.byteLength, total });
    return fallbackData;
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;

    chunks.push(value);
    loaded += value.byteLength;

    const percentCompleted = total > 0 ? Math.round((loaded * 100) / total) : 0;
    onProgress?.(percentCompleted, 'downloading', {
      loaded,
      total,
    });
  }

  const combined = new Uint8Array(loaded);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }

  onProgress?.(100, 'downloading', { loaded, total });
  return combined;
}

export async function extractAudioFromVideo({
  videoUrl,
  onProgress,
}: ExtractAudioOptions): Promise<Blob> {
  console.log('[FFmpeg] Starting audio extraction from:', videoUrl);

  const ffmpeg = await getFFmpeg();
  console.log('[FFmpeg] FFmpeg loaded successfully');

  // Download video file with progress tracking
  onProgress?.(0, 'downloading');
  console.log('[FFmpeg] Downloading video...');

  let videoData: Uint8Array;
  try {
    videoData = await downloadVideoData(videoUrl, onProgress);
    console.log('[FFmpeg] Video downloaded, size:', videoData.byteLength);
  } catch (err) {
    throw new Error(`Failed to download video: ${err instanceof Error ? err.message : String(err)}`);
  }

  onProgress?.(100, 'downloading');

  // Write to virtual file system
  await ffmpeg.writeFile('input.mp4', videoData);
  console.log('[FFmpeg] Video written to virtual filesystem');

  // Set conversion progress listener
  const handleProgress = ({ progress }: { progress: number }) => {
    onProgress?.(Math.round(progress * 100), 'converting');
  };
  ffmpeg.on('progress', handleProgress);

  try {
    // Execute conversion: extract audio to MP3
    console.log('[FFmpeg] Starting conversion...');
    await ffmpeg.exec([
      '-i', 'input.mp4',
      '-vn',
      '-acodec', 'libmp3lame',
      '-q:a', '2',
      'output.mp3'
    ]);
    console.log('[FFmpeg] Conversion completed');

    // Read output file
    const outputData = await ffmpeg.readFile('output.mp3');

    // Create Blob (outputData is Uint8Array or string)
    if (typeof outputData === 'string') {
      throw new Error('Unexpected string output from ffmpeg');
    }
    // Copy to a new ArrayBuffer to avoid SharedArrayBuffer issues
    const buffer = new ArrayBuffer(outputData.byteLength);
    new Uint8Array(buffer).set(outputData);
    console.log('[FFmpeg] Audio blob created, size:', buffer.byteLength);
    return new Blob([buffer], { type: 'audio/mpeg' });
  } finally {
    ffmpeg.off('progress', handleProgress);
    await ffmpeg.deleteFile('input.mp4').catch(() => undefined);
    await ffmpeg.deleteFile('output.mp3').catch(() => undefined);
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
