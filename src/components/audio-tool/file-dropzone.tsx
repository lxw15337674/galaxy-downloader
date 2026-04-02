'use client'

import type { ChangeEvent, DragEvent } from 'react'

import { FileX, Upload } from 'lucide-react'

import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FileDropzoneProps {
    acceptedFile: File | null
    title: string
    hint: string
    limitText: string
    emptyButtonLabel: string
    selectedLabel: string
    inputId: string
    accept: string
    isBusy: boolean
    onSelect: (event: ChangeEvent<HTMLInputElement>) => void
    onDrop: (event: DragEvent<HTMLDivElement>) => void
    onDragOver: (event: DragEvent<HTMLDivElement>) => void
    onClear: () => void
}

export function FileDropzone({
    acceptedFile,
    title,
    hint,
    limitText,
    emptyButtonLabel,
    selectedLabel,
    inputId,
    accept,
    isBusy,
    onSelect,
    onDrop,
    onDragOver,
    onClear,
}: FileDropzoneProps) {
    return (
        <div
            className={cn(
                'border-2 border-dashed rounded-lg p-4 text-center transition-colors space-y-3',
                acceptedFile ? 'border-muted bg-muted/20' : 'border-muted-foreground/30 hover:border-muted-foreground/50'
            )}
            onDrop={onDrop}
            onDragOver={onDragOver}
        >
            <div className="space-y-1">
                <div className="text-sm font-medium">{title}</div>
                <div className="text-xs text-muted-foreground">{hint}</div>
                <div className="text-xs text-muted-foreground/80">{limitText}</div>
            </div>

            <input
                id={inputId}
                type="file"
                accept={accept}
                onChange={onSelect}
                disabled={isBusy}
                className="sr-only"
            />

            {acceptedFile ? (
                <div className="space-y-3">
                    <p className="text-sm font-medium break-all">{selectedLabel}</p>
                    <div className="flex justify-center gap-2">
                        <label
                            htmlFor={inputId}
                            aria-disabled={isBusy}
                            className={cn(
                                buttonVariants({ variant: 'outline', size: 'sm' }),
                                'cursor-pointer',
                                isBusy && 'pointer-events-none opacity-50'
                            )}
                        >
                            {emptyButtonLabel}
                        </label>
                        <Button type="button" variant="ghost" size="sm" onClick={onClear} disabled={isBusy} className="h-8 w-8 p-0">
                            <FileX className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-2 py-2">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground/60" />
                    <label
                        htmlFor={inputId}
                        aria-disabled={isBusy}
                        className={cn(
                            buttonVariants({ variant: 'outline', size: 'sm' }),
                            'cursor-pointer',
                            isBusy && 'pointer-events-none opacity-50'
                        )}
                    >
                        {emptyButtonLabel}
                    </label>
                </div>
            )}
        </div>
    )
}
