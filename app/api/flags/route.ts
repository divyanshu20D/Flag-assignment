import { NextResponse } from "next/server";
import { listFlags, upsertFlag } from "@/lib/data";
import { requireAuth, requireAdmin } from "@/lib/session";
import type { Flag } from "@/lib/types";

export async function GET() {
  try {
    const user = await requireAuth();
    const flags = await listFlags();
    return NextResponse.json({ flags });
  } catch (error) {
    console.error("Error fetching flags:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAdmin();
    const body = (await req.json()) as Partial<Flag>;
    if (!body?.key) {
      return NextResponse.json({ error: "key is required" }, { status: 400 });
    }

    const created = await upsertFlag(
      {
        key: body.key!,
        defaultValue: !!body.defaultValue,
        enabled: !!body.enabled,
        rules: (body.rules ?? []) as any,
        updatedAt: new Date().toISOString(),
      },
      user.id
    );

    return NextResponse.json({ flag: created });
  } catch (error) {
    console.error("Error creating flag:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Admin access required") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
