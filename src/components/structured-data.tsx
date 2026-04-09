import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/types'
import {
    SITE_URL,
    buildLocaleUrl,
    localeToHtmlLang,
    resolveSiteAlternateName,
    sanitizeStructuredDataTextList,
} from '@/lib/seo'

interface StructuredDataProps {
    locale: Locale
    dict: Dictionary
}

export function StructuredData({ locale, dict }: StructuredDataProps) {
    const localeUrl = buildLocaleUrl(locale)
    const seoLocale: keyof Dictionary['seo']['features'] = locale
    const featureList = sanitizeStructuredDataTextList(dict.seo.features[seoLocale])

    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": dict.metadata.siteName,
        "alternateName": resolveSiteAlternateName(locale),
        "description": dict.metadata.description,
        "url": localeUrl,
        "inLanguage": localeToHtmlLang(locale),
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
        "browserRequirements": "Requires JavaScript and a modern web browser.",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "featureList": featureList
    }

    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": dict.metadata.siteName,
        "url": SITE_URL,
        "logo": `${SITE_URL}/icons/icon-512x512.png`,
        "sameAs": [
            "https://github.com/lxw15337674/bilibili-audio-downloader",
        ],
        "contactPoint": [
            {
                "@type": "ContactPoint",
                "contactType": "customer support",
                "url": `${localeUrl}/contact`,
                "availableLanguage": [localeToHtmlLang(locale)],
            },
        ],
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
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(organizationSchema)
                }}
            />
        </>
    )
}
