'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export interface TopBarActions {
    showHistoryShortcut?: boolean
    onHistoryClick?: () => void
    showAudioTool?: boolean
    onAudioToolClick?: () => void
}

interface TopBarActionsContextValue {
    actions: TopBarActions
    setActions: (actions: TopBarActions) => void
}

const TopBarActionsContext = createContext<TopBarActionsContextValue | null>(null)

export function TopBarActionsProvider({ children }: { children: ReactNode }) {
    const [actions, setActions] = useState<TopBarActions>({})
    const value = useMemo(() => ({ actions, setActions }), [actions])

    return (
        <TopBarActionsContext.Provider value={value}>
            {children}
        </TopBarActionsContext.Provider>
    )
}

export function useTopBarActions() {
    return useContext(TopBarActionsContext) ?? {
        actions: {},
        setActions: () => {},
    }
}
