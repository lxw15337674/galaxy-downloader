/**
 * 应用常量配置
 */

// 下载历史相关
export const DOWNLOAD_HISTORY_MAX_COUNT = 30;
export const DOWNLOAD_HISTORY_STORAGE_KEY = 'download-history';

// Cookie 相关
export const LOCALE_COOKIE_NAME = 'preferred-locale';
export const LOCALE_COOKIE_MAX_AGE = 31536000; // 1年，单位：秒

// Toast 相关
export const TOAST_LIMIT = 1;
export const TOAST_REMOVE_DELAY = 1000000;

// UI 相关
export const MULTI_PART_LIST_MAX_HEIGHT = 300; // 多P列表最大高度，单位：px

// 广告相关
export const ADSENSE_CLIENT_ID = 'ca-pub-1581472267398547';
export const AD_LOAD_TIMEOUT = 10000; // 广告加载超时时间，单位：毫秒
export const AD_CHECK_INTERVAL = 500; // 广告状态检查间隔，单位：毫秒
export const AD_MAX_CHECKS = 20; // 最大检查次数
export const AD_MIN_HEIGHT = 250; // 广告最小高度，单位：px
