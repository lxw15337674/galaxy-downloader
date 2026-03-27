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
        url: string;
        // 时长（秒）
        duration?: number;
        // 多P视频相关字段
        isMultiPart?: boolean;
        currentPage?: number;
        pages?: PageInfo[];
        // 小红书相关字段
        noteType?: 'video' | 'image';
        images?: string[];
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
    | 'douyin'
    | 'xiaohongshu'
    | 'tiktok'
    | 'instagram'
    | 'ins'
    | 'x'
    | 'twitter'
    | 'unknown';
