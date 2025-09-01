import { withAuth } from "next-auth/middleware"

export default withAuth(
    function middleware(req) {
        // Add any additional middleware logic here
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const { pathname } = req.nextUrl

                // Allow access to login page and API routes without auth
                if (pathname.startsWith('/login') ||
                    pathname.startsWith('/api/auth') ||
                    pathname.startsWith('/api/v1/evaluate') ||
                    pathname.startsWith('/debug')) {
                    return true
                }

                // Require authentication for all other routes
                return !!token
            },
        },
    }
)

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|public/).*)',
    ],
}