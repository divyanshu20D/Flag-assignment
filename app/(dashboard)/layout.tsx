"use client"

import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { AuthGuard } from "@/components/auth/auth-guard"
import { LogoutButton } from "@/components/auth/logout-button"
import { RealtimeProvider } from "@/components/providers/realtime-provider"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <RealtimeProvider>
        <div className="h-screen bg-gray-50 flex">
          <div className="w-64 flex-shrink-0">
            <Sidebar />
          </div>
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header with logout button */}
            {/* <header className="flex justify-end p-4 md:p-6 pb-0 flex-shrink-0">
              <LogoutButton />
            </header> */}
            {/* Main content */}
            <main className="flex-1 p-4 md:p-6 pt-2 overflow-auto">{children}</main>
          </div>
        </div>
      </RealtimeProvider>
    </AuthGuard>
  )
}
