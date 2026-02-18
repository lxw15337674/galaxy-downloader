import { MetadataRoute } from 'next'
import { i18n } from '@/lib/i18n/config'
import { SEO_GUIDES } from '@/lib/guides'
import { IS_INDEXABLE, buildLanguageAlternates, buildLocaleUrl } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
    if (!IS_INDEXABLE) {
        return []
    }

    return i18n.locales.flatMap((locale) => {
        const localeBase = buildLocaleUrl(locale)
        return [
            {
                url: localeBase,
                lastModified: new Date(),
                changeFrequency: 'monthly' as const,
                priority: locale === i18n.defaultLocale ? 1.0 : 0.9,
                alternates: {
                    languages: buildLanguageAlternates(),
                },
            },
            {
                url: `${localeBase}/faq`,
                lastModified: new Date(),
                changeFrequency: 'monthly' as const,
                priority: locale === i18n.defaultLocale ? 0.8 : 0.7,
                alternates: {
                    languages: buildLanguageAlternates('/faq'),
                },
            },
            {
                url: `${localeBase}/guides`,
                lastModified: new Date(),
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
        ]
    })
}
