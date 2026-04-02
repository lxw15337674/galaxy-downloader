'use client'

import { useCallback, useEffect, useId, useMemo, useState, type ChangeEvent, type DragEvent } from 'react'

import { AlertCircle, CheckCircle2, Loader2, Music } from 'lucide-react'
import * as Tabs from '@radix-ui/react-tabs'

import { FileExtractPanel } from '@/components/audio-tool/file-extract-panel'
import { MergePanel } from '@/components/audio-tool/merge-panel'
import { ResultAutoExtractPanel } from '@/components/audio-tool/result-auto-extract-panel'
import type { AudioExtractTask, AudioToolStage, ExtractMode } from '@/components/audio-tool/types'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { useFFmpeg, type FFmpegStatus } from '@/hooks/use-ffmpeg'
import { useDictionary } from '@/i18n/client'
import { isApiRequestError, resolveApiErrorMessage } from '@/lib/api-errors'
import { toast } from '@/lib/deferred-toast'
import { requestUnifiedParse } from '@/lib/unified-parse'
import { cn, downloadFile, formatBytes } from '@/lib/utils'

interface AudioExtractDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    entry?: 'toolbar' | 'result'
    autoExtractTask?: AudioExtractTask | null
}

const MAX_VIDEO_FILE_SIZE = 500 * 1024 * 1024
const MAX_AUDIO_FILE_SIZE = 100 * 1024 * 1024
const MAX_TOTAL_MERGE_SIZE = 800 * 1024 * 1024

const SUPPORTED_VIDEO_TYPES = new Set([
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-matroska',
    'video/avi',
    'video/mpeg',
])

const SUPPORTED_AUDIO_TYPES = new Set([
    'audio/mpeg',
    'audio/mp3',
    'audio/aac',
    'audio/x-aac',
    'audio/wav',
    'audio/x-wav',
    'audio/wave',
    'audio/ogg',
    'audio/flac',
    'audio/x-flac',
    'audio/mp4',
    'audio/x-m4a',
])

const VIDEO_EXTENSIONS = new Set(['mp4', 'webm', 'mov', 'mkv', 'avi', 'mpeg', 'mpg'])
const AUDIO_EXTENSIONS = new Set(['mp3', 'aac', 'wav', 'ogg', 'flac', 'm4a'])

function getFileExtension(file: File): string {
    const match = /\.([a-z0-9]+)$/i.exec(file.name)
    return match?.[1]?.toLowerCase() ?? ''
}

function isSupportedVideoFile(file: File): boolean {
    const extension = getFileExtension(file)
    if (VIDEO_EXTENSIONS.has(extension)) {
        return true
    }

    return !!file.type && (SUPPORTED_VIDEO_TYPES.has(file.type) || file.type.startsWith('video/'))
}

function isSupportedAudioFile(file: File): boolean {
    const extension = getFileExtension(file)
    if (AUDIO_EXTENSIONS.has(extension)) {
        return true
    }

    return !!file.type && (SUPPORTED_AUDIO_TYPES.has(file.type) || file.type.startsWith('audio/'))
}

