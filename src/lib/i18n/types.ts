import type {ApiErrorCode} from '@/lib/types'

export interface ResultDict {
    title: string;
    downloadVideo: string;
    mergeDownloadVideo: string;
    mergeDownloadVideoHint: string;
    downloadAudio: string;
    originDownloadVideo: string;
    originDownloadAudio: string;
    totalParts: string;
    articleVideoList: string;
    articleVideoCount: string;
    articleVideoUntitled: string;
    downloadImage: string;
    coverLabel: string;
    imageIndexLabel: string;
    imageAlt: string;
    imageNote: string;
    imageCount: string;
    packaging: string;
    packageDownload: string;
    loading: string;
    loadFailed: string;
    viewLargeImage: string;
    imageLoadingProgress: string;
    imageAutoLoadedTip: string;
    packagingProgress: string;
}

export interface CommonDict {
    home: string;
    relatedPages: string;
    privacy: string;
    terms: string;
    contact: string;
    trustAndPolicies: string;
}

export interface StaticPageMetaDict {
    metaTitle: string;
    metaDescription: string;
    title: string;
    intro: string;
}

export interface Dictionary {
    home: {
        title: string;
        description: string;
        bilibiliButton: string;
        douyinButton: string;
    };
    unified: {
        pageTitle: string;
        pageDescription: string;
        placeholder: string;
        newBadge: string;
        exampleLabel?: string;
        exampleUrl?: string;
    };
    page: {
        feedback: string;
        feedbackLinkText: string;
        openMenuLabel: string;
        switchLanguageLabel: string;
        copyrightVideo: string;
        copyrightStorage: string;
        copyrightYear: string;
        copyrightBilibiliRestriction: string;
    };
    form: {
        pasteButton: string;
        downloadButton: string;
        downloading: string;
    };
    errors: {
        emptyUrl: string;
        downloadError: string;
        downloadFailed: string;
        getVideoInfoFailed: string;
        clipboardFailed: string;
        clipboardPermission: string;
        allImagesLoadFailed: string;
        packageFailed: string;
        confirmPartialDownload: string;
        continue: string;
        cancel: string;
        fileTooLarge: string;
        videoFileTooLarge: string;
        audioFileTooLarge: string;
        totalSizeTooLarge: string;
        fileEmpty: string;
        fileFormatNotSupported: string;
        audioFormatNotSupported: string;
        fileReadFailed: string;
        noVideoSelected: string;
        noAudioSelected: string;
        api: Record<ApiErrorCode, string>;
    };
    history: {
        title: string;
        clear: string;
        cleared: string;
        searchPlaceholder: string;
        noSearchResults: string;
        viewSource: string;
        redownload: string;
        linkFilled: string;
        clickToRedownload: string;
        unknownTitle: string;
        platforms: {
            bilibili: string;
            bilibiliTv: string;
            douyin: string;
            telegram: string;
            wechat: string;
            niconico: string;
            xiaohongshu: string;
            tiktok: string;
            instagram: string;
            x: string;
            unknown: string;
        };
    };
    toast: {
        linkFilled: string;
        douyinParseSuccess: string;
        linkFilledForRedownload: string;
        clickToRedownloadDesc: string;
        installTitle: string;
        installDescription: string;
        installAction: string;
    };
    metadata: {
        title: string;
        description: string;
        keywords: string;
        ogTitle: string;
        ogDescription: string;
        siteName: string;
    };
    common: CommonDict;
    languages: {
        zh: string;
        'zh-tw': string;
        en: string;
        ja: string;
    };
    douyin: {
        apiLimitDownload: string;
    };
    extractAudio: {
        button: string;
        loading: string;
        downloading: string;
        downloadingWithSize?: string;
        converting: string;
        completed: string;
        retry: string;
        errorLoad: string;
        errorDownload: string;
        errorConvert: string;
        errorMemory: string;
    };
    audioTool: {
        triggerButton: string;
        title: string;
        description: string;
        extractDescription: string;
        mergeDescription: string;
        placeholder: string;
        strategyHint: string;
        pasteButton: string;
        submitButton: string;
        processingButton: string;
        statusIdle: string;
        statusMergeIdle: string;
        statusParsing: string;
        statusPreparingMerge: string;
        statusDirectDownloading: string;
        statusFallbackExtracting: string;
        statusCompleted: string;
        noAudioSource: string;
        noMergeSource: string;
        urlTab: string;
        fileTab: string;
        mergeTab: string;
        videoFile: string;
        audioFile: string;
        dropHint: string;
        fileSizeLimit: string;
        fileSelected: string;
        selectFileButton: string;
        changeFileButton: string;
        selectVideoButton: string;
        selectAudioButton: string;
        videoSizeLimit: string;
        audioSizeLimit: string;
        videoSelected: string;
        audioSelected: string;
        mergeButton: string;
        changeVideoButton: string;
        changeAudioButton: string;
        closeButton: string;
        statusReadingFile: string;
        statusFileReady: string;
        statusReadingVideo: string;
        statusReadingAudio: string;
        statusMerging: string;
    };
    guide: {
        quickStart: {
            title: string;
            steps: Array<{
                title: string;
                description: string;
            }>;
        };
        platformSupport: {
            title: string;
            bilibili: {
                name: string;
                summary: string;
                features?: string[];
                limitations?: string[];
            };
            bilibiliTv: {
                name: string;
                summary: string;
                features?: string[];
                limitations?: string[];
            };
            douyin: {
                name: string;
                summary: string;
                features?: string[];
                limitations?: string[];
                tip?: {
                    text: string;
                    tool: {
                        name: string;
                        url: string;
                    };
                };
            };
            telegram: {
                name: string;
                summary: string;
                features?: string[];
                limitations?: string[];
            };
            wechat: {
                name: string;
                summary: string;
                features?: string[];
                limitations?: string[];
            };
            niconico: {
                name: string;
                summary: string;
                features?: string[];
                limitations?: string[];
            };
            xiaohongshu: {
                name: string;
                summary: string;
                features?: string[];
                limitations?: string[];
            };
            tiktok: {
                name: string;
                summary: string;
                features?: string[];
                limitations?: string[];
            };
            instagram: {
                name: string;
                summary: string;
                features?: string[];
                limitations?: string[];
            };
            x: {
                name: string;
                summary: string;
                features?: string[];
                limitations?: string[];
            };
            audioTip?: {
                title: string;
                steps: string;
                warning: string;
            };
            urlExamples?: {
                title: string;
                bilibili: string[];
                douyin: string[];
                xiaohongshu: string[];
            };
            comingSoon: string;
        };
        linkFormats: {
            title: string;
            bilibili: {
                title: string;
                examples: string[];
            };
            douyin: {
                title: string;
                examples: string[];
            };
            telegram: {
                title: string;
                examples: string[];
            };
            tip: string;
        };
    };
    freeSupport: {
        title: string;
        features: {
            freeToUse: string;
            noRegistration: string;
            unlimitedDownloads: string;
        };
        privacy: {
            title: string;
            noUserRecords: string;
            localStorage: string;
        };
        revenue: {
            adsSupport: string;
            serverCosts: string;
        };
    };
    seo: {
        features: {
            en: string[];
            zh: string[];
            'zh-tw': string[];
            ja: string[];
        };
        howTo: {
            title: {
                en: string;
                zh: string;
                'zh-tw': string;
                ja: string;
            };
            steps: {
                en: Array<{
                    name: string;
                    text: string;
                }>;
                zh: Array<{
                    name: string;
                    text: string;
                }>;
                'zh-tw': Array<{
                    name: string;
                    text: string;
                }>;
                ja: Array<{
                    name: string;
                    text: string;
                }>;
            };
        };
    };
    contactPage: StaticPageMetaDict & {
        github: string;
        githubHint: string;
    };
    privacyPage: StaticPageMetaDict & {
        points: string[];
        updated: string;
    };
    termsPage: StaticPageMetaDict & {
        points: string[];
        updated: string;
    };
    result: ResultDict;
    changelog: {
        title: string;
    };
    feedback: {
        title: string;
        triggerButton: string;
        typeLabel: string;
        typeRequired: string;
        types: {
            bug: string;
            feature: string;
            other: string;
        };
        contentLabel: string;
        contentRequired: string;
        contentTooShort: string;
        contentPlaceholder: {
            bug: string;
            feature: string;
            other: string;
        };
        contentCounter: string;
        emailLabel: string;
        emailPlaceholder: string;
        emailInvalid: string;
        emailHint: string;
        emailRequired: string;
        cancelButton: string;
        submitButton: string;
        submittingButton: string;
        closeButton: string;
        successTitle: string;
        successMessage: string;
        successNote: string;
        errorTitle: string;
        errorMessage: string;
        errorFallback: string;
        retryButton: string;
        toastSuccess: string;
        toastError: string;
    };
} 
