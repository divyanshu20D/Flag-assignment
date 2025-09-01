"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { SocialAuth } from "@/components/auth/social-auth"

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (session) {
      console.log("Session detected, redirecting...", session.user?.email)
      router.replace("/flags")
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

  if (session) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh grid place-items-center bg-gray-50 p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-md">
        <CardContent className="p-6">
          <SocialAuth mode="login" callbackUrl="/flags" />
        </CardContent>
      </Card>
    </div>
  )
}
