import { i18n, type Locale } from "@/lib/i18n/config"

const PRODUCTION_SITE_URL = "https://downloader.bhwa233.com"

function normalizeSiteUrl(url: string | undefined): string | null {
    if (!url) return null

    try {
        return new URL(url).toString().replace(/\/$/, "")
    } catch {
        return null
    }
}

function normalizePath(path = ""): string {
    if (!path) return ""
    return path.startsWith("/") ? path : `/${path}`
}

const explicitIndexableFlag = process.env.SEO_INDEXABLE ?? process.env.NEXT_PUBLIC_SEO_INDEXABLE
const isVercel = typeof process.env.VERCEL_ENV === "string"

export const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ?? PRODUCTION_SITE_URL
export const IS_INDEXABLE = explicitIndexableFlag
    ? explicitIndexableFlag === "true"
    : isVercel
      ? process.env.VERCEL_ENV === "production"
      : false

export function localeToHrefLang(locale: Locale): string {
    if (locale === "zh") return "zh-CN"
    if (locale === "zh-tw") return "zh-TW"
    return "en"
}

export function localeToOpenGraphLocale(locale: Locale): string {
    if (locale === "zh") return "zh_CN"
    if (locale === "zh-tw") return "zh_TW"
    return "en_US"
}

export function localeToHtmlLang(locale: Locale): string {
    if (locale === "zh") return "zh-CN"
    if (locale === "zh-tw") return "zh-TW"
    return "en"
}

export function buildLocaleUrl(locale: Locale, path = ""): string {
    return `${SITE_URL}/${locale}${normalizePath(path)}`
}

export function buildXDefaultUrl(path = ""): string {
    const normalizedPath = normalizePath(path)
    return normalizedPath ? `${SITE_URL}${normalizedPath}` : SITE_URL
}

export function buildLanguageAlternates(path = ""): Record<string, string> {
    const alternates: Record<string, string> = {}
    for (const locale of i18n.locales) {
        alternates[localeToHrefLang(locale)] = buildLocaleUrl(locale, path)
    }

    alternates["x-default"] = buildXDefaultUrl(path)
    return alternates
}
