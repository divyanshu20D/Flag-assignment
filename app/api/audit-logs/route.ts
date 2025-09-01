import { NextResponse } from "next/server"
import { listAuditLogs, getDefaultWorkspaceId } from "@/lib/data"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const flag = url.searchParams.get("flag") ?? undefined

    const workspaceId = await getDefaultWorkspaceId()
    const rows = await listAuditLogs(workspaceId, flag || undefined)

    return NextResponse.json({ logs: rows })
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
