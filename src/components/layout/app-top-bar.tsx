'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { History, Home, MessageSquare, Music } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DeferredLanguageSwitcher } from '@/components/deferred-language-switcher'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { DeferredChangelogDialog } from '@/components/deferred-changelog-dialog'
import { DeferredMobileNavMenu } from '@/components/deferred-mobile-nav-menu'
import { useDictionary } from '@/i18n/client'
import { i18n } from '@/lib/i18n/config'
import { useTopBarActions } from './top-bar-actions'

interface AppTopBarProps {
    showHistoryShortcut?: boolean
    onHistoryClick?: () => void
    showAudioTool?: boolean
    onAudioToolClick?: () => void
    showHomeButton?: boolean
    homeHref?: string
}

export function AppTopBar({
    showHistoryShortcut = false,
    onHistoryClick,
    showAudioTool = false,
    onAudioToolClick,
    showHomeButton = false,
    homeHref = '/',
}: AppTopBarProps) {
    const dict = useDictionary()
    const { actions } = useTopBarActions()
    const pathname = usePathname()
    const firstSegment = pathname.split('/').filter(Boolean)[0]
    const locale = i18n.locales.includes(firstSegment as (typeof i18n.locales)[number])
        ? firstSegment
        : i18n.defaultLocale
    const feedbackHref = `/${locale}/feedback`
    const resolvedHomeHref = homeHref === '/' ? `/${locale}` : homeHref
    const shouldShowHomeButton = showHomeButton || (pathname !== `/${locale}` && pathname !== `/${locale}/`)
    const effectiveShowHistoryShortcut = showHistoryShortcut || actions.showHistoryShortcut
    const effectiveHistoryClick = onHistoryClick ?? actions.onHistoryClick
    const effectiveShowAudioTool = showAudioTool || actions.showAudioTool
    const effectiveAudioToolClick = onAudioToolClick ?? actions.onAudioToolClick

    return (
        <div
            className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm"
            style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
            <div className="md:hidden px-3 sm:px-4">
                <div className="max-w-7xl mx-auto h-12 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 shrink-0 min-w-0">
                        {shouldShowHomeButton && (
                            <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2" asChild>
                                <Link href={resolvedHomeHref}>
                                    <Home className="h-4 w-4" />
                                    <span className="text-xs">{dict.common.home}</span>
                                </Link>
                            </Button>
                        )}
                        {effectiveShowHistoryShortcut && effectiveHistoryClick && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 max-w-30 gap-1.5 rounded-full px-2.5 text-[11px] font-medium"
                                onClick={effectiveHistoryClick}
                            >
                                <History className="h-3.5 w-3.5" />
                                <span className="truncate">{dict.history.title}</span>
                            </Button>
                        )}
                        {effectiveShowAudioTool && effectiveAudioToolClick && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 max-w-30 gap-1.5 rounded-full px-2.5 text-[11px] font-medium"
                                onClick={effectiveAudioToolClick}
                            >
                                <Music className="h-3.5 w-3.5" />
                                <span className="truncate">{dict.audioTool.triggerButton}</span>
                            </Button>
                        )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link href={feedbackHref} aria-label={dict.feedback.triggerButton}>
                                <MessageSquare className="h-4 w-4" />
                                <span className="sr-only">{dict.feedback.triggerButton}</span>
                            </Link>
                        </Button>
                        <DeferredLanguageSwitcher iconOnly />
                        <DeferredMobileNavMenu />
                    </div>
                </div>
            </div>
            <div className="hidden md:block px-3 sm:px-4 md:px-4">
                <div className="max-w-7xl mx-auto py-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                        {shouldShowHomeButton && (
                            <Button variant="ghost" size="sm" className="gap-1.5" asChild>
                                <Link href={resolvedHomeHref}>
                                    <Home className="h-4 w-4" />
                                    <span>{dict.common.home}</span>
                                </Link>
                            </Button>
                        )}
                        {effectiveShowHistoryShortcut && effectiveHistoryClick && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-1"
                                onClick={effectiveHistoryClick}
                            >
                                <History className="h-4 w-4" />
                                <span>{dict.history.title}</span>
                            </Button>
                        )}
                        {effectiveShowAudioTool && effectiveAudioToolClick && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-1"
                                onClick={effectiveAudioToolClick}
                            >
                                <Music className="h-4 w-4" />
                                <span>{dict.audioTool.triggerButton}</span>
                            </Button>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" asChild>
                            <a href="https://github.com/lxw15337674/galaxy-downloader" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                                <Image
                                    src="/platform-icons/github.svg"
                                    alt=""
                                    width={16}
                                    height={16}
                                    aria-hidden="true"
                                    className="dark:invert"
                                />
                                <span>GitHub</span>
                            </a>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={feedbackHref} className="flex items-center gap-1">
                                <MessageSquare className="h-4 w-4" />
                                <span>{dict.feedback.triggerButton}</span>
                            </Link>
                        </Button>
                        <DeferredChangelogDialog />
                        <ThemeSwitcher />
                        <DeferredLanguageSwitcher />
                    </div>
                </div>
            </div>
        </div>
    )
}
