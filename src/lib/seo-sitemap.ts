export function resolveSitemapLastModified(
    env: Record<string, string | undefined>
): Date | undefined {
    const rawDate = env.SITEMAP_LASTMOD ?? env.VERCEL_GIT_COMMIT_DATE
    if (!rawDate) return undefined

    const parsed = new Date(rawDate)
    if (Number.isNaN(parsed.getTime())) {
        return undefined
    }

    return parsed
}
