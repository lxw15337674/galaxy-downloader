import type { Dictionary } from '@/lib/i18n/types';

type PlatformSupportEntry = {
    name: string;
    summary: string;
    features?: string[];
};

export type PlatformSupportKey =
    | 'bilibili'
    | 'bilibiliTv'
    | 'douyin'
    | 'youtube'
    | 'telegram'
    | 'threads'
    | 'wechat'
    | 'niconico'
    | 'weibo'
    | 'xiaohongshu'
    | 'tiktok'
    | 'instagram'
    | 'x';

type PlatformSupportVisual = {
    src: string;
    darkSrc?: string;
    frameClassName: string;
    iconClassName?: string;
    badgeLabel?: string;
    badgeClassName?: string;
};

export type PlatformSupportItem = {
    key: PlatformSupportKey;
    name: string;
    features: string[];
    visual: PlatformSupportVisual;
};

const PLATFORM_SUPPORT_VISUALS: Record<PlatformSupportKey, PlatformSupportVisual> = {
    bilibili: {
        src: '/platform-icons/bilibili.svg',
        frameClassName: 'border-[#00A1D6]/20 bg-[#00A1D6]/10',
    },
    bilibiliTv: {
        src: '/platform-icons/bilibili.svg',
        frameClassName: 'border-[#00A1D6]/20 bg-[#00A1D6]/10',
        badgeLabel: 'TV',
        badgeClassName: 'bg-[#00A1D6] text-white',
    },
    douyin: {
        src: '/platform-icons/douyin.ico',
        frameClassName: 'border-zinc-900/10 bg-zinc-900/5 dark:border-zinc-700/80 dark:bg-zinc-900',
        iconClassName: 'rounded-[4px]',
    },
    youtube: {
        src: '/platform-icons/youtube.svg',
        frameClassName: 'border-[#FF0033]/20 bg-[#FF0033]/10',
    },
    telegram: {
        src: '/platform-icons/telegram.svg',
        frameClassName: 'border-[#229ED9]/20 bg-[#229ED9]/10',
    },
    threads: {
        src: '/platform-icons/threads.svg',
        darkSrc: '/platform-icons/threads-dark.svg',
        frameClassName: 'border-zinc-900/10 bg-zinc-900/5 dark:border-zinc-700/80 dark:bg-zinc-900',
    },
    wechat: {
        src: '/platform-icons/wechat.svg',
        frameClassName: 'border-[#07C160]/20 bg-[#07C160]/10',
    },
    niconico: {
        src: '/platform-icons/niconico.svg',
        darkSrc: '/platform-icons/niconico-dark.svg',
        frameClassName: 'border-zinc-900/10 bg-zinc-900/5 dark:border-zinc-700/80 dark:bg-zinc-900',
    },
    weibo: {
        src: '/platform-icons/weibo.svg',
        frameClassName: 'border-[#E6162D]/20 bg-[#E6162D]/10',
    },
    xiaohongshu: {
        src: '/platform-icons/xiaohongshu.svg',
        frameClassName: 'border-[#FF2442]/20 bg-[#FF2442]/10',
    },
    tiktok: {
        src: '/platform-icons/tiktok.svg',
        darkSrc: '/platform-icons/tiktok-dark.svg',
        frameClassName: 'border-zinc-900/10 bg-zinc-900/5 dark:border-zinc-700/80 dark:bg-zinc-900',
    },
    instagram: {
        src: '/platform-icons/instagram.svg',
        frameClassName: 'border-[#E4405F]/20 bg-[#E4405F]/10',
    },
    x: {
        src: '/platform-icons/x.svg',
        darkSrc: '/platform-icons/x-dark.svg',
        frameClassName: 'border-zinc-900/10 bg-zinc-900/5 dark:border-zinc-700/80 dark:bg-zinc-900',
    },
};

function buildPlatformSupportItem(
    key: PlatformSupportKey,
    entry: PlatformSupportEntry,
): PlatformSupportItem {
    return {
        key,
        name: entry.name,
        features: resolveFeatures(entry),
        visual: PLATFORM_SUPPORT_VISUALS[key],
    };
}

function resolveFeatures(entry: PlatformSupportEntry): string[] {
    if (entry.features && entry.features.length > 0) {
        return entry.features;
    }

    return entry.summary
        .split(/[、,，/&]/)
        .map((feature) => feature.trim())
        .filter(Boolean);
}

export function getPlatformSupportItems(dict: Pick<Dictionary, 'guide'>): PlatformSupportItem[] {
    const support = dict.guide.platformSupport;

    return [
        buildPlatformSupportItem('bilibili', support.bilibili),
        buildPlatformSupportItem('bilibiliTv', support.bilibiliTv),
        buildPlatformSupportItem('douyin', support.douyin),
        buildPlatformSupportItem('youtube', support.youtube),
        buildPlatformSupportItem('telegram', support.telegram),
        buildPlatformSupportItem('threads', support.threads),
        buildPlatformSupportItem('wechat', support.wechat),
        buildPlatformSupportItem('niconico', support.niconico),
        buildPlatformSupportItem('weibo', support.weibo),
        buildPlatformSupportItem('xiaohongshu', support.xiaohongshu),
        buildPlatformSupportItem('tiktok', support.tiktok),
        buildPlatformSupportItem('instagram', support.instagram),
        buildPlatformSupportItem('x', support.x),
    ];
}
