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
    | 'x'
    | 'vimeo'
    | 'dailymotion'
    | 'streamable'
    | 'reddit'
    | 'newgrounds'
    | 'tumblr'
    | 'pinterest'
    | 'vk'
    | 'okru'
    | 'twitch'
    | 'soundcloud'
    | 'hls';

type PlatformSupportVisual = {
    src?: string;
    darkSrc?: string;
    fallbackLabel?: string;
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

type PlatformSupportDictionary = {
    guide: {
        platformSupport: Omit<Dictionary['guide']['platformSupport'], 'title'>;
    };
};

const HIDDEN_PLATFORM_SUPPORT_KEYS = new Set<PlatformSupportKey>(['youtube', 'vimeo', 'dailymotion']);

const UNIFIED_FRAME_CLASS_NAME = 'border-slate-200 bg-slate-100/70 dark:border-slate-300/40 dark:bg-slate-800/45';

const PLATFORM_SUPPORT_VISUALS: Record<PlatformSupportKey, PlatformSupportVisual> = {
    bilibili: {
        src: '/platform-icons/bilibili.svg',
        frameClassName: UNIFIED_FRAME_CLASS_NAME,
    },
    bilibiliTv: {
        src: '/platform-icons/bilibili.svg',
        frameClassName: UNIFIED_FRAME_CLASS_NAME,
        badgeLabel: 'TV',
        badgeClassName: 'bg-primary text-primary-foreground',
    },
    douyin: {
        src: '/platform-icons/douyin.ico',
        frameClassName: UNIFIED_FRAME_CLASS_NAME,
        iconClassName: 'rounded-[4px]',
    },
    youtube: {
        src: '/platform-icons/youtube.svg',
        frameClassName: UNIFIED_FRAME_CLASS_NAME,
    },
    telegram: {
        src: '/platform-icons/telegram.svg',
        frameClassName: UNIFIED_FRAME_CLASS_NAME,
    },
    threads: {
        src: '/platform-icons/threads.svg',
        darkSrc: '/platform-icons/threads-dark.svg',
        frameClassName: UNIFIED_FRAME_CLASS_NAME,
    },
    wechat: {
        src: '/platform-icons/wechat.svg',
        frameClassName: UNIFIED_FRAME_CLASS_NAME,
    },
    niconico: {
        src: '/platform-icons/niconico.svg',
        darkSrc: '/platform-icons/niconico-dark.svg',
        frameClassName: UNIFIED_FRAME_CLASS_NAME,
    },
    weibo: {
        src: '/platform-icons/weibo.svg',
        frameClassName: UNIFIED_FRAME_CLASS_NAME,
    },
    xiaohongshu: {
        src: '/platform-icons/xiaohongshu.svg',
        frameClassName: UNIFIED_FRAME_CLASS_NAME,
    },
    tiktok: {
        src: '/platform-icons/tiktok.svg',
        darkSrc: '/platform-icons/tiktok-dark.svg',
        frameClassName: UNIFIED_FRAME_CLASS_NAME,
    },
    instagram: {
        src: '/platform-icons/instagram.svg',
        frameClassName: UNIFIED_FRAME_CLASS_NAME,
    },
    x: {
        src: '/platform-icons/x.svg',
        darkSrc: '/platform-icons/x-dark.svg',
        frameClassName: UNIFIED_FRAME_CLASS_NAME,
    },
    vimeo: {
        src: '/platform-icons/vimeo.svg',
        frameClassName: UNIFIED_FRAME_CLASS_NAME,
    },
    dailymotion: {
        src: '/platform-icons/dailymotion.svg',
        darkSrc: '/platform-icons/dailymotion-dark.svg',
        frameClassName: UNIFIED_FRAME_CLASS_NAME,
    },
    streamable: {
        src: '/platform-icons/streamable.png',
        frameClassName: UNIFIED_FRAME_CLASS_NAME,
    },
    reddit: {
        src: '/platform-icons/reddit.svg',
        frameClassName: UNIFIED_FRAME_CLASS_NAME,
    },
    newgrounds: {
        src: '/platform-icons/newgrounds.svg',
        frameClassName: UNIFIED_FRAME_CLASS_NAME,
    },
    tumblr: {
        src: '/platform-icons/tumblr.svg',
        frameClassName: UNIFIED_FRAME_CLASS_NAME,
    },
    pinterest: {
        src: '/platform-icons/pinterest.svg',
        frameClassName: UNIFIED_FRAME_CLASS_NAME,
    },
    vk: {
        src: '/platform-icons/vk.svg',
        frameClassName: UNIFIED_FRAME_CLASS_NAME,
    },
    okru: {
        src: '/platform-icons/okru.svg',
        frameClassName: UNIFIED_FRAME_CLASS_NAME,
    },
    twitch: {
        src: '/platform-icons/twitch.svg',
        frameClassName: UNIFIED_FRAME_CLASS_NAME,
    },
    soundcloud: {
        src: '/platform-icons/soundcloud.svg',
        frameClassName: UNIFIED_FRAME_CLASS_NAME,
    },
    hls: {
        src: '/platform-icons/hls.svg',
        darkSrc: '/platform-icons/hls-dark.svg',
        frameClassName: UNIFIED_FRAME_CLASS_NAME,
        badgeLabel: 'New',
        badgeClassName: 'bg-primary text-primary-foreground',
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

export function getPlatformSupportItems(dict: PlatformSupportDictionary): PlatformSupportItem[] {
    const support = dict.guide.platformSupport;

    return [
        buildPlatformSupportItem('bilibili', support.bilibili),
        buildPlatformSupportItem('bilibiliTv', support.bilibiliTv),
        buildPlatformSupportItem('douyin', support.douyin),
        buildPlatformSupportItem('hls', support.hls),
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
        buildPlatformSupportItem('vimeo', support.vimeo),
        buildPlatformSupportItem('dailymotion', support.dailymotion),
        buildPlatformSupportItem('streamable', support.streamable),
        buildPlatformSupportItem('reddit', support.reddit),
        buildPlatformSupportItem('newgrounds', support.newgrounds),
        buildPlatformSupportItem('tumblr', support.tumblr),
        buildPlatformSupportItem('pinterest', support.pinterest),
        buildPlatformSupportItem('vk', support.vk),
        buildPlatformSupportItem('okru', support.okru),
        buildPlatformSupportItem('twitch', support.twitch),
        buildPlatformSupportItem('soundcloud', support.soundcloud),
    ].filter((item) => !HIDDEN_PLATFORM_SUPPORT_KEYS.has(item.key));
}
