import { MetadataRoute } from 'next'
import { i18n } from '@/lib/i18n/config'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://downloader.bhwa233.com'

    return i18n.locales.flatMap((locale) => {
        const localeBase = `${baseUrl}/${locale}`
        return [
            {
                url: localeBase,
                lastModified: new Date(),
                changeFrequency: 'monthly' as const,
                priority: locale === i18n.defaultLocale ? 1.0 : 0.9,
            },
            {
                url: `${localeBase}/faq`,
                lastModified: new Date(),
                changeFrequency: 'monthly' as const,
                priority: locale === i18n.defaultLocale ? 0.8 : 0.7,
            },
        ]
    })
}
