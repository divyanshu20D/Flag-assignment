import { NextResponse } from "next/server"
import { deleteFlag, getFlag, upsertFlag, getDefaultWorkspaceId, getDefaultAdminUserId } from "@/lib/data"
import type { Flag } from "@/lib/types"

export async function GET(_: Request, { params }: { params: Promise<{ key: string }> }) {
  try {
    const { key } = await params
    const workspaceId = await getDefaultWorkspaceId()
    const flag = await getFlag(key, workspaceId)
    if (!flag) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ flag })
  } catch (error) {
    console.error('Error fetching flag:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ key: string }> }) {
  try {
    const { key } = await params
    const body = (await req.json()) as Partial<Flag>
    if (body.key && body.key !== key) {
      return NextResponse.json({ error: "Cannot change key in path" }, { status: 400 })
    }

    const workspaceId = await getDefaultWorkspaceId()
    const existing = await getFlag(key, workspaceId)
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

    // Get the first admin user from the workspace
    const adminUserId = await getDefaultAdminUserId(workspaceId)

    const updated = await upsertFlag({
      key: key,
      defaultValue: body.defaultValue ?? existing.defaultValue,
      enabled: body.enabled ?? existing.enabled,
      rules: (body.rules ?? existing.rules) as any,
      updatedAt: existing.updatedAt,
    }, workspaceId, adminUserId)

    return NextResponse.json({ flag: updated })
  } catch (error) {
    console.error('Error updating flag:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ key: string }> }) {
  try {
    const { key } = await params
    const workspaceId = await getDefaultWorkspaceId()
    // Get the first admin user from the workspace
    const adminUserId = await getDefaultAdminUserId(workspaceId)

    const ok = await deleteFlag(key, workspaceId, adminUserId)
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting flag:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
