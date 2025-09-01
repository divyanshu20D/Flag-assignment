"use client"

import type * as React from "react"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

type Provider = "github" | "google"

export type SocialAuthProps = {
    mode?: "login" | "signup"
    callbackUrl?: string
    onProviderClick?: (provider: Provider) => void
    className?: string
}

export function SocialAuth({ mode = "login", callbackUrl = "/", onProviderClick, className }: SocialAuthProps) {
    const [isLoading, setIsLoading] = useState<Provider | null>(null)
    const title = mode === "signup" ? "Create your account" : "Sign in to your account"
    const subtitle = mode === "signup" ? "Continue with one of the providers below" : "Continue with"

    async function handleClick(provider: Provider) {
        if (onProviderClick) {
            onProviderClick(provider)
            return
        }

        try {
            setIsLoading(provider)
            await signIn(provider, { callbackUrl })
        } catch (error) {
            console.error(`Error signing in with ${provider}:`, error)
        } finally {
            setIsLoading(null)
        }
    }

    return (
        <div className={cn("w-full max-w-sm mx-auto space-y-6", className)}>
            <div className="space-y-1 text-center">
                <h1 className="text-2xl font-semibold tracking-tight text-balance">{title}</h1>
                <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>

            <div className="space-y-3">
                <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-center gap-2 bg-white hover:bg-accent/50 text-foreground"
                    onClick={() => handleClick("github")}
                    disabled={isLoading !== null}
                    aria-label="Continue with GitHub"
                >
                    {isLoading === "github" ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                        <GitHubIcon className="h-4 w-4" />
                    )}
                    Continue with GitHub
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-center gap-2 bg-white hover:bg-accent/50 text-foreground"
                    onClick={() => handleClick("google")}
                    disabled={isLoading !== null}
                    aria-label="Continue with Google"
                >
                    {isLoading === "google" ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                        <GoogleIcon className="h-4 w-4" />
                    )}
                    Continue with Google
                </Button>
            </div>

            <Separator className="my-1" />

            {/* Optional slot for your email/password form or other content */}
            {/* Place your custom form below when needed */}
        </div>
    )
}

// Simple brand icons (no external deps)
function GitHubIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="fill-current" {...props}>
            <path d="M12 .5C5.73.5.98 5.24.98 11.5c0 4.85 3.15 8.96 7.52 10.41.55.1.75-.24.75-.53 0-.26-.01-1.13-.02-2.05-3.06.66-3.71-1.3-3.71-1.3-.5-1.27-1.21-1.61-1.21-1.61-.99-.68.08-.67.08-.67 1.09.08 1.66 1.12 1.66 1.12.98 1.67 2.56 1.19 3.18.91.1-.71.38-1.19.69-1.46-2.44-.28-5-1.22-5-5.43 0-1.2.43-2.18 1.12-2.95-.11-.28-.49-1.41.11-2.94 0 0 .92-.29 3.01 1.13a10.6 10.6 0 0 1 2.74-.37c.93 0 1.87.13 2.74.37 2.09-1.42 3.01-1.13 3.01-1.13.6 1.53.22 2.66.11 2.94.69.77 1.12 1.75 1.12 2.95 0 4.22-2.57 5.15-5.01 5.42.39.34.73 1.01.73 2.05 0 1.48-.01 2.68-.01 3.04 0 .29.19.64.75.53A10.5 10.5 0 0 0 23.02 11.5C23.02 5.24 18.27.5 12 .5z" />
        </svg>
    )
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
            <path
                d="M21.35 12.2c0-.64-.06-1.25-.18-1.84H12v3.48h5.26a4.5 4.5 0 0 1-1.95 2.95v2.44h3.16c1.85-1.7 2.88-4.2 2.88-7.03z"
                className="fill-[#4285F4]"
            />
            <path
                d="M12 22c2.61 0 4.8-.87 6.4-2.36l-3.16-2.44c-.88.59-2.01.95-3.24.95-2.49 0-4.6-1.68-5.35-3.95H3.35v2.48A10 10 0 0 0 12 22z"
                className="fill-[#34A853]"
            />
            <path
                d="M6.65 14.2A6 6 0 0 1 6.33 12c0-.77.13-1.53.32-2.2V7.32H3.35A9.98 9.98 0 0 0 2 12c0 1.6.38 3.12 1.05 4.45l3.6-2.25z"
                className="fill-[#FBBC05]"
            />
            <path
                d="M12 6.5c1.42 0 2.69.49 3.69 1.46l2.75-2.75A9.4 9.4 0 0 0 12 2a10 10 0 0 0-8.65 5.32l3.6 2.48C7.4 8.18 9.51 6.5 12 6.5z"
                className="fill-[#EA4335]"
            />
        </svg>
    )
}
