'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Check, ChevronDown, Laptop, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppLocale } from '@/i18n/client'

interface ThemeSwitcherProps {
    compact?: boolean
    fullWidth?: boolean
}

type ThemeOption = 'light' | 'dark' | 'system'
type DropdownPlacement = 'top' | 'bottom'

interface DropdownPosition {
    top: number
    left: number
    width: number
    maxHeight: number
    placement: DropdownPlacement
}

const THEME_LABELS = {
    zh: {
        title: '主题',
        light: '浅色',
        dark: '深色',
        system: '跟随系统',
    },
    'zh-tw': {
        title: '主題',
        light: '淺色',
        dark: '深色',
        system: '跟隨系統',
    },
    en: {
        title: 'Theme',
        light: 'Light',
        dark: 'Dark',
        system: 'System',
    },
    ja: {
        title: 'テーマ',
        light: 'ライト',
        dark: 'ダーク',
        system: 'システム',
    },
    es: {
        title: 'Tema',
        light: 'Claro',
        dark: 'Oscuro',
        system: 'Sistema',
    },
    ru: {
        title: 'Тема',
        light: 'Светлая',
        dark: 'Темная',
        system: 'Системная',
    },
} as const

function ThemeIcon({ theme }: { theme: ThemeOption }) {
    if (theme === 'light') return <Sun className="h-4 w-4" />
    if (theme === 'dark') return <Moon className="h-4 w-4" />
    return <Laptop className="h-4 w-4" />
}

export function ThemeSwitcher({ compact = false, fullWidth = false }: ThemeSwitcherProps) {
    const locale = useAppLocale()
    const labels = THEME_LABELS[locale]
    const [isOpen, setIsOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLButtonElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition | null>(null)
    const { theme, setTheme } = useTheme()
    const currentTheme = (mounted ? theme : 'system') as ThemeOption

    useEffect(() => {
        setMounted(true)
    }, [])

    const updateDropdownPosition = useCallback(() => {
        const trigger = triggerRef.current
        if (!trigger) return

        const rect = trigger.getBoundingClientRect()
        const viewportPadding = 8
        const gap = 6
        const estimatedHeight = dropdownRef.current?.offsetHeight ?? 180
        const maxWidth = Math.max(120, window.innerWidth - viewportPadding * 2)
        const preferredWidth = fullWidth ? rect.width : Math.max(160, rect.width)
        const width = Math.min(preferredWidth, maxWidth)
        const left = Math.min(
            Math.max(viewportPadding, rect.right - width),
            window.innerWidth - viewportPadding - width,
        )

        const spaceBelow = window.innerHeight - rect.bottom - gap - viewportPadding
        const spaceAbove = rect.top - gap - viewportPadding
        const placement: DropdownPlacement =
            spaceBelow < estimatedHeight && spaceAbove > spaceBelow ? 'top' : 'bottom'

        const maxHeight =
            placement === 'bottom'
                ? Math.max(120, spaceBelow)
                : Math.max(120, spaceAbove)

        setDropdownPosition({
            top: placement === 'bottom' ? rect.bottom + gap : rect.top - gap,
            left,
            width,
            maxHeight,
            placement,
        })
    }, [fullWidth])

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node
            const clickedInsideContainer = containerRef.current?.contains(target)
            const clickedInsideDropdown = dropdownRef.current?.contains(target)

            if (!clickedInsideContainer && !clickedInsideDropdown) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

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

    useEffect(() => {
        if (!isOpen) {
            return
        }

        updateDropdownPosition()
        const raf = requestAnimationFrame(updateDropdownPosition)

        window.addEventListener('resize', updateDropdownPosition)
        window.addEventListener('scroll', updateDropdownPosition, true)

        return () => {
            cancelAnimationFrame(raf)
            window.removeEventListener('resize', updateDropdownPosition)
            window.removeEventListener('scroll', updateDropdownPosition, true)
        }
    }, [isOpen, updateDropdownPosition])

    const optionLabels: Record<ThemeOption, string> = {
        light: labels.light,
        dark: labels.dark,
        system: labels.system,
    }

    const triggerTheme = currentTheme
    const triggerLabel = optionLabels[currentTheme]
    const dropdown = isOpen && dropdownPosition ? (
        <div
            ref={dropdownRef}
            className="z-[70] rounded-md border border-border bg-background shadow-lg"
            style={{
                position: 'fixed',
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                width: `${dropdownPosition.width}px`,
                maxHeight: `${dropdownPosition.maxHeight}px`,
                transform: dropdownPosition.placement === 'top' ? 'translateY(-100%)' : undefined,
                overflowY: 'auto',
            }}
        >
            <div className="py-1">
                {(['light', 'dark', 'system'] as ThemeOption[]).map((option) => (
                    <button
                        key={option}
                        onClick={() => {
                            setTheme(option)
                            setIsOpen(false)
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 flex items-center justify-between transition-colors"
                    >
                        <span className="flex items-center gap-2">
                            <ThemeIcon theme={option} />
                            <span>{optionLabels[option]}</span>
                        </span>
                        {option === currentTheme ? (
                            <Check className="h-4 w-4 text-primary" />
                        ) : null}
                    </button>
                ))}
            </div>
        </div>
    ) : null

    return (
        <div className={cn('relative', fullWidth && 'w-full')} ref={containerRef}>
            <Button
                ref={triggerRef}
                variant="ghost"
                size={compact ? 'icon' : 'sm'}
                onClick={() => setIsOpen((open) => !open)}
                className={cn('flex items-center gap-2 text-sm', compact && 'h-9 w-9 p-0', fullWidth && 'w-full justify-between')}
                aria-label={labels.title}
            >
                <ThemeIcon theme={triggerTheme} />
                {compact ? (
                    <span className="sr-only">{triggerLabel}</span>
                ) : (
                    <>
                        <span>{triggerLabel}</span>
                        <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
                    </>
                )}
            </Button>

            {dropdown ? createPortal(dropdown, document.body) : null}
        </div>
    )
}
