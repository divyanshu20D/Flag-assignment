"use client"

import { useRealtimeContext } from '@/components/providers/realtime-provider'
import { Badge } from '@/components/ui/badge'
import { Wifi, WifiOff, AlertCircle } from 'lucide-react'

export function ConnectionStatus() {
    const { isConnected, connectionError } = useRealtimeContext()

    if (connectionError) {
        return (
            <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Connection Error
            </Badge>
        )
    }

    return (
        <Badge variant={isConnected ? "default" : "secondary"} className="flex items-center gap-1">
            {isConnected ? (
                <>
                    <Wifi className="h-3 w-3" />
                    Live
                </>
            ) : (
                <>
                    <WifiOff className="h-3 w-3" />
                    Offline
                </>
            )}
        </Badge>
    )
}