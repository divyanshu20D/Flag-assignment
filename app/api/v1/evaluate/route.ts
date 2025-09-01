import { NextResponse } from "next/server"
import { evaluateFlag } from "@/lib/data"

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      key?: string
      unitId?: string
      attributes?: Record<string, unknown>
    }
    if (!body.key || !body.unitId) {
      return NextResponse.json({ error: "key and unitId are required" }, { status: 400 })
    }

    const res = await evaluateFlag({
      key: body.key,
      unitId: body.unitId,
      attributes: body.attributes ?? {},
    })

    return NextResponse.json(res)
  } catch (error) {
    console.error('Error evaluating flag:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
