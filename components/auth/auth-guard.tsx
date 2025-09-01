"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { ClientOnly } from "@/components/client-only"

interface AuthGuardProps {
    children: React.ReactNode
}

function AuthGuardContent({ children }: AuthGuardProps) {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === "loading") return // Still loading

        if (!session) {
            router.push("/login")
            return
        }
    }, [session, status, router])

    if (status === "loading") {
        return (
            <div className="min-h-dvh flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!session) {
        return null
    }

    return <>{children}</>
}

export function AuthGuard({ children }: AuthGuardProps) {
    return (
        <ClientOnly
            fallback={
                <div className="min-h-dvh flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            }
        >
            <AuthGuardContent>{children}</AuthGuardContent>
        </ClientOnly>
    )
}