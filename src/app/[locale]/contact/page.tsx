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
    const title = locale === "en" ? "Contact" : locale === "zh-tw" ? "聯絡我們" : "联系我们"
    const siteName = locale === "en" ? "Universal Media Downloader" : locale === "zh-tw" ? "通用媒體下載器" : "通用媒体下载器"
    const description = locale === "en"
        ? "Contact the Universal Media Downloader team for support, bug reports, or suggestions."
        : locale === "zh-tw"
          ? "聯絡下載工具團隊，提交問題回報或功能建議。"
          : "联系下载工具团队，提交问题反馈或功能建议。"
    const url = buildLocaleUrl(locale, "/contact")

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
            images: ["/og/contact.png"],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: ["/og/contact.png"],
        },
        alternates: {
            canonical: url,
            languages: buildLanguageAlternates("/contact"),
        },
    }
}

export default async function ContactPage({
    params,
}: {
    params: Promise<{ locale: Locale }>
}) {
    const { locale } = await params
    const copy = locale === "en"
        ? {
            title: "Contact",
            intro: "Use the channels below to report issues or request new features.",
            github: "Open a GitHub Issue",
            githubHint: "Best for bug reports and feature requests.",
            home: "Home",
            linksLabel: "Related pages",
            privacy: "Privacy Policy",
            terms: "Terms of Use",
            faq: "FAQ",
        }
        : locale === "zh-tw"
          ? {
              title: "聯絡我們",
              intro: "你可以透過以下方式提交問題回報或功能建議。",
              github: "前往 GitHub 提交 Issue",
              githubHint: "適合回報錯誤與提出功能需求。",
              home: "首頁",
              linksLabel: "相關頁面",
              privacy: "隱私政策",
              terms: "使用條款",
              faq: "常見問題",
          }
          : {
              title: "联系我们",
              intro: "你可以通过以下方式提交问题反馈或功能建议。",
              github: "前往 GitHub 提交 Issue",
              githubHint: "适合反馈 Bug 和提出功能需求。",
              home: "首页",
              linksLabel: "相关页面",
              privacy: "隐私政策",
              terms: "使用条款",
              faq: "常见问题",
          }

    return (
        <main className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-10 space-y-6">
                <h1 className="text-3xl font-semibold tracking-tight">{copy.title}</h1>
                <p className="text-sm text-muted-foreground leading-6">{copy.intro}</p>
                <div className="rounded-md border bg-card p-5 space-y-2">
                    <a
                        href="https://github.com/lxw15337674/bilibili-audio-downloader/issues/new"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm underline"
                    >
                        {copy.github}
                    </a>
                    <p className="text-sm text-muted-foreground">{copy.githubHint}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                    {copy.linksLabel}
                    {": "}
                    <Link className="underline" href={`/${locale}/privacy`}>{copy.privacy}</Link>
                    {' · '}
                    <Link className="underline" href={`/${locale}/terms`}>{copy.terms}</Link>
                    {' · '}
                    <Link className="underline" href={`/${locale}/faq`}>{copy.faq}</Link>
                </p>
            </div>
            <PageStructuredData
                locale={locale}
                pageTitle={copy.title}
                pageDescription={copy.intro}
                path="/contact"
                breadcrumbs={[
                    { name: copy.home, path: "" },
                    { name: copy.title, path: "/contact" },
                ]}
            />
        </main>
    )
}
