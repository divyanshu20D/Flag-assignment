"use client"

type Props = { connected?: boolean }

export function WsStatus({ connected = true }: Props) {
  return (
    <div className="flex items-center gap-2 text-sm" aria-live="polite">
      <span className={`h-2 w-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} aria-hidden="true" />
      <span className="text-muted-foreground">{connected ? "Connected" : "Disconnected"}</span>
    </div>
  )
}
