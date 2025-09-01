import { NextResponse } from "next/server";
import { deleteFlag, getFlag, upsertFlag } from "@/lib/data";
import { requireAuth, requireAdmin } from "@/lib/session";
import type { Flag } from "@/lib/types";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const user = await requireAuth();
    const { key } = await params;
    const flag = await getFlag(key);
    if (!flag)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ flag });
  } catch (error) {
    console.error("Error fetching flag:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const user = await requireAdmin();
    const { key } = await params;
    const body = (await req.json()) as Partial<Flag>;
    if (body.key && body.key !== key) {
      return NextResponse.json(
        { error: "Cannot change key in path" },
        { status: 400 }
      );
    }

    const existing = await getFlag(key);
    if (!existing)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await upsertFlag(
      {
        key: key,
        defaultValue: body.defaultValue ?? existing.defaultValue,
        enabled: body.enabled ?? existing.enabled,
        rules: (body.rules ?? existing.rules) as any,
        updatedAt: existing.updatedAt,
      },
      user.id
    );

    return NextResponse.json({ flag: updated });
  } catch (error) {
    console.error("Error updating flag:", error);
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

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const user = await requireAdmin();
    const { key } = await params;

    const ok = await deleteFlag(key, user.id);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting flag:", error);
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
