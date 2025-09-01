"use client"

import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { LogoutButton } from "@/components/auth/logout-button"
import { ClientOnly } from "@/components/client-only"

function UserMenuContent() {
    const { data: session, status } = useSession()

    if (status === "loading") {
        return (
            <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
        )
    }

    if (!session?.user) {
        return null
    }

    const { user } = session
    const initials = user.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
        : user.email[0].toUpperCase()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-full justify-start px-2 hover:bg-gray-100">
                    <Avatar className="h-8 w-8 mr-3">
                        <AvatarImage src={user.image || undefined} alt={user.name || user.email} />
                        <AvatarFallback className="text-sm">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start text-left min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate w-full">
                            {user.name || "User"}
                        </p>
                        <p className="text-xs text-gray-500 truncate w-full">
                            {user.role}
                        </p>
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="start" side="right" sideOffset={8}>
                <DropdownMenuLabel className="font-normal p-4">
                    <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={user.image || undefined} alt={user.name || user.email} />
                            <AvatarFallback className="text-sm">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-1 min-w-0 flex-1">
                            <p className="text-sm font-medium leading-none text-gray-900 truncate">
                                {user.name || "No name provided"}
                            </p>
                            <p className="text-xs leading-none text-gray-500 truncate">
                                {user.email}
                            </p>
                        </div>
                    </div>
                    <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Role:</span>
                            <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'} className="text-xs">
                                {user.role}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Workspace:</span>
                            <span className="text-xs text-gray-700 font-mono bg-gray-100 px-2 py-1 rounded">
                                {user.workspaceId.slice(0, 8)}...
                            </span>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-2">
                    <LogoutButton variant="ghost" size="sm" showIcon={true} className="w-full justify-start">
                        Sign out
                    </LogoutButton>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export function UserMenu() {
    return (
        <ClientOnly
            fallback={
                <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
            }
        >
            <UserMenuContent />
        </ClientOnly>
    )
}