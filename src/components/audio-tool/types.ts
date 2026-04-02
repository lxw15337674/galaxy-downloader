export interface AudioExtractTask {
    title?: string
    sourceUrl?: string | null
    audioUrl?: string | null
    videoUrl?: string | null
}

export type ExtractMode = 'file' | 'merge'

export type AudioToolStage =
    | 'idle'
    | 'parsing'
    | 'direct-downloading'
    | 'fallback-extracting'
    | 'reading-file'
    | 'completed'
    | 'error'
