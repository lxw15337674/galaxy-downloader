'use client'

import type { ChangeEvent, DragEvent, ReactNode } from 'react'

import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useDictionary } from '@/i18n/client'
import { formatBytes } from '@/lib/utils'

import { FileDropzone } from './file-dropzone'

interface FileExtractPanelProps {
    selectedFile: File | null
    inputId: string
    isBusy: boolean
    statusPanel: ReactNode
    onSelect: (event: ChangeEvent<HTMLInputElement>) => void
    onDrop: (event: DragEvent<HTMLDivElement>) => void
    onDragOver: (event: DragEvent<HTMLDivElement>) => void
    onClear: () => void
    onSubmit: () => void
}

export function FileExtractPanel({
    selectedFile,
    inputId,
    isBusy,
    statusPanel,
    onSelect,
    onDrop,
    onDragOver,
    onClear,
    onSubmit,
}: FileExtractPanelProps) {
    const dict = useDictionary()

    return (
        <div className="space-y-4">
            <FileDropzone
                acceptedFile={selectedFile}
                title={dict.audioTool.videoFile}
                hint={dict.audioTool.dropHint}
                limitText={dict.audioTool.fileSizeLimit}
                emptyButtonLabel={selectedFile ? dict.audioTool.changeFileButton : dict.audioTool.selectFileButton}
                selectedLabel={selectedFile
                    ? dict.audioTool.fileSelected
                        .replace('{name}', selectedFile.name)
                        .replace('{size}', formatBytes(selectedFile.size))
                    : ''}
                inputId={inputId}
                accept="video/*,.mp4,.webm,.mov,.mkv,.avi,.mpeg,.mpg"
                isBusy={isBusy}
                onSelect={onSelect}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onClear={onClear}
            />

            {statusPanel}

            <Button
                type="button"
                className="w-full flex items-center justify-center gap-2"
                onClick={onSubmit}
                disabled={isBusy || !selectedFile}
            >
                {isBusy && <Loader2 className="h-4 w-4 animate-spin" />}
                {isBusy ? dict.audioTool.processingButton : dict.audioTool.submitButton}
            </Button>
        </div>
    )
}
