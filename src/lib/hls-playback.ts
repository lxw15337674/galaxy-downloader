export const HLS_PLAYLIST_ACCEPT =
    'application/vnd.apple.mpegurl, application/x-mpegURL, text/plain;q=0.9, */*;q=0.8'

const HLS_PLAYLIST_CONTENT_TYPES = [
    'application/vnd.apple.mpegurl',
    'application/x-mpegurl',
]

const HLS_URI_ATTRIBUTE_TAGS = [
    '#EXT-X-I-FRAME-STREAM-INF:',
    '#EXT-X-KEY:',
    '#EXT-X-MAP:',
    '#EXT-X-MEDIA:',
    '#EXT-X-PRELOAD-HINT:',
    '#EXT-X-RENDITION-REPORT:',
    '#EXT-X-SESSION-DATA:',
    '#EXT-X-SESSION-KEY:',
]

function hasHttpProtocol(url: URL): boolean {
    return url.protocol === 'http:' || url.protocol === 'https:'
}

export function isHlsPlaylistUrl(url: string | null | undefined): url is string {
    return typeof url === 'string' && /\.m3u8?(?:[?#]|$)/i.test(url.trim())
}

export function isHlsPlaylistResponse(
    targetUrl: string,
    contentType: string | null,
    bodyText?: string
): boolean {
    const normalizedContentType = (contentType || '').toLowerCase()
    if (HLS_PLAYLIST_CONTENT_TYPES.some((value) => normalizedContentType.includes(value))) {
        return true
    }

    if (isHlsPlaylistUrl(targetUrl)) {
        return true
    }

    return typeof bodyText === 'string' && bodyText.trimStart().startsWith('#EXTM3U')
}

export function buildHlsPlayProxyUrl(
    target: string,
    referer: string,
    accept?: string
): string {
    const params = new URLSearchParams({ target, referer })
    if (accept) {
        params.set('accept', accept)
    }

    return `/api/hls-play-proxy?${params.toString()}`
}

function resolveAbsoluteUrl(candidate: string, baseUrl: string): string {
    const resolved = new URL(candidate, baseUrl)
    if (!hasHttpProtocol(resolved)) {
        throw new Error(`Unsupported HLS target protocol: ${resolved.protocol}`)
    }

    return resolved.toString()
}

function quoteLike(value: string, original: string): string {
    return original.startsWith('"') && original.endsWith('"')
        ? `"${value}"`
        : value
}

function rewriteUriAttribute(line: string, baseUrl: string, referer: string): string {
    return line.replace(/URI=("(?:[^"\\]|\\.)*"|[^,]+)/i, (_match, rawValue: string) => {
        const unquoted = rawValue.startsWith('"') && rawValue.endsWith('"')
            ? rawValue.slice(1, -1)
            : rawValue
        const absoluteUrl = resolveAbsoluteUrl(unquoted, baseUrl)
        const accept = isHlsPlaylistUrl(absoluteUrl) ? HLS_PLAYLIST_ACCEPT : undefined
        return `URI=${quoteLike(buildHlsPlayProxyUrl(absoluteUrl, referer, accept), rawValue)}`
    })
}

export function rewriteHlsPlaylist(
    playlistText: string,
    playlistUrl: string,
    referer: string
): string {
    return playlistText
        .split(/\r?\n/)
        .map((rawLine) => {
            const line = rawLine.trim()
            if (!line) {
                return rawLine
            }

            if (line.startsWith('#')) {
                return HLS_URI_ATTRIBUTE_TAGS.some((tag) => line.startsWith(tag))
                    ? rewriteUriAttribute(rawLine, playlistUrl, referer)
                    : rawLine
            }

            const absoluteUrl = resolveAbsoluteUrl(line, playlistUrl)
            const accept = isHlsPlaylistUrl(absoluteUrl) ? HLS_PLAYLIST_ACCEPT : undefined
            return buildHlsPlayProxyUrl(absoluteUrl, referer, accept)
        })
        .join('\n')
}
