"use client"

import useSWR, { mutate } from "swr"
import Link from "next/link"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
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
import { useCurrentUser } from "@/hooks/use-current-user"
import { ConnectionStatus } from "@/components/connection-status"
import type { Flag } from "@/lib/types"
import type { FlagEvent } from "@/lib/redis"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function FlagTable() {
  const { data, isLoading } = useSWR<{ flags: Flag[] }>("/api/flags", fetcher)
  const flags = data?.flags ?? []
  const { toast } = useToast()
  const { isAdmin } = useCurrentUser()

  // Listen for real-time flag updates
  useEffect(() => {
    const handleFlagUpdate = (event: CustomEvent<FlagEvent>) => {
      // Refresh the flags data when any flag event occurs
      mutate("/api/flags")
    }

    window.addEventListener('flag_updated', handleFlagUpdate as EventListener)
    return () => {
      window.removeEventListener('flag_updated', handleFlagUpdate as EventListener)
    }
  }, [])

  async function toggleEnabled(flag: Flag, next: boolean) {
    if (!isAdmin) {
      toast({
        title: "Access denied",
        description: "Only administrators can modify flags.",
        variant: "destructive"
      })
      return
    }

    try {
      const response = await fetch(`/api/flags/${encodeURIComponent(flag.key)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: next }),
      })

      if (!response.ok) {
        throw new Error('Failed to update flag')
      }

      mutate("/api/flags")
      // @ts-ignore
      window.dispatchEvent(new Event("flags:updated"))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update flag. Please try again.",
        variant: "destructive"
      })
    }
  }

  async function remove(key: string) {
    if (!isAdmin) {
      toast({
        title: "Access denied",
        description: "Only administrators can delete flags.",
        variant: "destructive"
      })
      return
    }

    await fetch(`/api/flags/${encodeURIComponent(key)}`, { method: "DELETE" })
    mutate("/api/flags")
    // @ts-ignore
    window.dispatchEvent(new Event("flags:updated"))
    toast({ title: "Flag deleted", description: `“${key}” was removed successfully.` })
  }

  return (
    <Card className="rounded-2xl shadow-md">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CardTitle className="text-gray-900">Feature Flags</CardTitle>
          <ConnectionStatus />
        </div>
        {isAdmin && (
          <Button asChild className="bg-blue-600 hover:bg-blue-600/90">
            <Link href="/flags/new">+ Create Flag</Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-sm text-gray-900">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Default Value</TableHead>
                  <TableHead>Enabled</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flags.map((f) => (
                  <TableRow key={f.key}>
                    <TableCell className="font-medium">{f.key}</TableCell>
                    <TableCell>{f.defaultValue ? "True" : "False"}</TableCell>
                    <TableCell>
                      <Switch
                        checked={f.enabled}
                        onCheckedChange={(v) => toggleEnabled(f, v)}
                        disabled={!isAdmin}
                        aria-label={`Toggle ${f.key}`}
                      />
                    </TableCell>
                    <TableCell>{new Date(f.updatedAt).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isAdmin && (
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/flags/${encodeURIComponent(f.key)}/edit`}>Edit</Link>
                          </Button>
                        )}
                        {isAdmin && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost">
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete flag “{f.key}”?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the flag and its rules.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => remove(f.key)}
                                  className="bg-red-600 hover:bg-red-600/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        {!isAdmin && (
                          <span className="text-xs text-gray-500">Read-only access</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {flags.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-gray-900">
                      No flags yet. Create your first flag.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
