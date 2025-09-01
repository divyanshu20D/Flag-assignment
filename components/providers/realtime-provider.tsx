"use client"

import { createContext, useContext, ReactNode } from 'react'
import { useRealtime } from '@/hooks/use-realtime'
import type { Socket } from 'socket.io-client'

interface RealtimeContextType {
    isConnected: boolean
    connectionError: string | null
    socket: Socket | null
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined)

export function RealtimeProvider({ children }: { children: ReactNode }) {
    const realtime = useRealtime()

    return (
        <RealtimeContext.Provider value={realtime}>
            {children}
        </RealtimeContext.Provider>
    )
}

export function useRealtimeContext() {
    const context = useContext(RealtimeContext)
    if (context === undefined) {
        throw new Error('useRealtimeContext must be used within a RealtimeProvider')
    }
    return context
}