"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { LogoutButton } from "@/components/auth/logout-button"
import { ClientOnly } from "@/components/client-only"
import { User, Mail, Shield, LogOut } from "lucide-react"

function SettingsContent() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <Card className="rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="text-gray-900">Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 animate-pulse rounded-full bg-gray-200" />
            <div className="space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-48 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!session?.user) {
    return (
      <Card className="rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="text-gray-900">Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">No user session found.</p>
        </CardContent>
      </Card>
    )
  }

  const { user } = session
  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : user.email[0].toUpperCase()

  return (
    <div className="space-y-6">
      {/* User Profile Card */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <User className="h-5 w-5" />
            User Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar and Basic Info */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.image || undefined} alt={user.name || user.email} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {user.name || "No name provided"}
              </h3>
              <p className="text-sm text-gray-600">{user.email}</p>
              <div className="flex items-center gap-2">
                <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'} className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  {user.role}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Detailed Information */}
          <div className="grid gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <User className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Full Name</p>
                <p className="text-sm text-gray-600">{user.name || "Not provided"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <Mail className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Email Address</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <Shield className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Role</p>
                <p className="text-sm text-gray-600">
                  {user.role} {user.role === 'ADMIN' ? '(Full Access)' : '(Read Only)'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <div className="h-4 w-4 rounded bg-blue-500 flex items-center justify-center">
                <div className="h-2 w-2 rounded bg-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Workspace ID</p>
                <p className="text-sm text-gray-600 font-mono">{user.workspaceId}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions Card */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <LogOut className="h-5 w-5" />
            Account Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Manage your account settings and sign out when you're done.
            </p>
            <div className="flex justify-start">
              <LogoutButton variant="destructive" size="default">
                Sign Out
              </LogoutButton>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <ClientOnly
      fallback={
        <Card className="rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle className="text-gray-900">Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 animate-pulse rounded-full bg-gray-200" />
              <div className="space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-48 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          </CardContent>
        </Card>
      }
    >
      <SettingsContent />
    </ClientOnly>
  )
}
