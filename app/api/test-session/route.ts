import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    console.log("🧪 Test session API called");

    const session = await getServerSession(authOptions);

    console.log("📊 Session data received:", {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userRole: session?.user?.role,
      userName: session?.user?.name,
    });

    if (!session) {
      return NextResponse.json(
        {
          error: "No session found",
          message: "User is not authenticated",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      session: {
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: session.user.role,
        },
      },
      debug: {
        hasId: !!session.user.id,
        hasRole: !!session.user.role,
        hasEmail: !!session.user.email,
      },
    });
  } catch (error) {
    console.error("❌ Error in test session API:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
