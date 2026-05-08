/**
 * 统一接口类型定义
 */

export const API_ERROR_CODES = [
    'BAD_REQUEST',
    'INVALID_JSON',
    'UNSUPPORTED_PLATFORM',
    'PLATFORM_MISMATCH',
    'INVALID_DOWNLOAD_TYPE',
    'INVALID_QUALITY',
    'NOT_FOUND',
    'DOWNLOAD_URL_NOT_FOUND',
    'RATE_LIMITED',
    'UPSTREAM_ERROR',
    'SERVICE_UNAVAILABLE',
    'INTERNAL_ERROR',
    'FEEDBACK_SUBMIT_FAILED',
    'MEDIA_PROCESSOR_INIT_FAILED',
    'PARSE_FAILED',
] as const

export type ApiErrorCode = (typeof API_ERROR_CODES)[number]
export type ApiErrorDetails = Record<string, unknown>
export type VideoAudioMode = 'muxed' | 'separate' | 'pure_music' | 'not_applicable'
export type VideoMediaAction = 'direct-download' | 'merge-then-download' | 'hide'
export type AudioMediaAction = 'direct-download' | 'extract-audio' | 'hide'

export interface MediaActions {
    video: VideoMediaAction;
    audio: AudioMediaAction;
}

/**
 * 多P视频的单个分P信息
 */
export interface PageInfo {
    page: number;
    cid: string;
    part: string;
    duration: number;
    downloadAudioUrl: string | null;
    downloadVideoUrl: string | null;
    videoAudioMode?: VideoAudioMode;
}

export interface VideoQualityOption {
    quality: string;
    label?: string;
    width?: number;
    height?: number;
    formatId?: number;
}

export interface EmbeddedVideoInfo {
    id: string;
    title: string;
    cover?: string | null;
    duration?: number;
    qualityOptions?: VideoQualityOption[];
    downloadVideoUrl?: string | null;
    downloadAudioUrl?: string | null;
    originDownloadVideoUrl?: string | null;
    originDownloadAudioUrl?: string | null;
    mediaActions?: MediaActions;
}

export interface UnifiedParseResultImage {
    index?: number;
    url?: string | null;
    downloadUrl?: string | null;
}

export interface UnifiedParseResult {
    success: boolean;
    code?: ApiErrorCode | string;
    status?: number;
    requestId?: string;
    details?: ApiErrorDetails;
    data?: {
        title: string;
        desc?: string;
        cover?: string | null;
        platform: string;
        downloadAudioUrl: string | null;
        downloadVideoUrl: string | null;
        originDownloadAudioUrl?: string | null;
        originDownloadVideoUrl: string | null;
        mediaActions?: MediaActions;
        url: string;
        // 时长（秒）
        duration?: number;
        // 多P视频相关字段
        isMultiPart?: boolean;
        currentPage?: number;
        currentItemId?: string;
        pages?: PageInfo[];
        // 小红书相关字段
        noteType?: 'video' | 'image' | 'audio';
        images?: Array<string | UnifiedParseResultImage>;
        // 微信公众号文章视频列表
        videos?: EmbeddedVideoInfo[];
    };
    error?: string;
    message?: string;
    url?: string; // 错误时可能包含原始URL
}

export interface UnifiedDownloadOptions {
    format: 'audio' | 'video';
    quality?: string;
}

export interface UnifiedApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    code?: ApiErrorCode | string;
    status?: number;
    requestId?: string;
    details?: ApiErrorDetails;
    error?: string;
    message?: string;
}


export type Platform =
    | 'bili'
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
    | 'nico'
    | 'niconico'
    | 'weibo'
    | 'xiaohongshu'
    | 'tiktok'
    | 'instagram'
    | 'ins'
    | 'x'
    | 'twitter'
    | 'unknown';
