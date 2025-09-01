"use client"

import { SessionProvider } from "next-auth/react"
import { ClientOnly } from "@/components/client-only"

interface ProvidersProps {
    children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
    return (
        <ClientOnly fallback={<div>{children}</div>}>
            <SessionProvider>
                {children}
            </SessionProvider>
        </ClientOnly>
    )
}