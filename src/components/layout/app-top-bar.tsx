'use client'

import Link from 'next/link'
import Image from 'next/image'
import { History, Home, Music } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DeferredLanguageSwitcher } from '@/components/deferred-language-switcher'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { DeferredFeedbackDialog } from '@/components/deferred-feedback-dialog'
import { DeferredChangelogDialog } from '@/components/deferred-changelog-dialog'
import { DeferredMobileNavMenu } from '@/components/deferred-mobile-nav-menu'
import { useDictionary } from '@/i18n/client'

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

    return (
        <div
            className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm"
            style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
            <div className="md:hidden px-3 sm:px-4">
                <div className="max-w-7xl mx-auto h-12 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 shrink-0 min-w-0">
                        {showHomeButton && (
                            <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2" asChild>
                                <Link href={homeHref}>
                                    <Home className="h-4 w-4" />
                                    <span className="text-xs">{dict.common.home}</span>
                                </Link>
                            </Button>
                        )}
                        {showHistoryShortcut && onHistoryClick && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 max-w-30 gap-1.5 rounded-full px-2.5 text-[11px] font-medium"
                                onClick={onHistoryClick}
                            >
                                <History className="h-3.5 w-3.5" />
                                <span className="truncate">{dict.history.title}</span>
                            </Button>
                        )}
                        {showAudioTool && onAudioToolClick && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 max-w-30 gap-1.5 rounded-full px-2.5 text-[11px] font-medium"
                                onClick={onAudioToolClick}
                            >
                                <Music className="h-3.5 w-3.5" />
                                <span className="truncate">{dict.audioTool.triggerButton}</span>
                            </Button>
                        )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        <DeferredFeedbackDialog triggerIconOnly triggerClassName="h-8 w-8" />
                        <DeferredLanguageSwitcher iconOnly />
                        <DeferredMobileNavMenu />
                    </div>
                </div>
            </div>
            <div className="hidden md:block px-3 sm:px-4 md:px-4">
                <div className="max-w-7xl mx-auto py-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                        {showHistoryShortcut && onHistoryClick && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-1"
                                onClick={onHistoryClick}
                            >
                                <History className="h-4 w-4" />
                                <span>{dict.history.title}</span>
                            </Button>
                        )}
                        {showAudioTool && onAudioToolClick && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-1"
                                onClick={onAudioToolClick}
                            >
                                <Music className="h-4 w-4" />
                                <span>{dict.audioTool.triggerButton}</span>
                            </Button>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        {showHomeButton && (
                            <Button variant="ghost" size="sm" className="gap-1.5" asChild>
                                <Link href={homeHref}>
                                    <Home className="h-4 w-4" />
                                    <span>{dict.common.home}</span>
                                </Link>
                            </Button>
                        )}
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
                        <DeferredFeedbackDialog />
                        <DeferredChangelogDialog />
                        <ThemeSwitcher />
                        <DeferredLanguageSwitcher />
                    </div>
                </div>
            </div>
        </div>
    )
}
