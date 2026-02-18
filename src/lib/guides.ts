import type { Locale } from "@/lib/i18n/config"

export interface GuideStep {
    name: string
    text: string
}

export interface GuideFaqItem {
    question: string
    answer: string
}

export interface GuideContent {
    title: string
    description: string
    intro: string
    steps: GuideStep[]
    tips: string[]
    faq: GuideFaqItem[]
}

export interface SeoGuide {
    slug: string
    updatedAt: string
    content: Record<Locale, GuideContent>
}

export const SEO_GUIDES: SeoGuide[] = [
    {
        slug: "bilibili-audio-to-mp3",
        updatedAt: "2026-02-18",
        content: {
            en: {
                title: "How to Extract Bilibili Audio to MP3",
                description: "Step-by-step guide to parse Bilibili links and extract MP3 audio files in your browser.",
                intro: "Use this guide when you only need audio from a Bilibili video, podcast, or lecture clip.",
                steps: [
                    { name: "Copy a Bilibili URL", text: "Copy a normal Bilibili video link or a b23 short link." },
                    { name: "Paste into the downloader", text: "Open the homepage, paste the link, and click Parse." },
                    { name: "Choose audio extraction", text: "After parsing, use the audio option to extract MP3." },
                    { name: "Save the output file", text: "Wait for conversion to finish and save the audio file locally." },
                ],
                tips: [
                    "Longer videos require more conversion time in the browser.",
                    "If parsing fails, retry with the full original URL.",
                    "Member-only and paid content is not supported.",
                ],
                faq: [
                    { question: "Does this keep the original audio quality?", answer: "Output quality depends on source quality and browser conversion limits." },
                    { question: "Do I need to install software?", answer: "No. The tool works directly in a modern browser." },
                ],
            },
            zh: {
                title: "哔哩哔哩音频提取 MP3 教程",
                description: "一步步说明如何解析哔哩哔哩链接并在浏览器内提取 MP3 音频。",
                intro: "如果你只想保留视频里的音频（如播客、讲解、音乐），可按以下步骤操作。",
                steps: [
                    { name: "复制哔哩哔哩链接", text: "支持标准视频链接和 b23 短链接。" },
                    { name: "粘贴到下载器", text: "打开首页，粘贴链接并点击解析按钮。" },
                    { name: "选择音频提取", text: "解析完成后，选择音频或 MP3 提取选项。" },
                    { name: "保存音频文件", text: "等待转换完成后，将 MP3 文件保存到本地。" },
                ],
                tips: [
                    "视频越长，浏览器端转换时间越久。",
                    "解析失败时，优先尝试完整原始链接。",
                    "会员/付费/版权受限内容不支持下载。",
                ],
                faq: [
                    { question: "音质会和原视频一致吗？", answer: "最终音质取决于源视频质量和浏览器转换能力。" },
                    { question: "需要安装软件吗？", answer: "不需要，直接在现代浏览器中即可使用。" },
                ],
            },
            "zh-tw": {
                title: "嗶哩嗶哩音訊提取 MP3 教學",
                description: "逐步說明如何解析嗶哩嗶哩連結並在瀏覽器內提取 MP3 音訊。",
                intro: "如果你只想保留影片中的音訊（如播客、講解、音樂），可按以下步驟操作。",
                steps: [
                    { name: "複製嗶哩嗶哩連結", text: "支援標準影片連結和 b23 短連結。" },
                    { name: "貼上到下載器", text: "開啟首頁，貼上連結並點擊解析按鈕。" },
                    { name: "選擇音訊提取", text: "解析完成後，選擇音訊或 MP3 提取選項。" },
                    { name: "保存音訊檔案", text: "等待轉換完成後，將 MP3 檔案保存到本地。" },
                ],
                tips: [
                    "影片越長，瀏覽器端轉換時間越久。",
                    "解析失敗時，優先嘗試完整原始連結。",
                    "會員/付費/版權受限內容不支援下載。",
                ],
                faq: [
                    { question: "音質會和原影片一致嗎？", answer: "最終音質取決於來源影片品質和瀏覽器轉換能力。" },
                    { question: "需要安裝軟體嗎？", answer: "不需要，直接在現代瀏覽器中即可使用。" },
                ],
            },
        },
    },
    {
        slug: "douyin-no-watermark-download",
        updatedAt: "2026-02-18",
        content: {
            en: {
                title: "How to Download Douyin Videos Without Watermark",
                description: "Guide for parsing Douyin share links and downloading clean video files.",
                intro: "Use this workflow to convert Douyin share links into downloadable no-watermark video files.",
                steps: [
                    { name: "Copy the Douyin share link", text: "Copy from app share panel or browser address bar." },
                    { name: "Paste and parse", text: "Paste into the input box and run Parse to detect the platform." },
                    { name: "Pick video download", text: "Choose an available video option from parse results." },
                    { name: "Fallback to backup link", text: "If direct download fails, use the backup direct link." },
                ],
                tips: [
                    "Command-style share text is also supported.",
                    "Some videos may be unavailable due to platform restrictions.",
                    "Use the latest Chrome, Edge, or Safari for better compatibility.",
                ],
                faq: [
                    { question: "Why is download speed sometimes slow?", answer: "Speed can be limited by source servers and current network conditions." },
                    { question: "Can private videos be downloaded?", answer: "No. Private or restricted content usually cannot be parsed." },
                ],
            },
            zh: {
                title: "抖音无水印视频下载教程",
                description: "讲解如何解析抖音分享链接并下载无水印视频。",
                intro: "将抖音分享链接粘贴到工具中，即可自动识别并提供下载选项。",
                steps: [
                    { name: "复制抖音分享链接", text: "可从 App 分享面板或浏览器地址栏复制。" },
                    { name: "粘贴并解析", text: "粘贴到输入框后点击解析，系统自动识别平台。" },
                    { name: "选择视频下载", text: "在解析结果中选择可用的视频下载项。" },
                    { name: "使用备用直链", text: "若直接下载失败，可使用备用直链手动下载。" },
                ],
                tips: [
                    "支持直接粘贴包含口令的分享文本。",
                    "部分内容可能因平台限制无法下载。",
                    "建议使用最新版 Chrome、Edge 或 Safari。",
                ],
                faq: [
                    { question: "为什么有时下载速度慢？", answer: "下载速度受源站和网络状况影响，可能出现波动。" },
                    { question: "私密视频可以下载吗？", answer: "通常不行，私密或受限内容往往无法解析。" },
                ],
            },
            "zh-tw": {
                title: "抖音無浮水印影片下載教學",
                description: "說明如何解析抖音分享連結並下載無浮水印影片。",
                intro: "將抖音分享連結貼上到工具中，即可自動識別並提供下載選項。",
                steps: [
                    { name: "複製抖音分享連結", text: "可從 App 分享面板或瀏覽器網址列複製。" },
                    { name: "貼上並解析", text: "貼上到輸入框後點擊解析，系統會自動識別平台。" },
                    { name: "選擇影片下載", text: "在解析結果中選擇可用的影片下載項。" },
                    { name: "使用備用直鏈", text: "若直接下載失敗，可使用備用直鏈手動下載。" },
                ],
                tips: [
                    "支援直接貼上含口令的分享文字。",
                    "部分內容可能因平台限制無法下載。",
                    "建議使用最新版 Chrome、Edge 或 Safari。",
                ],
                faq: [
                    { question: "為什麼有時下載速度慢？", answer: "下載速度受來源站點和網路狀況影響，可能出現波動。" },
                    { question: "私密影片可以下載嗎？", answer: "通常不行，私密或受限內容往往無法解析。" },
                ],
            },
        },
    },
    {
        slug: "xiaohongshu-image-video-download",
        updatedAt: "2026-02-18",
        content: {
            en: {
                title: "How to Download Xiaohongshu Images and Videos",
                description: "Guide for downloading Xiaohongshu video notes and image notes with proper link formats.",
                intro: "This page explains how to parse Xiaohongshu links and save either image sets or video notes.",
                steps: [
                    { name: "Copy an explore link", text: "Use an official share link or a short xhslink URL." },
                    { name: "Paste and parse", text: "Paste the URL and run Parse to identify note type." },
                    { name: "Choose single or batch", text: "For image notes, download images one by one or in batch." },
                    { name: "Extract audio if needed", text: "For video notes, you can also run browser-side audio extraction." },
                ],
                tips: [
                    "Image notes may contain multiple assets; wait for previews to load.",
                    "If one image fails, you can still download the remaining images.",
                    "Audio extraction time depends on video duration.",
                ],
                faq: [
                    { question: "Which links are supported?", answer: "Standard Xiaohongshu share links and xhslink short links are supported." },
                    { question: "Can I batch download image notes?", answer: "Yes. Parsed image notes provide packaging and batch download options." },
                ],
            },
            zh: {
                title: "小红书图文与视频下载教程",
                description: "介绍如何解析小红书链接并下载图文笔记或视频笔记。",
                intro: "本教程适用于小红书图文和视频场景，支持短链与标准分享链接。",
                steps: [
                    { name: "复制笔记链接", text: "支持小红书分享链接和 xhslink 短链接。" },
                    { name: "粘贴并解析", text: "粘贴链接后点击解析，系统自动识别图文或视频。" },
                    { name: "选择单图或批量", text: "图文笔记可单张下载，也可打包批量下载。" },
                    { name: "按需提取音频", text: "视频笔记可继续进行浏览器端音频提取。" },
                ],
                tips: [
                    "图文笔记可能包含多张图片，建议等待图片预览完成。",
                    "部分图片加载失败时，仍可下载剩余图片。",
                    "音频提取耗时与视频时长相关。",
                ],
                faq: [
                    { question: "支持哪些链接格式？", answer: "支持小红书标准分享链接与 xhslink 短链接。" },
                    { question: "可以批量下载图文吗？", answer: "可以，解析后支持打包下载图片。" },
                ],
            },
            "zh-tw": {
                title: "小紅書圖文與影片下載教學",
                description: "介紹如何解析小紅書連結並下載圖文筆記或影片筆記。",
                intro: "本教學適用於小紅書圖文與影片場景，支援短連結與標準分享連結。",
                steps: [
                    { name: "複製筆記連結", text: "支援小紅書分享連結與 xhslink 短連結。" },
                    { name: "貼上並解析", text: "貼上連結後點擊解析，系統會自動識別圖文或影片。" },
                    { name: "選擇單圖或批次", text: "圖文筆記可單張下載，也可打包批次下載。" },
                    { name: "按需提取音訊", text: "影片筆記可進一步進行瀏覽器端音訊提取。" },
                ],
                tips: [
                    "圖文筆記可能包含多張圖片，建議等待圖片預覽完成。",
                    "部分圖片載入失敗時，仍可下載剩餘圖片。",
                    "音訊提取耗時與影片時長相關。",
                ],
                faq: [
                    { question: "支援哪些連結格式？", answer: "支援小紅書標準分享連結與 xhslink 短連結。" },
                    { question: "可以批次下載圖文嗎？", answer: "可以，解析後支援打包下載圖片。" },
                ],
            },
        },
    },
]

export function getGuideBySlug(slug: string): SeoGuide | undefined {
    return SEO_GUIDES.find((guide) => guide.slug === slug)
}

export function getLocalizedGuideContent(guide: SeoGuide, locale: Locale): GuideContent {
    return guide.content[locale]
}
