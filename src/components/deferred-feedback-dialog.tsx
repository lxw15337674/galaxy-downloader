'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useDictionary } from '@/i18n/client'

const FeedbackDialog = dynamic(
    () => import('@/components/feedback-dialog').then((m) => m.FeedbackDialog),
    { ssr: false }
)

interface DeferredFeedbackDialogProps {
    triggerClassName?: string
    triggerIconOnly?: boolean
    triggerLabel?: string
}

export function DeferredFeedbackDialog({
    triggerClassName,
    triggerIconOnly = false,
    triggerLabel: triggerLabelOverride,
}: DeferredFeedbackDialogProps) {
    const dict = useDictionary()
    const [mounted, setMounted] = useState(false)
    const triggerLabel = triggerLabelOverride ?? dict.feedback.triggerButton

    if (mounted) {
        return (
            <FeedbackDialog
                triggerClassName={triggerClassName}
                triggerIconOnly={triggerIconOnly}
                triggerLabel={triggerLabelOverride}
                defaultOpen
            />
        )
    }

    return (
        <Button
            variant="ghost"
            size={triggerIconOnly ? 'icon' : 'sm'}
            className={cn('text-sm', triggerClassName)}
            onClick={() => setMounted(true)}
            aria-label={triggerLabel}
        >
            <MessageSquare className={cn('h-4 w-4', !triggerIconOnly && 'mr-1')} />
            {triggerIconOnly ? (
                <span className="sr-only">{triggerLabel}</span>
            ) : (
                triggerLabel
            )}
        </Button>
    )
}
