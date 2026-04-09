import { match } from '@formatjs/intl-localematcher'

export const BOT_USER_AGENT_PATTERN =
    /googlebot|bingbot|yandex|baiduspider|slurp|duckduckbot|bytespider|petalbot|applebot|facebookexternalhit|twitterbot|linkedinbot/i

export const LOCALE_REDIRECT_VARY_HEADERS = [
    'Accept-Language',
    'Cookie',
    'User-Agent',
] as const

const localeMapping: Record<string, string> = {
    'zh-TW': 'zh-tw',
    'zh-HK': 'zh-tw',
    'zh-MO': 'zh-tw',
    'zh-Hant': 'zh-tw',
    'zh-Hant-TW': 'zh-tw',
    'zh-Hant-HK': 'zh-tw',
    'zh-Hant-MO': 'zh-tw',
    'zh-CN': 'zh',
    'zh-Hans': 'zh',
    'zh-Hans-CN': 'zh',
    'zh': 'zh',
    'ja-JP': 'ja',
    'ja': 'ja',
}

export function isBotUserAgent(userAgent: string): boolean {
    return BOT_USER_AGENT_PATTERN.test(userAgent)
}

export function normalizeCookieLocale(
    cookieLocale: string | null,
    locales: readonly string[]
): string | null {
    if (!cookieLocale) return null
    return locales.includes(cookieLocale) ? cookieLocale : null
}

export function resolveLocaleFromAcceptLanguage(
    languages: string[],
    locales: readonly string[],
    defaultLocale: string
): string {
    for (const lang of languages) {
        if (localeMapping[lang]) {
            return localeMapping[lang]
        }
    }

    try {
        return match(languages, locales, defaultLocale)
    } catch {
        return defaultLocale
    }
}

interface ResolveLocaleOptions {
    pathname: string
    userAgent: string
    cookieLocale: string | null
    acceptLanguages: string[]
    locales: readonly string[]
    defaultLocale: string
}

export function resolveLocaleForRequest({
    pathname,
    userAgent,
    cookieLocale,
    acceptLanguages,
    locales,
    defaultLocale,
}: ResolveLocaleOptions): string {
    const pathnameLocale = locales.find(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    )
    if (pathnameLocale) {
        return pathnameLocale
    }

    const normalizedCookieLocale = normalizeCookieLocale(cookieLocale, locales)
    if (!isBotUserAgent(userAgent) && normalizedCookieLocale) {
        return normalizedCookieLocale
    }

    return resolveLocaleFromAcceptLanguage(acceptLanguages, locales, defaultLocale)
}
