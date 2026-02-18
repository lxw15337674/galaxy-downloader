import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getDictionary } from "@/lib/i18n"
import { i18n, type Locale } from "@/lib/i18n/config"
import { SEO_GUIDES, getGuideBySlug, getLocalizedGuideContent } from "@/lib/guides"
import {
    buildLanguageAlternates,
    buildLocaleUrl,
    buildOpenGraphLocaleAlternates,
    localeToHtmlLang,
    localeToOpenGraphLocale,
} from "@/lib/seo"

type GuideParams = {
    locale: Locale
    slug: string
}

export function generateStaticParams() {
    return i18n.locales.flatMap((locale) =>
        SEO_GUIDES.map((guide) => ({
            locale,
            slug: guide.slug,
        }))
    )
}

export async function generateMetadata({
    params,
}: {
    params: Promise<GuideParams>
}): Promise<Metadata> {
    const { locale, slug } = await params
    const guide = getGuideBySlug(slug)
    if (!guide) {
        return {}
    }

    const content = getLocalizedGuideContent(guide, locale)
    const dict = await getDictionary(locale)
    const pageTitle = `${content.title} | ${dict.metadata.siteName}`
    const url = buildLocaleUrl(locale, `/guides/${slug}`)

    return {
        title: pageTitle,
        description: content.description,
        openGraph: {
            title: pageTitle,
            description: content.description,
            url,
            siteName: dict.metadata.siteName,
            type: "article",
            locale: localeToOpenGraphLocale(locale),
            alternateLocale: buildOpenGraphLocaleAlternates(locale),
            modifiedTime: guide.updatedAt,
            authors: [dict.metadata.siteName],
            images: ["/og/guides.png"],
        },
        twitter: {
            card: "summary_large_image",
            title: pageTitle,
            description: content.description,
            images: ["/og/guides.png"],
        },
        alternates: {
            canonical: url,
            languages: buildLanguageAlternates(`/guides/${slug}`),
        },
    }
}

export default async function GuideDetailPage({
    params,
}: {
    params: Promise<GuideParams>
}) {
    const { locale, slug } = await params
    const guide = getGuideBySlug(slug)
    if (!guide) {
        notFound()
    }

    const content = getLocalizedGuideContent(guide, locale)
    const dict = await getDictionary(locale)
    const relatedGuides = SEO_GUIDES.filter((item) => item.slug !== slug)
    const pageCopy = locale === "en"
        ? {
            home: "Home",
            guides: "Guides",
            downloader: "Downloader",
            faq: "FAQ",
            steps: "Steps",
            tips: "Practical Tips",
            faqSection: "Quick FAQ",
            related: "Related Guides",
        }
        : locale === "zh-tw"
          ? {
              home: "首頁",
              guides: "指南",
              downloader: "下載器",
              faq: "常見問題",
              steps: "操作步驟",
              tips: "實用提示",
              faqSection: "常見問題",
              related: "相關指南",
          }
          : {
              home: "首页",
              guides: "指南",
              downloader: "下载器",
              faq: "常见问题",
              steps: "操作步骤",
              tips: "实用提示",
              faqSection: "常见问题",
              related: "相关指南",
          }

    const url = buildLocaleUrl(locale, `/guides/${slug}`)
    const howToSchema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": content.title,
        "description": content.description,
        "inLanguage": localeToHtmlLang(locale),
        "step": content.steps.map((step) => ({
            "@type": "HowToStep",
            "name": step.name,
            "text": step.text,
        })),
    }
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": pageCopy.home,
                "item": buildLocaleUrl(locale),
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": pageCopy.guides,
                "item": buildLocaleUrl(locale, "/guides"),
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": content.title,
                "item": url,
            },
        ],
    }
    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": content.title,
        "description": content.description,
        "inLanguage": localeToHtmlLang(locale),
        "datePublished": guide.publishedAt,
        "dateModified": guide.updatedAt,
        "mainEntityOfPage": url,
        "author": {
            "@type": "Organization",
            "name": dict.metadata.siteName,
        },
        "publisher": {
            "@type": "Organization",
            "name": dict.metadata.siteName,
        },
    }

    return (
        <main className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-10 space-y-8">
                <nav className="text-sm text-muted-foreground flex items-center gap-2">
                    <Link className="underline" href={`/${locale}`}>{pageCopy.home}</Link>
                    <span>/</span>
                    <Link className="underline" href={`/${locale}/guides`}>{pageCopy.guides}</Link>
                    <span>/</span>
                    <span>{content.title}</span>
                </nav>

                <header className="space-y-3">
                    <h1 className="text-3xl font-semibold tracking-tight">{content.title}</h1>
                    <p className="text-sm text-muted-foreground leading-6">{content.intro}</p>
                </header>

                <section className="space-y-3">
                    <h2 className="text-2xl font-semibold tracking-tight">{pageCopy.steps}</h2>
                    <ol className="grid gap-3 md:grid-cols-2">
                        {content.steps.map((step, index) => (
                            <li key={step.name} className="rounded-lg border bg-card p-4">
                                <h3 className="font-medium">{index + 1}. {step.name}</h3>
                                <p className="mt-1 text-sm text-muted-foreground leading-6">{step.text}</p>
                            </li>
                        ))}
                    </ol>
                </section>

                <section className="space-y-3">
                    <h2 className="text-2xl font-semibold tracking-tight">{pageCopy.tips}</h2>
                    <ul className="space-y-2">
                        {content.tips.map((tip) => (
                            <li key={tip} className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
                                {tip}
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-2xl font-semibold tracking-tight">{pageCopy.faqSection}</h2>
                    <div className="space-y-3">
                        {content.faq.map((item) => (
                            <article key={item.question} className="rounded-lg border bg-card p-4">
                                <h3 className="font-medium">{item.question}</h3>
                                <p className="mt-1 text-sm text-muted-foreground leading-6">{item.answer}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="space-y-3">
                    <h2 className="text-2xl font-semibold tracking-tight">{pageCopy.related}</h2>
                    <div className="grid gap-2">
                        {relatedGuides.map((item) => {
                            const relatedContent = getLocalizedGuideContent(item, locale)
                            return (
                                <Link
                                    key={item.slug}
                                    href={`/${locale}/guides/${item.slug}`}
                                    className="rounded-lg border bg-card px-4 py-3 text-sm underline-offset-4 hover:underline"
                                >
                                    {relatedContent.title}
                                </Link>
                            )
                        })}
                    </div>
                </section>

                <section className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                        <Link className="underline" href={`/${locale}`}>{pageCopy.downloader}</Link>
                        {' · '}
                        <Link className="underline" href={`/${locale}/faq`}>{pageCopy.faq}</Link>
                    </div>
                </section>
            </div>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />
        </main>
    )
}
