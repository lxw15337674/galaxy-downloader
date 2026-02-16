'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollText } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/types'
import changelogData from '@/lib/changelog.json'
import { cn } from '@/lib/utils'

interface ChangelogDialogProps {
    locale: Locale
    dict: Dictionary
    triggerClassName?: string
    triggerIconOnly?: boolean
    onTriggerClick?: () => void
}

export function ChangelogDialog({ locale, dict, triggerClassName, triggerIconOnly = false, onTriggerClick }: ChangelogDialogProps) {
    const [open, setOpen] = useState(false)

    // 获取当前语言的更新内容，如果没有则回退到英文
    const getChanges = (changes: Record<string, string[]>) => {
        return changes[locale] || changes['en'] || []
    }

    const title = dict.changelog?.title || '更新日志'

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size={triggerIconOnly ? 'icon' : 'sm'}
                    className={cn('text-sm', triggerClassName)}
                    onClick={onTriggerClick}
                    aria-label={title}
                >
                    <ScrollText className={cn('h-4 w-4', !triggerIconOnly && 'mr-1')} />
                    {triggerIconOnly ? <span className="sr-only">{title}</span> : title}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] pr-2">
                    <div className="space-y-6">
                        {changelogData.versions.map((version) => (
                            <div key={version.version} className="border-b border-border pb-4 last:border-b-0 last:pb-0">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-semibold">v{version.version}</span>
                                    <span className="text-sm text-muted-foreground">{version.date}</span>
                                </div>
                                <ul className="space-y-2 pl-1">
                                    {getChanges(version.changes).map((change, index) => (
                                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                            <span className="text-primary shrink-0">•</span>
                                            <span>{change}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