export function AudioExtractDialog({
    open,
    onOpenChange,
    entry = 'toolbar',
    autoExtractTask = null,
}: AudioExtractDialogProps) {
    const dict = useDictionary()
    const extractFileInputId = useId()
    const mergeVideoInputId = useId()
    const mergeAudioInputId = useId()
    const [mode, setMode] = useState<ExtractMode>('file')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [mergeVideoFile, setMergeVideoFile] = useState<File | null>(null)
    const [mergeAudioFile, setMergeAudioFile] = useState<File | null>(null)
    const [stage, setStage] = useState<AudioToolStage>('idle')
    const [errorMessage, setErrorMessage] = useState('')
    const { status, progress, progressInfo, error, extractAudio, extractAudioFromFile, mergeVideoAndAudio, reset, cancel } = useFFmpeg()
    const autoTaskKey = autoExtractTask
        ? `${autoExtractTask.audioUrl ?? ''}::${autoExtractTask.videoUrl ?? ''}::${autoExtractTask.sourceUrl ?? ''}::${autoExtractTask.title ?? ''}`
        : null

    const ffmpegProcessing = useMemo(
        () => ([
            'loading',
            'downloading',
            'converting',
            'reading-video',
            'reading-audio',
            'merging',
        ] as FFmpegStatus[]).includes(status),
        [status]
    )
    const showProgress = ffmpegProcessing
    const isBusy = stage === 'parsing' || stage === 'direct-downloading' || stage === 'reading-file' || ffmpegProcessing
    const toolbarDescription = mode === 'merge'
        ? dict.audioTool.mergeDescription
        : dict.audioTool.extractDescription

    const setValidationError = useCallback((message: string) => {
        setStage('error')
        setErrorMessage(message)
        toast.error(message)
    }, [])

    const validateMergeTotalSize = useCallback((videoFile: File | null, audioFile: File | null): boolean => {
        const totalSize = (videoFile?.size ?? 0) + (audioFile?.size ?? 0)
        if (totalSize > MAX_TOTAL_MERGE_SIZE) {
            setValidationError(dict.errors.totalSizeTooLarge)
            return false
        }

        return true
    }, [dict.errors.totalSizeTooLarge, setValidationError])

    const validateExtractVideoFile = useCallback((file: File): boolean => {
        if (file.size > MAX_VIDEO_FILE_SIZE) {
            setValidationError(dict.errors.fileTooLarge)
            return false
        }

        if (file.size === 0) {
            setValidationError(dict.errors.fileEmpty)
            return false
        }

        if (!isSupportedVideoFile(file)) {
            setValidationError(dict.errors.fileFormatNotSupported)
            return false
        }

        return true
    }, [dict.errors.fileEmpty, dict.errors.fileFormatNotSupported, dict.errors.fileTooLarge, setValidationError])

    const validateMergeVideoFile = useCallback((file: File): boolean => {
        if (file.size > MAX_VIDEO_FILE_SIZE) {
            setValidationError(dict.errors.videoFileTooLarge)
            return false
        }

        if (file.size === 0) {
            setValidationError(dict.errors.fileEmpty)
            return false
        }

        if (!isSupportedVideoFile(file)) {
            setValidationError(dict.errors.fileFormatNotSupported)
            return false
        }

        return true
    }, [dict.errors.fileEmpty, dict.errors.fileFormatNotSupported, dict.errors.videoFileTooLarge, setValidationError])

    const validateMergeAudioFile = useCallback((file: File): boolean => {
        if (file.size > MAX_AUDIO_FILE_SIZE) {
            setValidationError(dict.errors.audioFileTooLarge)
            return false
        }

        if (file.size === 0) {
            setValidationError(dict.errors.fileEmpty)
            return false
        }

        if (!isSupportedAudioFile(file)) {
            setValidationError(dict.errors.audioFormatNotSupported)
            return false
        }

        return true
    }, [dict.errors.audioFileTooLarge, dict.errors.audioFormatNotSupported, dict.errors.fileEmpty, setValidationError])

    const statusText = useMemo(() => {
        if (stage === 'parsing') {
            return dict.audioTool.statusParsing
        }

        if (stage === 'direct-downloading') {
            return dict.audioTool.statusDirectDownloading
        }

        if (stage === 'fallback-extracting') {
            return dict.audioTool.statusFallbackExtracting
        }

        if (mode === 'merge') {
            if (status === 'reading-video') {
                return dict.audioTool.statusReadingVideo
            }

            if (status === 'reading-audio') {
                return dict.audioTool.statusReadingAudio
            }

            if (status === 'merging') {
                return dict.audioTool.statusMerging
            }

            if (status === 'idle' && !mergeVideoFile && !mergeAudioFile) {
                return dict.audioTool.statusMergeIdle
            }
        }

        if (mode === 'file') {
            if (stage === 'reading-file') {
                return dict.audioTool.statusReadingFile
            }

            if (selectedFile && stage === 'idle' && status === 'idle') {
                return dict.audioTool.statusFileReady
            }
        }

        if (status === 'loading') {
            return dict.extractAudio.loading
        }

        if (status === 'downloading') {
            if (progressInfo?.loaded && progressInfo?.total && dict.extractAudio.downloadingWithSize) {
                return dict.extractAudio.downloadingWithSize
                    .replace('{progress}', String(Math.floor(progress)))
                    .replace('{loaded}', formatBytes(progressInfo.loaded))
                    .replace('{total}', formatBytes(progressInfo.total))
            }

            return dict.extractAudio.downloading.replace('{progress}', String(Math.floor(progress)))
        }

        if (status === 'converting') {
            return dict.extractAudio.converting.replace('{progress}', String(Math.floor(progress)))
        }

        if (stage === 'completed' || status === 'completed') {
            return dict.audioTool.statusCompleted
        }

        if (stage === 'error' || status === 'error') {
            return errorMessage || error || dict.errors.downloadError
        }

        return mode === 'merge'
            ? dict.audioTool.statusMergeIdle
            : dict.audioTool.statusIdle
    }, [
        dict,
        error,
        errorMessage,
        mergeAudioFile,
        mergeVideoFile,
        mode,
        progress,
        progressInfo?.loaded,
        progressInfo?.total,
        selectedFile,
        stage,
        status,
    ])

    useEffect(() => {
        if (status === 'completed') {
            setStage('completed')
        }

        if (status === 'error') {
            setStage('error')
            if (error) {
                setErrorMessage(error)
            }
        }
    }, [error, status])

    useEffect(() => {
        if (!open) {
            const timer = window.setTimeout(() => {
                setSelectedFile(null)
                setMergeVideoFile(null)
                setMergeAudioFile(null)
                setStage('idle')
                setErrorMessage('')
                setMode('file')
                reset()
            }, 150)

            return () => window.clearTimeout(timer)
        }
    }, [open, reset])

    const runAutoExtractTask = useCallback(async (task: AudioExtractTask) => {
        if (status === 'error') {
            reset()
        }

        setErrorMessage('')

        try {
            const outputTitle = task.title || dict.history.unknownTitle

            if (task.audioUrl) {
                setStage('direct-downloading')
                downloadFile(task.audioUrl)
                setStage('completed')
                return
            }

            if (task.videoUrl) {
                setStage('fallback-extracting')
                await extractAudio(task.videoUrl, outputTitle)
                return
            }

            if (!task.sourceUrl?.trim()) {
                setValidationError(dict.audioTool.noAudioSource)
                return
            }

            setStage('parsing')
            const apiResult = await requestUnifiedParse(task.sourceUrl.trim())
            const parsed = apiResult.data
            const audioDownloadUrl = parsed.downloadAudioUrl || parsed.originDownloadAudioUrl || null
            const videoDownloadUrl = parsed.downloadVideoUrl || parsed.originDownloadVideoUrl || null
            const resolvedTitle = parsed.title || parsed.desc || outputTitle

            if (audioDownloadUrl) {
                setStage('direct-downloading')
                downloadFile(audioDownloadUrl)
                setStage('completed')
                return
            }

            if (!videoDownloadUrl) {
                throw new Error(dict.audioTool.noAudioSource)
            }

            setStage('fallback-extracting')
            await extractAudio(videoDownloadUrl, resolvedTitle)
        } catch (err) {
            if (isApiRequestError(err)) {
                console.error('Audio tool auto parse failed', {
                    code: err.code,
                    status: err.status,
                    requestId: err.requestId,
                    details: err.details,
                })
            }

            const resolvedMessage = resolveApiErrorMessage(err, dict)
            setStage('error')
            setErrorMessage(resolvedMessage)
            toast.error(dict.errors.downloadFailed, {
                description: resolvedMessage,
            })
        }
    }, [dict, extractAudio, reset, setValidationError, status])

    const handleExtractFileSelect = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setErrorMessage('')
        setStage('idle')

        if (!validateExtractVideoFile(file)) {
            setSelectedFile(null)
            event.target.value = ''
            return
        }

        setSelectedFile(file)
    }, [validateExtractVideoFile])

    const handleExtractFileDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        event.stopPropagation()

        const file = event.dataTransfer.files?.[0]
        if (!file) return

        setErrorMessage('')
        setStage('idle')

        if (!validateExtractVideoFile(file)) {
            setSelectedFile(null)
            return
        }

        setSelectedFile(file)
    }, [validateExtractVideoFile])

    const handleMergeVideoSelect = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setErrorMessage('')
        setStage('idle')

        if (!validateMergeVideoFile(file) || !validateMergeTotalSize(file, mergeAudioFile)) {
            event.target.value = ''
            return
        }

        setMergeVideoFile(file)
    }, [mergeAudioFile, validateMergeTotalSize, validateMergeVideoFile])

    const handleMergeAudioSelect = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setErrorMessage('')
        setStage('idle')

        if (!validateMergeAudioFile(file) || !validateMergeTotalSize(mergeVideoFile, file)) {
            event.target.value = ''
            return
        }

        setMergeAudioFile(file)
    }, [mergeVideoFile, validateMergeAudioFile, validateMergeTotalSize])

    const handleMergeVideoDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        event.stopPropagation()

        const file = event.dataTransfer.files?.[0]
        if (!file) return

        setErrorMessage('')
        setStage('idle')

        if (!validateMergeVideoFile(file) || !validateMergeTotalSize(file, mergeAudioFile)) {
            return
        }

        setMergeVideoFile(file)
    }, [mergeAudioFile, validateMergeTotalSize, validateMergeVideoFile])

    const handleMergeAudioDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        event.stopPropagation()

        const file = event.dataTransfer.files?.[0]
        if (!file) return

        setErrorMessage('')
        setStage('idle')

        if (!validateMergeAudioFile(file) || !validateMergeTotalSize(mergeVideoFile, file)) {
            return
        }

        setMergeAudioFile(file)
    }, [mergeVideoFile, validateMergeAudioFile, validateMergeTotalSize])

    const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        event.stopPropagation()
    }, [])

    const handleClearExtractFile = useCallback(() => {
        setSelectedFile(null)
        setErrorMessage('')
        setStage('idle')
        reset()
    }, [reset])

    const handleClearMergeVideo = useCallback(() => {
        setMergeVideoFile(null)
        setErrorMessage('')
        setStage('idle')
        reset()
    }, [reset])

    const handleClearMergeAudio = useCallback(() => {
        setMergeAudioFile(null)
        setErrorMessage('')
        setStage('idle')
        reset()
    }, [reset])

    const handleExtractFile = async () => {
        if (!selectedFile) {
            setValidationError(dict.errors.emptyUrl)
            return
        }

        if (status === 'error') {
            reset()
        }

        setStage('reading-file')
        setErrorMessage('')
        await extractAudioFromFile(selectedFile, selectedFile.name.replace(/\.[^.]+$/, ''))
    }

    const handleMerge = async () => {
        if (!mergeVideoFile) {
            setValidationError(dict.errors.noVideoSelected)
            return
        }

        if (!mergeAudioFile) {
            setValidationError(dict.errors.noAudioSelected)
            return
        }

        if (!validateMergeTotalSize(mergeVideoFile, mergeAudioFile)) {
            return
        }

        if (status === 'error') {
            reset()
        }

        setStage('idle')
        setErrorMessage('')
        await mergeVideoAndAudio(mergeVideoFile, mergeAudioFile, mergeVideoFile.name.replace(/\.[^.]+$/, ''))
    }

    useEffect(() => {
        if (!open || entry !== 'result' || !autoExtractTask || !autoTaskKey) {
            return
        }

        if (stage !== 'idle' || ffmpegProcessing || status === 'completed') {
            return
        }

        void runAutoExtractTask(autoExtractTask)
    }, [autoExtractTask, autoTaskKey, entry, ffmpegProcessing, open, runAutoExtractTask, stage, status])

    const handleDialogOpenChange = useCallback((nextOpen: boolean) => {
        if (!nextOpen) {
            cancel()
        }

        onOpenChange(nextOpen)
    }, [cancel, onOpenChange])

    const statusPanel = (
        <div className="rounded-md border bg-muted/30 p-3 space-y-2">
            <div className="flex items-start gap-2 text-sm">
                {(stage === 'error' || status === 'error') ? (
                    <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                ) : (stage === 'completed' || status === 'completed') ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                ) : ffmpegProcessing || stage === 'parsing' || stage === 'direct-downloading' || stage === 'reading-file' ? (
                    <Loader2 className="h-4 w-4 animate-spin mt-0.5 shrink-0" />
                ) : (
                    <Music className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                )}
                <p className={(stage === 'error' || status === 'error') ? 'text-destructive' : 'text-foreground/80'}>
                    {statusText}
                </p>
            </div>

            {showProgress && (
                <Progress value={Math.floor(progress)} className="h-2" />
            )}
        </div>
    )

    return (
        <Dialog open={open} onOpenChange={handleDialogOpenChange}>
            <DialogContent
                className="flex max-h-[calc(100vh-2rem)] max-w-2xl flex-col overflow-hidden p-4 sm:max-h-[90vh] sm:p-6"
                onInteractOutside={(event) => {
                    event.preventDefault()
                }}
            >
                <DialogHeader>
                    <DialogTitle>{entry === 'result' ? dict.extractAudio.button : dict.audioTool.title}</DialogTitle>
                    <DialogDescription>
                        {entry === 'result'
                            ? (autoExtractTask?.title || autoExtractTask?.videoUrl || dict.history.unknownTitle)
                            : toolbarDescription}
                    </DialogDescription>
                </DialogHeader>

                <div
                    className="flex-1 min-h-0 overflow-y-auto pr-1"
                    style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0px)' }}
                >
                    {entry === 'result' && autoExtractTask ? (
                        <ResultAutoExtractPanel
                            task={autoExtractTask}
                            stage={stage}
                            isBusy={isBusy}
                            statusPanel={statusPanel}
                            onRetry={() => void runAutoExtractTask(autoExtractTask)}
                        />
                    ) : (
                        <Tabs.Root value={mode} onValueChange={(value) => setMode(value as ExtractMode)} className="space-y-4">
                            <Tabs.List className="grid grid-cols-2 rounded-lg bg-muted p-1">
                                <Tabs.Trigger
                                    value="file"
                                    className={cn(
                                        'inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-all',
                                        mode === 'file'
                                            ? 'bg-background text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    )}
                                >
                                    {dict.audioTool.fileTab}
                                </Tabs.Trigger>
                                <Tabs.Trigger
                                    value="merge"
                                    className={cn(
                                        'inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-all',
                                        mode === 'merge'
                                            ? 'bg-background text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    )}
                                >
                                    {dict.audioTool.mergeTab}
                                </Tabs.Trigger>
                            </Tabs.List>

                            <Tabs.Content value="file" className="space-y-4 focus:outline-none">
                                <FileExtractPanel
                                    selectedFile={selectedFile}
                                    inputId={extractFileInputId}
                                    isBusy={isBusy}
                                    statusPanel={statusPanel}
                                    onSelect={handleExtractFileSelect}
                                    onDrop={handleExtractFileDrop}
                                    onDragOver={handleDragOver}
                                    onClear={handleClearExtractFile}
                                    onSubmit={() => void handleExtractFile()}
                                />
                            </Tabs.Content>

                            <Tabs.Content value="merge" className="space-y-4 focus:outline-none">
                                <MergePanel
                                    mergeVideoFile={mergeVideoFile}
                                    mergeAudioFile={mergeAudioFile}
                                    videoInputId={mergeVideoInputId}
                                    audioInputId={mergeAudioInputId}
                                    isBusy={isBusy}
                                    statusPanel={statusPanel}
                                    onVideoSelect={handleMergeVideoSelect}
                                    onAudioSelect={handleMergeAudioSelect}
                                    onVideoDrop={handleMergeVideoDrop}
                                    onAudioDrop={handleMergeAudioDrop}
                                    onDragOver={handleDragOver}
                                    onClearVideo={handleClearMergeVideo}
                                    onClearAudio={handleClearMergeAudio}
                                    onSubmit={() => void handleMerge()}
                                />
                            </Tabs.Content>
                        </Tabs.Root>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
