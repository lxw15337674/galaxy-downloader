import { NextRequest, NextResponse } from 'next/server';
import { setXRobotsTag } from '@/lib/seo';

const ALLOWED_IMAGE_HOSTS = [
    '*',
];

const DEFAULT_ACCEPT =
    'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8';

const NESTED_IMAGE_PROXY_HOSTS = new Set([
    'downloader-api.bhwa233.com',
]);

function isAllowedImageHost(hostname: string): boolean {
    const normalized = hostname.toLowerCase();
    if (ALLOWED_IMAGE_HOSTS.includes('*')) {
        return true;
    }
    return ALLOWED_IMAGE_HOSTS.some(
        (host) => normalized === host || normalized.endsWith(`.${host}`)
    );
}

function getReferer(hostname: string): string | undefined {
    const normalized = hostname.toLowerCase();
    if (normalized.endsWith('douyinpic.com')) {
        return 'https://www.douyin.com/';
    }
    if (normalized.endsWith('xhscdn.com') || normalized.endsWith('xiaohongshu.com')) {
        return 'https://www.xiaohongshu.com/';
    }
    if (
        normalized.endsWith('tiktokcdn.com') ||
        normalized.endsWith('tiktokcdn-us.com') ||
        normalized.endsWith('tiktok.com')
    ) {
        return 'https://www.tiktok.com/';
    }
    if (
        normalized.endsWith('instagram.com') ||
        normalized.endsWith('cdninstagram.com') ||
        normalized.endsWith('fbcdn.net')
    ) {
        return 'https://www.instagram.com/';
    }
    if (normalized.endsWith('nimg.jp')) {
        return 'https://www.nicovideo.jp/';
    }
    if (normalized.endsWith('mmbiz.qpic.cn')) {
        return 'https://mp.weixin.qq.com/';
    }
    if (
        normalized.endsWith('twimg.com') ||
        normalized.endsWith('x.com') ||
        normalized.endsWith('twitter.com')
    ) {
        return 'https://x.com/';
    }
    return undefined;
}

function isHttpProtocol(protocol: string): boolean {
    return protocol === 'http:' || protocol === 'https:';
}

function normalizeUpstreamUrl(url: URL): URL {
    const normalizedUrl = new URL(url.toString());
    if (normalizedUrl.protocol === 'http:') {
        normalizedUrl.protocol = 'https:';
    }
    return normalizedUrl;
}

function tryDecodeURIComponent(value: string): string {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

function unwrapNestedImageProxyUrl(targetUrl: URL): URL {
    const host = targetUrl.hostname.toLowerCase();
    const isKnownNestedProxyHost = NESTED_IMAGE_PROXY_HOSTS.has(host);
    const isImageProxyPath = targetUrl.pathname === '/api/image-proxy';
    if (!isKnownNestedProxyHost || !isImageProxyPath) {
        return targetUrl;
    }

    const nestedUrlParam = targetUrl.searchParams.get('url');
    if (!nestedUrlParam) {
        return targetUrl;
    }

    // Some upstream responses double-encode the nested url query parameter.
    let decoded = nestedUrlParam;
    for (let i = 0; i < 2; i += 1) {
        const nextDecoded = tryDecodeURIComponent(decoded);
        if (nextDecoded === decoded) {
            break;
        }
        decoded = nextDecoded;
    }

    try {
        const nestedUrl = new URL(decoded);
        if (!isHttpProtocol(nestedUrl.protocol)) {
            return targetUrl;
        }
        return nestedUrl;
    } catch {
        return targetUrl;
    }
}

export async function GET(request: NextRequest) {
    const rawUrl = request.nextUrl.searchParams.get('url');
    if (!rawUrl) {
        const response = NextResponse.json({ error: 'Missing "url" query parameter' }, { status: 400 });
        setXRobotsTag(response.headers, ['noindex', 'nofollow', 'noarchive', 'noimageindex']);
        return response;
    }

    let targetUrl: URL;
    try {
        targetUrl = new URL(rawUrl);
    } catch {
        const response = NextResponse.json({ error: 'Invalid image url' }, { status: 400 });
        setXRobotsTag(response.headers, ['noindex', 'nofollow', 'noarchive', 'noimageindex']);
        return response;
    }

    targetUrl = unwrapNestedImageProxyUrl(targetUrl);

    if (!isHttpProtocol(targetUrl.protocol)) {
        const response = NextResponse.json({ error: 'Only http(s) protocol is allowed' }, { status: 400 });
        setXRobotsTag(response.headers, ['noindex', 'nofollow', 'noarchive', 'noimageindex']);
        return response;
    }

    if (!isAllowedImageHost(targetUrl.hostname)) {
        const response = NextResponse.json({ error: 'Host is not allowed' }, { status: 403 });
        setXRobotsTag(response.headers, ['noindex', 'nofollow', 'noarchive', 'noimageindex']);
        return response;
    }

    const upstreamUrl = normalizeUpstreamUrl(targetUrl);

    const upstreamHeaders = new Headers();
    upstreamHeaders.set('Accept', DEFAULT_ACCEPT);
    upstreamHeaders.set(
        'User-Agent',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
    );

    const referer = getReferer(targetUrl.hostname);
    if (referer) {
        upstreamHeaders.set('Referer', referer);
    }

    let upstreamResponse: Response;
    try {
        upstreamResponse = await fetch(upstreamUrl.toString(), {
            method: 'GET',
            headers: upstreamHeaders,
            redirect: 'follow',
        });
    } catch (error) {
        console.error('Failed to fetch upstream image', {
            url: upstreamUrl.toString(),
            error: error instanceof Error ? error.message : String(error),
        });
        const response = NextResponse.json({ error: 'Failed to fetch image from upstream' }, { status: 502 });
        setXRobotsTag(response.headers, ['noindex', 'nofollow', 'noarchive', 'noimageindex']);
        return response;
    }

    if (!upstreamResponse.ok || !upstreamResponse.body) {
        const response = NextResponse.json(
            { error: `Upstream image request failed with status ${upstreamResponse.status}` },
            { status: 502 }
        );
        setXRobotsTag(response.headers, ['noindex', 'nofollow', 'noarchive', 'noimageindex']);
        return response;
    }

    const contentType = upstreamResponse.headers.get('content-type') || '';
    if (!contentType.toLowerCase().startsWith('image/')) {
        const response = NextResponse.json({ error: 'Upstream response is not an image' }, { status: 415 });
        setXRobotsTag(response.headers, ['noindex', 'nofollow', 'noarchive', 'noimageindex']);
        return response;
    }

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400');
    headers.set('Cross-Origin-Resource-Policy', 'same-origin');
    setXRobotsTag(headers, ['noindex', 'nofollow', 'noarchive', 'noimageindex']);

    const contentLength = upstreamResponse.headers.get('content-length');
    if (contentLength) {
        headers.set('Content-Length', contentLength);
    }

    return new NextResponse(upstreamResponse.body, {
        status: 200,
        headers,
    });
}
