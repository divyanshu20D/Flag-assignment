"use client"

import { useSession } from "next-auth/react"

export default function DebugPage() {
    const { data: session, status } = useSession()

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Debug Session</h1>
            <div className="space-y-2">
                <p><strong>Status:</strong> {status}</p>
                <p><strong>Session exists:</strong> {session ? 'Yes' : 'No'}</p>
                {session && (
                    <div>
                        <p><strong>User:</strong> {session.user?.email}</p>
                        <p><strong>Name:</strong> {session.user?.name}</p>
                        <p><strong>Role:</strong> {session.user?.role}</p>
                        <p><strong>Workspace:</strong> {session.user?.workspace?.name}</p>
                    </div>
                )}
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                    {JSON.stringify(session, null, 2)}
                </pre>
            </div>
        </div>
    )
}