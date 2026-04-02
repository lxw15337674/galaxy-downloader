'use client'

import type { ChangeEvent, DragEvent, ReactNode } from 'react'

import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useDictionary } from '@/i18n/client'
import { formatBytes } from '@/lib/utils'

import { FileDropzone } from './file-dropzone'

interface MergePanelProps {
    mergeVideoFile: File | null
    mergeAudioFile: File | null
    videoInputId: string
    audioInputId: string
    isBusy: boolean
    statusPanel: ReactNode
    onVideoSelect: (event: ChangeEvent<HTMLInputElement>) => void
    onAudioSelect: (event: ChangeEvent<HTMLInputElement>) => void
    onVideoDrop: (event: DragEvent<HTMLDivElement>) => void
    onAudioDrop: (event: DragEvent<HTMLDivElement>) => void
    onDragOver: (event: DragEvent<HTMLDivElement>) => void
    onClearVideo: () => void
    onClearAudio: () => void
    onSubmit: () => void
}

export function MergePanel({
    mergeVideoFile,
    mergeAudioFile,
    videoInputId,
    audioInputId,
    isBusy,
    statusPanel,
    onVideoSelect,
    onAudioSelect,
    onVideoDrop,
    onAudioDrop,
    onDragOver,
    onClearVideo,
    onClearAudio,
    onSubmit,
}: MergePanelProps) {
    const dict = useDictionary()

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                <FileDropzone
                    acceptedFile={mergeVideoFile}
                    title={dict.audioTool.videoFile}
                    hint={dict.audioTool.dropHint}
                    limitText={dict.audioTool.videoSizeLimit}
                    emptyButtonLabel={mergeVideoFile ? dict.audioTool.changeVideoButton : dict.audioTool.selectVideoButton}
                    selectedLabel={mergeVideoFile
                        ? dict.audioTool.videoSelected
                            .replace('{name}', mergeVideoFile.name)
                            .replace('{size}', formatBytes(mergeVideoFile.size))
                        : ''}
                    inputId={videoInputId}
                    accept="video/*,.mp4,.webm,.mov,.mkv,.avi,.mpeg,.mpg"
                    isBusy={isBusy}
                    onSelect={onVideoSelect}
                    onDrop={onVideoDrop}
                    onDragOver={onDragOver}
                    onClear={onClearVideo}
                />

                <FileDropzone
                    acceptedFile={mergeAudioFile}
                    title={dict.audioTool.audioFile}
                    hint={dict.audioTool.dropHint}
                    limitText={dict.audioTool.audioSizeLimit}
                    emptyButtonLabel={mergeAudioFile ? dict.audioTool.changeAudioButton : dict.audioTool.selectAudioButton}
                    selectedLabel={mergeAudioFile
                        ? dict.audioTool.audioSelected
                            .replace('{name}', mergeAudioFile.name)
                            .replace('{size}', formatBytes(mergeAudioFile.size))
                        : ''}
                    inputId={audioInputId}
                    accept="audio/*,.mp3,.aac,.wav,.ogg,.flac,.m4a"
                    isBusy={isBusy}
                    onSelect={onAudioSelect}
                    onDrop={onAudioDrop}
                    onDragOver={onDragOver}
                    onClear={onClearAudio}
                />
            </div>

            {statusPanel}

            <Button
                type="button"
                className="w-full flex items-center justify-center gap-2"
                onClick={onSubmit}
                disabled={isBusy || !mergeVideoFile || !mergeAudioFile}
            >
                {isBusy && <Loader2 className="h-4 w-4 animate-spin" />}
                {isBusy ? dict.audioTool.processingButton : dict.audioTool.mergeButton}
            </Button>
        </div>
    )
}
