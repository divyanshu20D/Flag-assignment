"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { LogOut } from "lucide-react"

interface LogoutButtonProps {
    variant?: "default" | "ghost" | "outline"
    size?: "default" | "sm" | "lg"
    showIcon?: boolean
    children?: React.ReactNode
    className?: string
}

export function LogoutButton({
    variant = "ghost",
    size = "default",
    showIcon = true,
    children,
    className
}: LogoutButtonProps) {
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const { toast } = useToast()

    const handleLogout = async () => {
        setIsLoggingOut(true)
        try {
            await signOut({ callbackUrl: "/login" })
            toast({
                title: "Logged out successfully",
                description: "You have been signed out of your account.",
            })
        } catch (error) {
            console.error("Logout error:", error)
            toast({
                title: "Logout failed",
                description: "There was an error signing you out. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoggingOut(false)
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant={variant} size={size} disabled={isLoggingOut} className={className}>
                    {showIcon && <LogOut className="h-4 w-4 mr-2" />}
                    {children || "Logout"}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to sign out? You will need to log in again to access your account.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                    >
                        {isLoggingOut ? "Signing out..." : "Yes, sign out"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}