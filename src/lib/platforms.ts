import type { Dictionary } from '@/lib/i18n/types'

export type CanonicalPlatform =
    | 'bilibili'
    | 'bilibili_tv'
    | 'douyin'
    | 'telegram'
    | 'wechat'
    | 'niconico'
    | 'xiaohongshu'
    | 'tiktok'
    | 'instagram'
    | 'x'
    | 'unknown'

const PLATFORM_ALIASES: Record<string, CanonicalPlatform> = {
    bili: 'bilibili',
    bilibili: 'bilibili',
    bilibili_tv: 'bilibili_tv',
    douyin: 'douyin',
    telegram: 'telegram',
    wechat: 'wechat',
    niconico: 'niconico',
    nico: 'niconico',
    xiaohongshu: 'xiaohongshu',
    tiktok: 'tiktok',
    instagram: 'instagram',
    ins: 'instagram',
    x: 'x',
    twitter: 'x',
    unknown: 'unknown',
}

const AUDIO_EXTRACTION_PLATFORMS = new Set<CanonicalPlatform>([
    'douyin',
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
        case 'douyin':
            return dict.history.platforms.douyin
        case 'telegram':
            return dict.history.platforms.telegram
        case 'wechat':
            return dict.history.platforms.wechat
        case 'niconico':
            return dict.history.platforms.niconico
        case 'xiaohongshu':
            return dict.history.platforms.xiaohongshu
        case 'tiktok':
            return dict.history.platforms.tiktok
        case 'instagram':
            return dict.history.platforms.instagram
        case 'x':
            return dict.history.platforms.x
        default:
            return dict.history.platforms.unknown
    }
}

export function getPlatformBadge(
    platform: string | null | undefined,
    dict: Pick<Dictionary, 'history'>
) {
    switch (normalizePlatform(platform)) {
        case 'bilibili':
            return {
                text: dict.history.platforms.bilibili,
                className: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
            }
        case 'bilibili_tv':
            return {
                text: dict.history.platforms.bilibiliTv,
                className: 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300',
            }
        case 'douyin':
            return {
                text: dict.history.platforms.douyin,
                className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
            }
        case 'telegram':
            return {
                text: dict.history.platforms.telegram,
                className: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
            }
        case 'wechat':
            return {
                text: dict.history.platforms.wechat,
                className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
            }
        case 'niconico':
            return {
                text: dict.history.platforms.niconico,
                className: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
            }
        case 'xiaohongshu':
            return {
                text: dict.history.platforms.xiaohongshu,
                className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
            }
        case 'tiktok':
            return {
                text: dict.history.platforms.tiktok,
                className: 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300',
            }
        case 'instagram':
            return {
                text: dict.history.platforms.instagram,
                className: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900 dark:text-fuchsia-300',
            }
        case 'x':
            return {
                text: dict.history.platforms.x,
                className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
            }
        default:
            return {
                text: dict.history.platforms.unknown,
                className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
            }
    }
}

export function supportsAudioExtraction(platform: string | null | undefined): boolean {
    return AUDIO_EXTRACTION_PLATFORMS.has(normalizePlatform(platform))
}
