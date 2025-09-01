import { NextResponse } from "next/server"
import { listAuditLogs } from "@/lib/data"
import { requireAuth } from "@/lib/session"

export async function GET(req: Request) {
  try {
    const user = await requireAuth()
    const url = new URL(req.url)
    const flag = url.searchParams.get("flag") ?? undefined

    const rows = await listAuditLogs(user.workspaceId, flag || undefined)

    return NextResponse.json({ logs: rows })
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
