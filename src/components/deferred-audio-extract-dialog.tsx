'use client'

import dynamic from 'next/dynamic'
import type { AudioExtractTask } from '@/components/audio-tool/types'

const AudioExtractDialog = dynamic(
    () => import('@/components/audio-extract-dialog').then((m) => m.AudioExtractDialog),
    { ssr: false }
)

interface DeferredAudioExtractDialogProps {
    mounted: boolean
    open: boolean
    onOpenChange: (open: boolean) => void
    entry?: 'toolbar' | 'result'
    autoExtractTask?: AudioExtractTask | null
}

export function DeferredAudioExtractDialog({
    mounted,
    open,
    onOpenChange,
    entry = 'toolbar',
    autoExtractTask = null,
}: DeferredAudioExtractDialogProps) {
    if (!mounted) {
        return null
    }

    return (
        <AudioExtractDialog
            open={open}
            onOpenChange={onOpenChange}
            entry={entry}
            autoExtractTask={autoExtractTask}
        />
    )
}
