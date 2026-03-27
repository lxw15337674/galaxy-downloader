import type { Dictionary } from '@/lib/i18n/types';

type PlatformSupportEntry = {
    name: string;
    summary: string;
    features?: string[];
};

export type PlatformSupportItem = {
    key: string;
    name: string;
    features: string[];
};

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
        { key: 'bilibili', name: support.bilibili.name, features: resolveFeatures(support.bilibili) },
        { key: 'bilibiliTv', name: support.bilibiliTv.name, features: resolveFeatures(support.bilibiliTv) },
        { key: 'douyin', name: support.douyin.name, features: resolveFeatures(support.douyin) },
        { key: 'xiaohongshu', name: support.xiaohongshu.name, features: resolveFeatures(support.xiaohongshu) },
        { key: 'tiktok', name: support.tiktok.name, features: resolveFeatures(support.tiktok) },
    ];
}
