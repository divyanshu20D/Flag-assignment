import type { ReactNode } from "react"
import { Sidebar } from "./sidebar"
import { WsStatus } from "./ws-status"

export default function AppShell({
  title,
  action,
  children,
}: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <div className="flex flex-col sm:flex-row">
        <Sidebar />
        <main className="flex-1">
          <header className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h1 className="text-lg font-semibold text-balance">{title}</h1>
            </div>
            <div className="flex items-center gap-4">
              {action}
              <WsStatus connected />
            </div>
          </header>
          <div className="p-4">{children}</div>
        </main>
      </div>
    </div>
  )
}
