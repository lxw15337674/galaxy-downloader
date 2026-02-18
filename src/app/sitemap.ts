import { MetadataRoute } from 'next'
import { i18n } from '@/lib/i18n/config'
import { SEO_GUIDES } from '@/lib/guides'
import { IS_INDEXABLE, buildLanguageAlternates, buildLocaleUrl } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
    if (!IS_INDEXABLE) {
        return []
    }

    const staticContentLastModified = new Date('2026-02-18T00:00:00.000Z')
    const guidesLastModified = SEO_GUIDES.reduce((latest, guide) => {
        const guideDate = new Date(guide.updatedAt)
        return guideDate > latest ? guideDate : latest
    }, staticContentLastModified)

    return i18n.locales.flatMap((locale) => {
        const localeBase = buildLocaleUrl(locale)
        return [
            {
                url: localeBase,
                lastModified: staticContentLastModified,
                changeFrequency: 'monthly' as const,
                priority: locale === i18n.defaultLocale ? 1.0 : 0.9,
                alternates: {
                    languages: buildLanguageAlternates(),
                },
            },
            {
                url: `${localeBase}/faq`,
                lastModified: staticContentLastModified,
                changeFrequency: 'monthly' as const,
                priority: locale === i18n.defaultLocale ? 0.8 : 0.7,
                alternates: {
                    languages: buildLanguageAlternates('/faq'),
                },
            },
            {
                url: `${localeBase}/guides`,
                lastModified: guidesLastModified,
                changeFrequency: 'weekly' as const,
                priority: locale === i18n.defaultLocale ? 0.8 : 0.7,
                alternates: {
                    languages: buildLanguageAlternates('/guides'),
                },
            },
            ...SEO_GUIDES.map((guide) => ({
                url: `${localeBase}/guides/${guide.slug}`,
                lastModified: new Date(guide.updatedAt),
                changeFrequency: 'monthly' as const,
                priority: locale === i18n.defaultLocale ? 0.75 : 0.65,
                alternates: {
                    languages: buildLanguageAlternates(`/guides/${guide.slug}`),
                },
            })),
            {
                url: `${localeBase}/privacy`,
                lastModified: staticContentLastModified,
                changeFrequency: 'yearly' as const,
                priority: locale === i18n.defaultLocale ? 0.5 : 0.4,
                alternates: {
                    languages: buildLanguageAlternates('/privacy'),
                },
            },
            {
                url: `${localeBase}/terms`,
                lastModified: staticContentLastModified,
                changeFrequency: 'yearly' as const,
                priority: locale === i18n.defaultLocale ? 0.5 : 0.4,
                alternates: {
                    languages: buildLanguageAlternates('/terms'),
                },
            },
            {
                url: `${localeBase}/contact`,
                lastModified: staticContentLastModified,
                changeFrequency: 'monthly' as const,
                priority: locale === i18n.defaultLocale ? 0.55 : 0.45,
                alternates: {
                    languages: buildLanguageAlternates('/contact'),
                },
            },
        ]
    })
}
