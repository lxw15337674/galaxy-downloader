import type { Locale } from "@/lib/i18n/config"
import { buildLocaleUrl, localeToHtmlLang } from "@/lib/seo"

interface BreadcrumbItem {
    name: string
    path?: string
}

interface PageStructuredDataProps {
    locale: Locale
    pageTitle: string
    pageDescription: string
    path: string
    breadcrumbs: BreadcrumbItem[]
}

export function PageStructuredData({
    locale,
    pageTitle,
    pageDescription,
    path,
    breadcrumbs,
}: PageStructuredDataProps) {
    const pageUrl = buildLocaleUrl(locale, path)

    const webPageSchema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": pageTitle,
        "description": pageDescription,
        "url": pageUrl,
        "inLanguage": localeToHtmlLang(locale),
        "isPartOf": {
            "@type": "WebSite",
            "url": buildLocaleUrl(locale),
        },
    }

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": buildLocaleUrl(locale, item.path ?? ""),
        })),
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
        </>
    )
}
