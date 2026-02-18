import type { Metadata } from "next"
import Link from "next/link"
import { getDictionary } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n/config"
import { PageStructuredData } from "@/components/page-structured-data"
import { SEO_GUIDES, getLocalizedGuideContent } from "@/lib/guides"
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
    const dict = await getDictionary(locale)
    const title = locale === "en" ? "Downloader Guides" : locale === "zh-tw" ? "下載指南" : "下载指南"
    const description = locale === "en"
        ? "Step-by-step guides for downloading Bilibili, Douyin, and Xiaohongshu media."
        : locale === "zh-tw"
          ? "整理嗶哩嗶哩、抖音、小紅書內容下載與音訊提取的實用教學。"
          : "整理哔哩哔哩、抖音、小红书内容下载与音频提取的实用教程。"
    const url = buildLocaleUrl(locale, "/guides")

    return {
        title: `${title} | ${dict.metadata.siteName}`,
        description,
        openGraph: {
            title: `${title} | ${dict.metadata.siteName}`,
            description,
            url,
            siteName: dict.metadata.siteName,
            locale: localeToOpenGraphLocale(locale),
            alternateLocale: buildOpenGraphLocaleAlternates(locale),
            type: "website",
            images: ["/og/guides.png"],
        },
        twitter: {
            card: "summary_large_image",
            title: `${title} | ${dict.metadata.siteName}`,
            description,
            images: ["/og/guides.png"],
        },
        alternates: {
            canonical: url,
            languages: buildLanguageAlternates("/guides"),
        },
    }
}

export default async function GuidesPage({
    params,
}: {
    params: Promise<{ locale: Locale }>
}) {
    const { locale } = await params
    const pageCopy = locale === "en"
        ? {
            title: "Media Download Guides",
            intro: "Use these pages to solve common download scenarios and improve success rate.",
            backHome: "Back to downloader",
            updatedAt: "Updated",
            home: "Home",
            faq: "FAQ",
            privacy: "Privacy",
            terms: "Terms",
        }
        : locale === "zh-tw"
          ? {
              title: "媒體下載指南",
              intro: "以下教學涵蓋常見下載場景，可快速定位問題並提高解析成功率。",
              backHome: "返回下載器",
              updatedAt: "更新日期",
              home: "首頁",
              faq: "常見問題",
              privacy: "隱私政策",
              terms: "使用條款",
          }
          : {
              title: "媒体下载指南",
              intro: "以下教程覆盖常见下载场景，可快速定位问题并提高解析成功率。",
              backHome: "返回下载器",
              updatedAt: "更新日期",
              home: "首页",
              faq: "常见问题",
              privacy: "隐私政策",
              terms: "使用条款",
          }

    const itemListSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": pageCopy.title,
        "itemListElement": SEO_GUIDES.map((guide, index) => {
            const content = getLocalizedGuideContent(guide, locale)
            const guideUrl = buildLocaleUrl(locale, `/guides/${guide.slug}`)
            return {
                "@type": "ListItem",
                "position": index + 1,
                "name": content.title,
                "url": guideUrl,
                "item": {
                    "@type": "Article",
                    "name": content.title,
                    "url": guideUrl,
                    "dateModified": guide.updatedAt,
                },
            }
        }),
    }

    return (
        <main className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-10 space-y-8">
                <header className="space-y-2">
                    <h1 className="text-3xl font-semibold tracking-tight">{pageCopy.title}</h1>
                    <p className="text-sm text-muted-foreground">{pageCopy.intro}</p>
                    <Link href={`/${locale}`} className="text-sm underline">
                        {pageCopy.backHome}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                        <Link className="underline" href={`/${locale}/faq`}>{pageCopy.faq}</Link>
                        {' · '}
                        <Link className="underline" href={`/${locale}/privacy`}>{pageCopy.privacy}</Link>
                        {' · '}
                        <Link className="underline" href={`/${locale}/terms`}>{pageCopy.terms}</Link>
                    </p>
                </header>

                <section className="grid gap-4">
                    {SEO_GUIDES.map((guide) => {
                        const content = getLocalizedGuideContent(guide, locale)
                        return (
                            <article key={guide.slug} className="rounded-lg border bg-card p-5 space-y-3">
                                <h2 className="text-xl font-semibold">
                                    <Link className="underline-offset-4 hover:underline" href={`/${locale}/guides/${guide.slug}`}>
                                        {content.title}
                                    </Link>
                                </h2>
                                <p className="text-sm text-muted-foreground leading-6">{content.description}</p>
                                <p className="text-xs text-muted-foreground">
                                    {pageCopy.updatedAt}: {guide.updatedAt}
                                </p>
                            </article>
                        )
                    })}
                </section>
            </div>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
            />
            <PageStructuredData
                locale={locale}
                pageTitle={pageCopy.title}
                pageDescription={pageCopy.intro}
                path="/guides"
                breadcrumbs={[
                    { name: pageCopy.home, path: "" },
                    { name: pageCopy.title, path: "/guides" },
                ]}
            />
        </main>
    )
}
