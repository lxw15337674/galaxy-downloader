import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/types'
import { buildLocaleUrl, localeToHtmlLang } from '@/lib/seo'

interface StructuredDataProps {
    locale: Locale
    dict: Dictionary
}

export function StructuredData({ locale, dict }: StructuredDataProps) {
    const localeUrl = buildLocaleUrl(locale)

    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": dict.metadata.siteName,
        "alternateName": locale === 'en' ? "Universal Media Downloader" : "通用媒体下载器",
        "description": dict.metadata.description,
        "url": localeUrl,
        "inLanguage": localeToHtmlLang(locale),
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": localeUrl
            },
            "query-input": "required name=search_term_string"
        },
        "creator": {
            "@type": "Organization",
            "name": dict.metadata.siteName
        },
        "publisher": {
            "@type": "Organization",
            "name": dict.metadata.siteName
        }
    }

    const webApplicationSchema = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": dict.metadata.siteName,
        "description": dict.metadata.description,
        "url": localeUrl,
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "permissions": "browser",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "featureList": locale === 'en' ? dict.seo.features.en : dict.seo.features.zh
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(websiteSchema)
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(webApplicationSchema)
                }}
            />
        </>
    )
}
