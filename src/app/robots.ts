import { MetadataRoute } from 'next'
import { IS_INDEXABLE, SITE_URL } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
    if (!IS_INDEXABLE) {
        return {
            rules: {
                userAgent: '*',
                disallow: '/',
            },
        }
    }

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/'],
        },
        sitemap: `${SITE_URL}/sitemap.xml`,
    }
}
