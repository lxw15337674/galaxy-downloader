import { downloadFile } from '@/lib/utils';

import { shouldUseFrontendImageProxy } from './result-card-visibility';

export type ImageLoadState = {
    loading: boolean;
    error: boolean;
    src: string;
    baseSrc: string;
    usedFallback: boolean;
};

type ResolvedImageFetchResult = {
    blob: Blob;
    sourceUrl: string;
};

export function replaceTemplate(template: string, token: string, value: string): string {
    return template.replace(token, value);
}

export function resolveCoverSrc(coverUrl: string): string {
    if (shouldUseFrontendImageProxy(coverUrl)) {
        return `/api/proxy-image?url=${encodeURIComponent(coverUrl)}`;
    }
    return coverUrl;
}

export function resolveImageSrc(imageUrl: string): string {
    if (shouldUseFrontendImageProxy(imageUrl)) {
        return `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
    }
    return imageUrl;
}

export function triggerBlobDownload(blob: Blob, filename: string) {
    const objectUrl = URL.createObjectURL(blob);
    downloadFile(objectUrl, filename);

    // Revoke after the click has been dispatched so browsers can resolve the blob URL.
    window.setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
    }, 1000);
}

function dedupeUrls(urls: string[]): string[] {
    return Array.from(new Set(urls.filter((value) => value.length > 0)));
}

export function resolveImageDownloadExtension(sourceUrl: string, contentType: string | null | undefined): string {
    const normalizedContentType = contentType?.split(';')[0]?.trim().toLowerCase() ?? '';
    const contentTypeMap: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
        'image/svg+xml': 'svg',
        'image/avif': 'avif',
    };

    const mappedExtension = contentTypeMap[normalizedContentType];
    if (mappedExtension) {
        return mappedExtension;
    }

    try {
        const pathname = new URL(sourceUrl).pathname;
        const match = pathname.match(/\.([a-z0-9]+)$/i);
        if (match?.[1]) {
            return match[1].toLowerCase();
        }
    } catch {
        // Ignore invalid urls and fall back to jpg.
    }

    return 'jpg';
}

export function createInitialImageStates(images: string[]): ImageLoadState[] {
    return images.map((imageUrl) => {
        const baseSrc = resolveImageSrc(imageUrl);
        return {
            loading: true,
            error: false,
            src: baseSrc,
            baseSrc,
            usedFallback: false,
        };
    });
}

export async function fetchImageBlobCandidates(candidates: string[]): Promise<ResolvedImageFetchResult> {
    let lastError: unknown = null;

    for (const candidate of dedupeUrls(candidates)) {
        try {
            const response = await fetch(candidate);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return {
                blob: await response.blob(),
                sourceUrl: candidate,
            };
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError ?? new Error('Failed to fetch image');
}
