'use client'

import { useCallback, useState } from 'react'

import { HlsBrowserDownloadPanel } from '@/components/hls-browser-download-panel'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { useDictionary } from '@/i18n/client'

export interface HlsDownloadDialogRequest {
    sourceUrl: string
    refererUrl: string
    title?: string
}

interface HlsDownloadDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    request: HlsDownloadDialogRequest | null
}

export function HlsDownloadDialog({
    open,
    onOpenChange,
    request,
}: HlsDownloadDialogProps) {
    const dict = useDictionary()
    const [isBusy, setIsBusy] = useState(false)
    const [confirmCloseOpen, setConfirmCloseOpen] = useState(false)

    const handleOpenChange = useCallback((nextOpen: boolean) => {
        if (!nextOpen && isBusy) {
            setConfirmCloseOpen(true)
            return
        }

        onOpenChange(nextOpen)
    }, [isBusy, onOpenChange])

    const handleConfirmClose = useCallback(() => {
        setConfirmCloseOpen(false)
        onOpenChange(false)
    }, [onOpenChange])

    if (!request) {
        return null
    }

    return (
        <>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent
                    className="flex max-h-[calc(100vh-2rem)] max-w-2xl flex-col overflow-hidden p-4 sm:max-h-[90vh] sm:p-6"
                    onInteractOutside={(event) => {
                        event.preventDefault()
                    }}
                >
                    <DialogHeader>
                        <DialogTitle>{dict.result.browserDownloadVideo}</DialogTitle>
                        <DialogDescription>{dict.hlsDownload.description}</DialogDescription>
                    </DialogHeader>

                    <div
                        className="min-h-0 flex-1 overflow-y-auto pr-1"
                        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0px)' }}
                    >
                        <HlsBrowserDownloadPanel
                            initialSourceUrl={request.sourceUrl}
                            initialRefererUrl={request.refererUrl}
                            initialTitle={request.title}
                            autorun
                            onBusyChange={setIsBusy}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={confirmCloseOpen} onOpenChange={setConfirmCloseOpen}>
                <AlertDialogContent className="sm:max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{dict.hlsDownload.confirmCloseTitle}</AlertDialogTitle>
                        <AlertDialogDescription>{dict.hlsDownload.confirmCloseDescription}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{dict.errors.cancel}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmClose}>
                            {dict.hlsDownload.confirmCloseAction}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
