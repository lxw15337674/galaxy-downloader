import type { Metadata } from "next"
import Link from "next/link"
import { PageStructuredData } from "@/components/page-structured-data"
import type { Locale } from "@/lib/i18n/config"
import {
    buildLanguageAlternates,
    buildLocaleUrl,
    buildOpenGraphLocaleAlternates,
    localeToOpenGraphLocale,
} from "@/lib/seo"

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
    const { locale } = await params
    const title = locale === "en" ? "Privacy Policy" : locale === "zh-tw" ? "隱私政策" : "隐私政策"
    const siteName = locale === "en" ? "Universal Media Downloader" : locale === "zh-tw" ? "通用媒體下載器" : "通用媒体下载器"
    const description = locale === "en"
        ? "How Universal Media Downloader handles data, browser storage, and user privacy."
        : locale === "zh-tw"
          ? "說明本站如何處理資料、瀏覽器儲存與隱私保護。"
          : "说明本站如何处理数据、浏览器存储与隐私保护。"
    const url = buildLocaleUrl(locale, "/privacy")

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url,
            siteName,
            locale: localeToOpenGraphLocale(locale),
            alternateLocale: buildOpenGraphLocaleAlternates(locale),
            type: "website",
            images: ["/og/privacy.png"],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: ["/og/privacy.png"],
        },
        alternates: {
            canonical: url,
            languages: buildLanguageAlternates("/privacy"),
        },
    }
}

export default async function PrivacyPage({
    params,
}: {
    params: Promise<{ locale: Locale }>
}) {
    const { locale } = await params
    const copy = locale === "en"
        ? {
            title: "Privacy Policy",
            intro: "This page explains what data is processed when using the downloader.",
            points: [
                "No account registration is required.",
                "Download history is stored in your browser local storage.",
                "The service does not store your private media files on this website.",
                "Third-party services such as analytics or ads may collect usage data according to their own policies.",
            ],
            updated: "Last updated: February 18, 2026",
            home: "Home",
            linksLabel: "Related pages",
            faq: "FAQ",
            guides: "Guides",
        }
        : locale === "zh-tw"
          ? {
              title: "隱私政策",
              intro: "本頁說明在使用下載工具時，網站如何處理相關資料。",
              points: [
                  "本站無需註冊帳號即可使用。",
                  "下載歷史僅儲存在你的瀏覽器本地儲存中。",
                  "本站不保存你的私人媒體檔案。",
                  "分析或廣告等第三方服務可能依其政策收集使用資料。",
              ],
              updated: "最後更新：2026-02-18",
              home: "首頁",
              linksLabel: "相關頁面",
              faq: "常見問題",
              guides: "使用指南",
          }
          : {
              title: "隐私政策",
              intro: "本页说明在使用下载工具时，网站如何处理相关数据。",
              points: [
                  "本站无需注册账号即可使用。",
                  "下载历史仅存储在你的浏览器本地存储中。",
                  "本站不保存你的私人媒体文件。",
                  "分析或广告等第三方服务可能按其政策收集使用数据。",
              ],
              updated: "最后更新：2026-02-18",
              home: "首页",
              linksLabel: "相关页面",
              faq: "常见问题",
              guides: "使用指南",
          }

    return (
        <main className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-10 space-y-6">
                <h1 className="text-3xl font-semibold tracking-tight">{copy.title}</h1>
                <p className="text-sm text-muted-foreground leading-6">{copy.intro}</p>
                <ul className="space-y-2 text-sm text-muted-foreground leading-6">
                    {copy.points.map((point) => (
                        <li key={point} className="rounded-md border bg-card p-4">
                            {point}
                        </li>
                    ))}
                </ul>
                <p className="text-xs text-muted-foreground">{copy.updated}</p>
                <p className="text-sm text-muted-foreground">
                    {copy.linksLabel}
                    {": "}
                    <Link className="underline" href={`/${locale}/faq`}>{copy.faq}</Link>
                    {' · '}
                    <Link className="underline" href={`/${locale}/guides`}>{copy.guides}</Link>
                </p>
            </div>
            <PageStructuredData
                locale={locale}
                pageTitle={copy.title}
                pageDescription={copy.intro}
                path="/privacy"
                breadcrumbs={[
                    { name: copy.home, path: "" },
                    { name: copy.title, path: "/privacy" },
                ]}
            />
        </main>
    )
}
