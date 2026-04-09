import { MetadataRoute } from 'next'
import { i18n } from '@/lib/i18n/config'
import { IS_INDEXABLE, buildLanguageAlternates, buildLocaleUrl } from '@/lib/seo'
import { resolveSitemapLastModified } from '@/lib/seo-sitemap'

export default function sitemap(): MetadataRoute.Sitemap {
    if (!IS_INDEXABLE) {
        return []
    }

    const lastModified = resolveSitemapLastModified(process.env)
    const lastModifiedField = lastModified ? { lastModified } : {}

    return i18n.locales.flatMap((locale) => {
        const localeBase = buildLocaleUrl(locale)
        return [
            {
                url: localeBase,
                ...lastModifiedField,
                changeFrequency: 'monthly' as const,
                priority: locale === i18n.defaultLocale ? 1.0 : 0.9,
                alternates: {
                    languages: buildLanguageAlternates(),
                },
            },
            {
                url: `${localeBase}/privacy`,
                ...lastModifiedField,
                changeFrequency: 'yearly' as const,
                priority: locale === i18n.defaultLocale ? 0.5 : 0.4,
                alternates: {
                    languages: buildLanguageAlternates('/privacy'),
                },
            },
            {
                url: `${localeBase}/terms`,
                ...lastModifiedField,
                changeFrequency: 'yearly' as const,
                priority: locale === i18n.defaultLocale ? 0.5 : 0.4,
                alternates: {
                    languages: buildLanguageAlternates('/terms'),
                },
            },
            {
                url: `${localeBase}/contact`,
                ...lastModifiedField,
                changeFrequency: 'monthly' as const,
                priority: locale === i18n.defaultLocale ? 0.55 : 0.45,
                alternates: {
                    languages: buildLanguageAlternates('/contact'),
                },
            },
        ]
    })
}
