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
    const title = locale === "en" ? "Terms of Use" : locale === "zh-tw" ? "使用條款" : "使用条款"
    const siteName = locale === "en" ? "Universal Media Downloader" : locale === "zh-tw" ? "通用媒體下載器" : "通用媒体下载器"
    const description = locale === "en"
        ? "Usage terms, legal limitations, and responsibilities for using the media downloader."
        : locale === "zh-tw"
          ? "說明下載工具的使用條件、限制與責任範圍。"
          : "说明下载工具的使用条件、限制与责任范围。"
    const url = buildLocaleUrl(locale, "/terms")

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
            images: ["/og/terms.png"],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: ["/og/terms.png"],
        },
        alternates: {
            canonical: url,
            languages: buildLanguageAlternates("/terms"),
        },
    }
}

export default async function TermsPage({
    params,
}: {
    params: Promise<{ locale: Locale }>
}) {
    const { locale } = await params
    const copy = locale === "en"
        ? {
            title: "Terms of Use",
            intro: "By using this service, you agree to follow applicable copyright and platform rules.",
            points: [
                "Use the tool only for lawful and authorized content access.",
                "Do not use the service to bypass payment, membership, or copyright protection.",
                "You are responsible for how downloaded files are used.",
                "The service may change functionality at any time without prior notice.",
            ],
            updated: "Last updated: February 18, 2026",
            home: "Home",
            linksLabel: "Related pages",
            privacy: "Privacy Policy",
            contact: "Contact",
        }
        : locale === "zh-tw"
          ? {
              title: "使用條款",
              intro: "使用本服務即表示你同意遵守相關版權規範與平台規則。",
              points: [
                  "僅可在合法且具授權的前提下使用本工具。",
                  "不得用於繞過付費、會員或版權保護限制。",
                  "下載內容的使用方式由使用者自行負責。",
                  "本站可能在未事先通知的情況下調整功能。",
              ],
              updated: "最後更新：2026-02-18",
              home: "首頁",
              linksLabel: "相關頁面",
              privacy: "隱私政策",
              contact: "聯絡我們",
          }
          : {
              title: "使用条款",
              intro: "使用本服务即表示你同意遵守相关版权规范与平台规则。",
              points: [
                  "仅可在合法且有授权的前提下使用本工具。",
                  "不得用于绕过付费、会员或版权保护限制。",
                  "下载内容的使用方式由用户自行负责。",
                  "本站可能在未提前通知的情况下调整功能。",
              ],
              updated: "最后更新：2026-02-18",
              home: "首页",
              linksLabel: "相关页面",
              privacy: "隐私政策",
              contact: "联系我们",
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
                    <Link className="underline" href={`/${locale}/privacy`}>{copy.privacy}</Link>
                    {' · '}
                    <Link className="underline" href={`/${locale}/contact`}>{copy.contact}</Link>
                </p>
            </div>
            <PageStructuredData
                locale={locale}
                pageTitle={copy.title}
                pageDescription={copy.intro}
                path="/terms"
                breadcrumbs={[
                    { name: copy.home, path: "" },
                    { name: copy.title, path: "/terms" },
                ]}
            />
        </main>
    )
}
