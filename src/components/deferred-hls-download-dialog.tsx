'use client'

import dynamic from 'next/dynamic'

import type { HlsDownloadDialogRequest } from '@/components/hls-download-dialog'

const HlsDownloadDialog = dynamic(
    () => import('@/components/hls-download-dialog').then((m) => m.HlsDownloadDialog),
    { ssr: false }
)

interface DeferredHlsDownloadDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    request: HlsDownloadDialogRequest | null
}

export function DeferredHlsDownloadDialog({
    open,
    onOpenChange,
    request,
}: DeferredHlsDownloadDialogProps) {
    if (!open || !request) {
        return null
    }

    return (
        <HlsDownloadDialog
            open={open}
            onOpenChange={onOpenChange}
            request={request}
        />
    )
}
