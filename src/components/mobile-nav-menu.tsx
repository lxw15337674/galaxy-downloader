'use client'

import { useCallback, useState } from 'react'
import { Github, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { ChangelogDialog } from '@/components/changelog-dialog'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { useDictionary } from '@/i18n/client'

interface MobileNavMenuProps {
    defaultOpen?: boolean
}

export function MobileNavMenu({
    defaultOpen = false,
}: MobileNavMenuProps) {
    const dict = useDictionary()
    const [open, setOpen] = useState(defaultOpen)
    const [dialogContentEl, setDialogContentEl] = useState<HTMLDivElement | null>(null)
    const handleDialogContentRef = useCallback((node: HTMLDivElement | null) => {
        setDialogContentEl(node)
    }, [])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={dict.page.openMenuLabel}>
                    <Menu className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent
                ref={handleDialogContentRef}
                showCloseButton={false}
                className="top-auto bottom-4 left-1/2 w-[calc(100%-2rem)] max-w-sm translate-x-[-50%] translate-y-0 rounded-xl p-4"
            >
                <DialogHeader className="sr-only">
                    <DialogTitle>{dict.page.openMenuLabel}</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" asChild>
                        <a
                            href="https://github.com/lxw15337674/galaxy-downloader"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setOpen(false)}
                        >
                            <Github className="h-4 w-4" />
                            <span>GitHub</span>
                        </a>
                    </Button>
                    <ChangelogDialog triggerClassName="w-full justify-start" />
                    <div className="rounded-md border border-border p-1">
                        <ThemeSwitcher fullWidth portalContainer={dialogContentEl} />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
