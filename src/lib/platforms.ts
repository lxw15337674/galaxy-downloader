import type { Dictionary } from '@/lib/i18n/types'

export type CanonicalPlatform =
    | 'bilibili'
    | 'bilibili_tv'
    | 'dailymotion'
    | 'douyin'
    | 'newgrounds'
    | 'okru'
    | 'pinterest'
    | 'reddit'
    | 'soundcloud'
    | 'streamable'
    | 'twitch'
    | 'tumblr'
    | 'youtube'
    | 'telegram'
    | 'threads'
    | 'vk'
    | 'vimeo'
    | 'wechat'
    | 'niconico'
    | 'weibo'
    | 'xiaohongshu'
    | 'tiktok'
    | 'instagram'
    | 'x'
    | 'generic'
    | 'unknown'

const PLATFORM_ALIASES: Record<string, CanonicalPlatform> = {
    bili: 'bilibili',
    bilibili: 'bilibili',
    bilibili_tv: 'bilibili_tv',
    dailymotion: 'dailymotion',
    douyin: 'douyin',
    newgrounds: 'newgrounds',
    okru: 'okru',
    pinterest: 'pinterest',
    reddit: 'reddit',
    soundcloud: 'soundcloud',
    streamable: 'streamable',
    twitch: 'twitch',
    tumblr: 'tumblr',
    youtube: 'youtube',
    telegram: 'telegram',
    threads: 'threads',
    vk: 'vk',
    vimeo: 'vimeo',
    wechat: 'wechat',
    niconico: 'niconico',
    nico: 'niconico',
    weibo: 'weibo',
    xiaohongshu: 'xiaohongshu',
    tiktok: 'tiktok',
    instagram: 'instagram',
    ins: 'instagram',
    x: 'x',
    twitter: 'x',
    generic: 'generic',
    unknown: 'unknown',
}

const AUDIO_EXTRACTION_PLATFORMS = new Set<CanonicalPlatform>([
    'douyin',
    'threads',
    'weibo',
    'xiaohongshu',
    'tiktok',
    'instagram',
    'x',
])

export function normalizePlatform(platform?: string | null): CanonicalPlatform {
    if (!platform) {
        return 'unknown'
    }

    return PLATFORM_ALIASES[platform.trim().toLowerCase()] ?? 'unknown'
}

export function getPlatformLabel(
    platform: string | null | undefined,
    dict: Pick<Dictionary, 'history'>
): string {
    switch (normalizePlatform(platform)) {
        case 'bilibili':
            return dict.history.platforms.bilibili
        case 'bilibili_tv':
            return dict.history.platforms.bilibiliTv
        case 'dailymotion':
            return dict.history.platforms.dailymotion
        case 'douyin':
            return dict.history.platforms.douyin
        case 'newgrounds':
            return dict.history.platforms.newgrounds
        case 'okru':
            return dict.history.platforms.okru
        case 'pinterest':
            return dict.history.platforms.pinterest
        case 'reddit':
            return dict.history.platforms.reddit
        case 'soundcloud':
            return dict.history.platforms.soundcloud
        case 'streamable':
            return dict.history.platforms.streamable
        case 'twitch':
            return dict.history.platforms.twitch
        case 'tumblr':
            return dict.history.platforms.tumblr
        case 'youtube':
            return dict.history.platforms.youtube
        case 'telegram':
            return dict.history.platforms.telegram
        case 'threads':
            return dict.history.platforms.threads
        case 'vk':
            return dict.history.platforms.vk
        case 'vimeo':
            return dict.history.platforms.vimeo
        case 'wechat':
            return dict.history.platforms.wechat
        case 'niconico':
            return dict.history.platforms.niconico
        case 'weibo':
            return dict.history.platforms.weibo
        case 'xiaohongshu':
            return dict.history.platforms.xiaohongshu
        case 'tiktok':
            return dict.history.platforms.tiktok
        case 'instagram':
            return dict.history.platforms.instagram
        case 'x':
            return dict.history.platforms.x
        case 'generic':
            return dict.history.platforms.generic
        default:
            return dict.history.platforms.unknown
    }
}

export function getPlatformBadge(
    platform: string | null | undefined,
    dict: Pick<Dictionary, 'history'>
) {
    return {
        text: getPlatformLabel(platform, dict),
    }
}

export function supportsAudioExtraction(platform: string | null | undefined): boolean {
    return AUDIO_EXTRACTION_PLATFORMS.has(normalizePlatform(platform))
}
