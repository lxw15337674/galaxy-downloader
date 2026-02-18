'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Globe, ChevronDown, Check } from 'lucide-react'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/types'
import { LOCALE_COOKIE_NAME, LOCALE_COOKIE_MAX_AGE } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface LanguageSwitcherProps {
    currentLocale: Locale
    dict: Dictionary
    compact?: boolean
}

function setLocaleCookie(locale: Locale) {
    const secureAttr = window.location.protocol === 'https:' ? '; Secure' : ''
    document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax${secureAttr}`
}

export function LanguageSwitcher({ currentLocale, dict, compact = false }: LanguageSwitcherProps) {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()
    const router = useRouter()
    const dropdownRef = useRef<HTMLDivElement>(null)

    // 移除当前语言前缀，获取路径
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '') || '/'

    // 切换语言
    const handleLanguageChange = (locale: Locale) => {
        if (locale === currentLocale) {
            setIsOpen(false)
            return
        }

        const newPath = `/${locale}${pathWithoutLocale}`

        // 设置 Cookie
        setLocaleCookie(locale)

        // 路由跳转
        router.push(newPath)
        setIsOpen(false)
    }

    // 点击外部关闭下拉菜单
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    // ESC 键关闭
    useEffect(() => {
        function handleEscapeKey(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscapeKey)
            return () => document.removeEventListener('keydown', handleEscapeKey)
        }
    }, [isOpen])

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="ghost"
                size={compact ? 'icon' : 'sm'}
                onClick={() => setIsOpen(!isOpen)}
                className={cn('flex items-center gap-2 text-sm', compact && 'h-9 w-9 p-0')}
                aria-label={dict.languages[currentLocale]}
            >
                <Globe className="h-4 w-4" />
                {compact ? (
                    <span className="sr-only">{dict.languages[currentLocale]}</span>
                ) : (
                    <>
                        <span>{dict.languages[currentLocale]}</span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </>
                )}
            </Button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-background border border-border rounded-md shadow-lg z-50">
                    <div className="py-1">
                        {(Object.entries(dict.languages) as [Locale, string][]).map(([locale, label]) => (
                            <button
                                key={locale}
                                onClick={() => handleLanguageChange(locale)}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 flex items-center justify-between transition-colors"
                            >
                                <span>{label}</span>
                                {locale === currentLocale && (
                                    <Check className="h-4 w-4 text-primary" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
} 
