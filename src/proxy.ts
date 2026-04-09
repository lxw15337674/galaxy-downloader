import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { i18n } from './lib/i18n/config'
import {
    LOCALE_REDIRECT_VARY_HEADERS,
    isBotUserAgent,
    normalizeCookieLocale,
    resolveLocaleForRequest,
} from './lib/seo-routing'
import { appendVaryHeader } from './lib/seo'
import { LOCALE_COOKIE_NAME, LOCALE_COOKIE_MAX_AGE } from './lib/constants'

const ACCEPT_LANGUAGE_CACHE_LIMIT = 64
const acceptLanguageCache = new Map<string, string[]>()

function getLocaleFromCookie(request: NextRequest): string | null {
    const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value
    return normalizeCookieLocale(cookieLocale ?? null, i18n.locales)
}

function getAcceptedLanguages(request: NextRequest): string[] {
    const header = request.headers.get('accept-language')
    if (!header) {
        return []
    }

    const cached = acceptLanguageCache.get(header)
    if (cached) {
        return cached
    }

    const parsed = header
        .split(',')
        .map((part) => {
            const [tagPart, qualityPart] = part.trim().split(';q=')
            const tag = tagPart.trim()
            const quality = qualityPart ? Number.parseFloat(qualityPart) : 1
            return { tag, quality: Number.isFinite(quality) ? quality : 0 }
        })
        .filter((item) => item.tag.length > 0)
        .sort((a, b) => b.quality - a.quality)
        .map((item) => item.tag)

    if (acceptLanguageCache.size >= ACCEPT_LANGUAGE_CACHE_LIMIT) {
        const oldestKey = acceptLanguageCache.keys().next().value
        if (oldestKey) {
            acceptLanguageCache.delete(oldestKey)
        }
    }
    acceptLanguageCache.set(header, parsed)

    return parsed
}

export function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname
    const userAgent = request.headers.get('user-agent') || ''
    const cookieLocale = getLocaleFromCookie(request)

    // 跳过 API 路由和静态文件
    if (
        pathname.startsWith('/api/') ||
        pathname.startsWith('/_next/') ||
        pathname.includes('.')
    ) {
        return NextResponse.next()
    }

    // 检查路径名中是否有任何支持的区域设置
    const pathnameHasLocale = i18n.locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    )

    if (pathnameHasLocale) {
        return NextResponse.next()
    }

    // 如果没有区域设置则重定向
    const locale = resolveLocaleForRequest({
        pathname,
        userAgent,
        cookieLocale,
        acceptLanguages: getAcceptedLanguages(request),
        locales: i18n.locales,
        defaultLocale: i18n.defaultLocale,
    })
    request.nextUrl.pathname = `/${locale}${pathname}`

    const response = NextResponse.redirect(request.nextUrl)
    appendVaryHeader(response.headers, [...LOCALE_REDIRECT_VARY_HEADERS])

    // 设置 Cookie 记住用户语言偏好（仅在真实用户请求且非已有 cookie 时设置）
    if (!isBotUserAgent(userAgent) && !cookieLocale) {
        response.cookies.set(LOCALE_COOKIE_NAME, locale, {
            path: '/',
            maxAge: LOCALE_COOKIE_MAX_AGE,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
        })
    }

    return response
}

export default proxy

export const config = {
    matcher: [
        // 仅匹配“无 locale 前缀”的页面请求，减少中间件对已本地化路由的额外开销
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.|(?:zh|zh-tw|en|ja)(?:/|$)).*)',
    ],
} 
