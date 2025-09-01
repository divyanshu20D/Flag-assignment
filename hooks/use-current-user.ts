import { useSession } from "next-auth/react"

export function useCurrentUser() {
    const { data: session, status } = useSession()

    return {
        user: session?.user,
        isLoading: status === "loading",
        isAdmin: session?.user?.role === "ADMIN",
        isReadOnly: session?.user?.role === "READ_ONLY",
    }
}