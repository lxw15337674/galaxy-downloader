import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/types'
import { SITE_URL, buildLocaleUrl, localeToHtmlLang } from '@/lib/seo'

interface StructuredDataProps {
    locale: Locale
    dict: Dictionary
}

export function StructuredData({ locale, dict }: StructuredDataProps) {
    const localeUrl = buildLocaleUrl(locale)
    const seoLocale: keyof Dictionary['seo']['features'] = locale === 'zh-tw'
        ? 'zh-tw'
        : locale === 'en'
          ? 'en'
          : 'zh'

    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": dict.metadata.siteName,
        "alternateName": locale === 'en' ? "Universal Media Downloader" : "通用媒体下载器",
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
        "permissions": "browser",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "featureList": dict.seo.features[seoLocale]
    }

    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": dict.metadata.siteName,
        "url": SITE_URL,
        "logo": `${SITE_URL}/favicon.ico`,
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
