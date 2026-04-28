import { i18n, type Locale } from "@/lib/i18n/config"

const PRODUCTION_SITE_URL = "https://downloader.bhwa233.com"
const DEVELOPMENT_SITE_URL = "http://localhost:3010"

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
const defaultSiteUrl = process.env.NODE_ENV === "production"
    ? PRODUCTION_SITE_URL
    : DEVELOPMENT_SITE_URL

export const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ?? defaultSiteUrl
export const IS_INDEXABLE = explicitIndexableFlag
    ? explicitIndexableFlag === "true"
    : isVercel
      ? process.env.VERCEL_ENV === "production"
      : process.env.NODE_ENV === "production"

export function localeToHrefLang(locale: Locale): string {
    if (locale === "zh") return "zh-CN"
    if (locale === "zh-tw") return "zh-TW"
    if (locale === "ja") return "ja-JP"
    if (locale === "es") return "es-ES"
    if (locale === "ru") return "ru-RU"
    return "en"
}

export function localeToOpenGraphLocale(locale: Locale): string {
    if (locale === "zh") return "zh_CN"
    if (locale === "zh-tw") return "zh_TW"
    if (locale === "ja") return "ja_JP"
    if (locale === "es") return "es_ES"
    if (locale === "ru") return "ru_RU"
    return "en_US"
}

export function localeToHtmlLang(locale: Locale): string {
    if (locale === "zh") return "zh-CN"
    if (locale === "zh-tw") return "zh-TW"
    if (locale === "ja") return "ja-JP"
    if (locale === "es") return "es-ES"
    if (locale === "ru") return "ru-RU"
    return "en"
}

export function resolveSiteAlternateName(_locale: Locale): string {
    return "sparkdownloader"
}

export function sanitizeStructuredDataTextList(values: string[]): string[] {
    const seen = new Set<string>()

    return values
        .map((value) => value.trim())
        .filter((value) => value.length > 0)
        .filter((value) => !/^[?？]+$/.test(value))
        .filter((value) => {
            if (seen.has(value)) {
                return false
            }

            seen.add(value)
            return true
        })
}

function normalizeHeaderToken(value: string): string {
    return value.trim().toLowerCase()
}

export function appendVaryHeader(headers: Headers, values: string[]): void {
    const existing = headers.get("Vary")
    const merged = new Map<string, string>()

    if (existing) {
        for (const value of existing.split(",")) {
            const trimmed = value.trim()
            if (!trimmed) continue
            merged.set(normalizeHeaderToken(trimmed), trimmed)
        }
    }

    for (const value of values) {
        const trimmed = value.trim()
        if (!trimmed) continue
        merged.set(normalizeHeaderToken(trimmed), trimmed)
    }

    if (merged.size > 0) {
        headers.set("Vary", Array.from(merged.values()).join(", "))
    }
}

export function setXRobotsTag(headers: Headers, directives: string[]): void {
    const sanitized = directives
        .map((directive) => directive.trim().toLowerCase())
        .filter((directive) => directive.length > 0)

    if (sanitized.length === 0) {
        headers.delete("X-Robots-Tag")
        return
    }

    headers.set("X-Robots-Tag", Array.from(new Set(sanitized)).join(", "))
}

export function buildLocaleUrl(locale: Locale, path = ""): string {
    return `${SITE_URL}/${locale}${normalizePath(path)}`
}

export function buildXDefaultUrl(path = ""): string {
    return buildLocaleUrl(i18n.defaultLocale, path)
}

export function buildLanguageAlternates(path = ""): Record<string, string> {
    const alternates: Record<string, string> = {}
    for (const locale of i18n.locales) {
        alternates[localeToHrefLang(locale)] = buildLocaleUrl(locale, path)
    }

    alternates["x-default"] = buildXDefaultUrl(path)
    return alternates
}

export function buildOpenGraphLocaleAlternates(locale: Locale): string[] {
    return i18n.locales
        .filter((item) => item !== locale)
        .map((item) => localeToOpenGraphLocale(item))
}
