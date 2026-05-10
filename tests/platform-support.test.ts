import { describe, expect, it } from 'vitest';

import { getPlatformSupportItems } from '../src/components/downloader/platform-support';
import type { Dictionary } from '../src/lib/i18n/types';

const dict = {
    guide: {
        platformSupport: {
            bilibili: { name: 'Bilibili', summary: 'video' },
            bilibiliTv: { name: 'Bilibili TV', summary: 'tv' },
            douyin: { name: 'Douyin', summary: 'video' },
            hls: { name: 'HLS', summary: 'streaming' },
            youtube: { name: 'YouTube', summary: 'video' },
            telegram: { name: 'Telegram', summary: 'channel' },
            threads: { name: 'Threads', summary: 'post' },
            wechat: { name: 'WeChat', summary: 'article' },
            niconico: { name: 'Niconico', summary: 'video' },
            weibo: { name: 'Weibo', summary: 'post' },
            xiaohongshu: { name: 'Xiaohongshu', summary: 'note' },
            tiktok: { name: 'TikTok', summary: 'video' },
            instagram: { name: 'Instagram', summary: 'post' },
            x: { name: 'X', summary: 'post' },
            vimeo: { name: 'Vimeo', summary: 'content' },
            dailymotion: { name: 'Dailymotion', summary: 'content' },
            streamable: { name: 'Streamable', summary: 'content' },
            reddit: { name: 'Reddit', summary: 'content' },
            newgrounds: { name: 'Newgrounds', summary: 'content' },
            tumblr: { name: 'Tumblr', summary: 'content' },
            pinterest: { name: 'Pinterest', summary: 'content' },
            vk: { name: 'VK', summary: 'content' },
            okru: { name: 'OK.ru', summary: 'content' },
            twitch: { name: 'Twitch', summary: 'content' },
            soundcloud: { name: 'SoundCloud', summary: 'content' },
            comingSoon: 'Coming soon',
        },
    },
} as const;

describe('getPlatformSupportItems', () => {
    it('hides platforms that should not be promoted in the support list', () => {
        const items = getPlatformSupportItems(dict as unknown as Pick<Dictionary, 'guide'>);

        const keys = items.map((item) => item.key);
        expect(keys).not.toContain('youtube');
        expect(keys).toContain('soundcloud');
        expect(keys).toContain('vk');
        expect(keys).toContain('okru');
        expect(keys).toContain('pinterest');
    });
});
