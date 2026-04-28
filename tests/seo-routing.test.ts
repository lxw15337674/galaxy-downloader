import { describe, expect, it } from 'vitest'

import {
    LOCALE_REDIRECT_VARY_HEADERS,
    isBotUserAgent,
    resolveLocaleForRequest,
    resolveLocaleFromAcceptLanguage,
} from '../src/lib/seo-routing.ts'

const locales = ['zh', 'zh-tw', 'en', 'ja', 'es', 'ru'] as const
const defaultLocale = 'en'

describe('seo routing', () => {
it('detects bot user agents', () => {
    expect(isBotUserAgent('Mozilla/5.0 Googlebot/2.1')).toBe(true)
    expect(isBotUserAgent('Mozilla/5.0 AppleWebKit Safari')).toBe(false)
})

it('returns locale from pathname when locale prefix exists', () => {
    const locale = resolveLocaleForRequest({
        pathname: '/en/contact',
        userAgent: 'Mozilla/5.0',
        cookieLocale: 'zh',
        acceptLanguages: ['zh-CN'],
        locales,
        defaultLocale,
    })
    expect(locale).toBe('en')
})

it('uses cookie locale for normal users when no locale prefix', () => {
    const locale = resolveLocaleForRequest({
        pathname: '/contact',
        userAgent: 'Mozilla/5.0',
        cookieLocale: 'zh-tw',
        acceptLanguages: ['en-US'],
        locales,
        defaultLocale,
    })
    expect(locale).toBe('zh-tw')
})

it('bots ignore cookie locale and use accept-language', () => {
    const locale = resolveLocaleForRequest({
        pathname: '/contact',
        userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        cookieLocale: 'zh',
        acceptLanguages: ['en-US', 'en'],
        locales,
        defaultLocale,
    })
    expect(locale).toBe('en')
})

it('accept-language mapping supports zh-Hant fallback to zh-tw', () => {
    expect(resolveLocaleFromAcceptLanguage(['zh-Hant', 'en-US'], locales, defaultLocale)).toBe('zh-tw')
})

it('accept-language mapping supports ja fallback to ja', () => {
    expect(resolveLocaleFromAcceptLanguage(['ja-JP', 'en-US'], locales, defaultLocale)).toBe('ja')
})

it('accept-language mapping supports es fallback to es', () => {
    expect(resolveLocaleFromAcceptLanguage(['es-ES', 'en-US'], locales, defaultLocale)).toBe('es')
})

it('accept-language mapping supports ru fallback to ru', () => {
    expect(resolveLocaleFromAcceptLanguage(['ru-RU', 'en-US'], locales, defaultLocale)).toBe('ru')
})

it('falls back to default locale for unsupported accept-language', () => {
    expect(resolveLocaleFromAcceptLanguage(['fr-FR'], locales, defaultLocale)).toBe('en')
})

it('defines stable vary headers for locale redirects', () => {
    expect(LOCALE_REDIRECT_VARY_HEADERS).toEqual([
        'Accept-Language',
        'Cookie',
        'User-Agent',
    ])
})
})
