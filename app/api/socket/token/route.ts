import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { cookies } from "next/headers"

export async function GET() {
    try {
        const cookieStore = await cookies()
        const sessionToken = cookieStore.get('next-auth.session-token')?.value ||
            cookieStore.get('__Secure-next-auth.session-token')?.value

        if (!sessionToken) {
            return NextResponse.json({ error: "No session found" }, { status: 401 })
        }

        // Verify the token
        const token = await getToken({
            token: sessionToken,
            secret: process.env.NEXTAUTH_SECRET!
        })

        if (!token) {
            return NextResponse.json({ error: "Invalid session" }, { status: 401 })
        }

        return NextResponse.json({ token: sessionToken })
    } catch (error) {
        console.error('Error getting socket token:', error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}