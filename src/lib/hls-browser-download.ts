import { parse as parseHls } from 'hls-parser'

export interface VariantCandidate {
    bandwidth: number
    url: string
}

export interface ByteRange {
    start: number
    end: number
}

export interface HlsSegment {
    url: string
    keyUrl?: string
    iv?: Uint8Array
    byterange?: ByteRange
}

export interface ParsedHlsMediaPlaylist {
    mapUrl: string | null
    mapByterange?: ByteRange
    segments: HlsSegment[]
    encrypted: boolean
}

interface HlsPlaylistBase {
    isMasterPlaylist: boolean
}

interface HlsVariant {
    uri: string
    bandwidth?: number
}

interface HlsMasterPlaylist extends HlsPlaylistBase {
    isMasterPlaylist: true
    variants?: HlsVariant[]
}

interface HlsKey {
    method?: string
    uri?: string
    iv?: ArrayBuffer
}

interface HlsMap {
    uri?: string
    byterange?: {
        length: number
        offset?: number
    }
}

interface HlsPlaylistSegment {
    uri: string
    mediaSequenceNumber?: number
    byterange?: {
        length: number
        offset?: number
    }
    key?: HlsKey
    map?: HlsMap
}

interface HlsMediaPlaylist extends HlsPlaylistBase {
    isMasterPlaylist: false
    segments?: HlsPlaylistSegment[]
}

export function buildSequenceIv(sequence: number): Uint8Array {
    const iv = new Uint8Array(16)
    const view = new DataView(iv.buffer)
    view.setUint32(12, sequence >>> 0)
    return iv
}

function toByteRange(value?: { length: number, offset?: number }): ByteRange | undefined {
    if (!value || !Number.isFinite(value.length) || value.length <= 0) {
        return undefined
    }

    const start = Number.isFinite(value.offset) ? Number(value.offset) : 0
    return {
        start,
        end: start + Number(value.length) - 1,
    }
}

function normalizeIv(iv?: ArrayBuffer): Uint8Array | undefined {
    return iv ? new Uint8Array(iv) : undefined
}

export function parsePlaylist(value: string): HlsMasterPlaylist | HlsMediaPlaylist {
    return parseHls(value) as HlsMasterPlaylist | HlsMediaPlaylist
}

export function pickBestVariant(playlistText: string, playlistUrl: string): VariantCandidate | null {
    const parsed = parsePlaylist(playlistText)
    if (!parsed.isMasterPlaylist) {
        return null
    }

    const variants = (parsed.variants || [])
        .filter((variant) => typeof variant.uri === 'string' && variant.uri.length > 0)
        .map((variant) => ({
            bandwidth: Number(variant.bandwidth || 0),
            url: new URL(variant.uri, playlistUrl).toString(),
        }))

    if (variants.length === 0) {
        return null
    }

    return variants.sort((left, right) => right.bandwidth - left.bandwidth)[0] || null
}

export function parseHlsMediaPlaylist(
    playlistText: string,
    playlistUrl: string
): ParsedHlsMediaPlaylist {
    const parsed = parsePlaylist(playlistText)
    if (parsed.isMasterPlaylist) {
        throw new Error('Expected an HLS media playlist but received a master playlist')
    }

    const segments = (parsed.segments || [])
        .filter((segment) => typeof segment.uri === 'string' && segment.uri.length > 0)
        .map((segment) => {
            const method = segment.key?.method
            if (method && method !== 'AES-128' && method !== 'NONE') {
                throw new Error(`Unsupported HLS key method: ${method}`)
            }

            return {
                url: new URL(segment.uri, playlistUrl).toString(),
                keyUrl: method === 'AES-128' && segment.key?.uri
                    ? new URL(segment.key.uri, playlistUrl).toString()
                    : undefined,
                iv: method === 'AES-128'
                    ? (normalizeIv(segment.key?.iv) || buildSequenceIv(segment.mediaSequenceNumber || 0))
                    : undefined,
                byterange: toByteRange(segment.byterange),
            } satisfies HlsSegment
        })

    if (segments.length === 0) {
        throw new Error('The resolved playlist does not contain downloadable segments')
    }

    const firstMap = parsed.segments?.find((segment) => segment.map?.uri)?.map
    return {
        mapUrl: firstMap?.uri ? new URL(firstMap.uri, playlistUrl).toString() : null,
        mapByterange: toByteRange(firstMap?.byterange),
        segments,
        encrypted: segments.some((segment) => Boolean(segment.keyUrl)),
    }
}

export function inferHlsOutputExtension(
    _mapUrl: string | null,
    _segments: Array<Pick<HlsSegment, 'url'>>
): 'mp4' {
    return 'mp4'
}

export function sliceHlsSegments(segments: HlsSegment[], limit?: number): HlsSegment[] {
    if (!limit || limit <= 0 || limit >= segments.length) {
        return [...segments]
    }

    return segments.slice(0, limit)
}

export function buildRangeHeader(byterange?: ByteRange): string | undefined {
    if (!byterange) {
        return undefined
    }

    return `bytes=${byterange.start}-${byterange.end}`
}

function toCryptoBytes(value: Uint8Array): Uint8Array<ArrayBuffer> {
    return new Uint8Array(value)
}

export async function importAes128Key(rawKey: Uint8Array): Promise<CryptoKey> {
    return crypto.subtle.importKey('raw', toCryptoBytes(rawKey), { name: 'AES-CBC' }, false, ['decrypt'])
}

export async function decryptAes128Cbc(
    encrypted: Uint8Array,
    cryptoKey: CryptoKey,
    iv: Uint8Array
): Promise<Uint8Array> {
    const decrypted = await crypto.subtle.decrypt(
        {
            name: 'AES-CBC',
            iv: toCryptoBytes(iv),
        },
        cryptoKey,
        toCryptoBytes(encrypted)
    )

    return new Uint8Array(decrypted)
}
