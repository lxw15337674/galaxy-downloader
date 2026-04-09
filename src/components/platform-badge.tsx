'use client'

import { useDictionary } from '@/i18n/client'
import { getPlatformBadge } from '@/lib/platforms'
import { cn } from '@/lib/utils'

interface PlatformBadgeProps {
    platform: string | null | undefined
    className?: string
}

export function PlatformBadge({ platform, className }: PlatformBadgeProps) {
    const dict = useDictionary()
    const badge = getPlatformBadge(platform, dict)

    return (
        <span className={cn('inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md', badge.className, className)}>
            {badge.text}
        </span>
    )
}
