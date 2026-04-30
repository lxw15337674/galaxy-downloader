'use client'

import { useDictionary } from '@/i18n/client'
import { Badge } from '@/components/ui/badge'
import { getPlatformBadge } from '@/lib/platforms'

interface PlatformBadgeProps {
    platform: string | null | undefined
}

export function PlatformBadge({ platform }: PlatformBadgeProps) {
    const dict = useDictionary()
    const badge = getPlatformBadge(platform, dict)

    return (
        <Badge  variant="outline">
            {badge.text}
        </Badge>
    )
}
