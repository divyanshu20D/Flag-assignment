"use client"

import useSWR, { mutate } from "swr"
import Link from "next/link"
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
import type { Flag } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function FlagTable() {
  const { data, isLoading } = useSWR<{ flags: Flag[] }>("/api/flags", fetcher)
  const flags = data?.flags ?? []
  const { toast } = useToast()

  async function toggleEnabled(flag: Flag, next: boolean) {
    await fetch(`/api/flags/${encodeURIComponent(flag.key)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: next }),
    })
    mutate("/api/flags")
    // @ts-ignore
    window.dispatchEvent(new Event("flags:updated"))
  }

  async function remove(key: string) {
    await fetch(`/api/flags/${encodeURIComponent(key)}`, { method: "DELETE" })
    mutate("/api/flags")
    // @ts-ignore
    window.dispatchEvent(new Event("flags:updated"))
    toast({ title: "Flag deleted", description: `“${key}” was removed successfully.` })
  }

  return (
    <Card className="rounded-2xl shadow-md">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-gray-900">Feature Flags</CardTitle>
        <Button asChild className="bg-blue-600 hover:bg-blue-600/90">
          <Link href="/flags/new">+ Create Flag</Link>
        </Button>
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
                        aria-label={`Toggle ${f.key}`}
                      />
                    </TableCell>
                    <TableCell>{new Date(f.updatedAt).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/flags/${encodeURIComponent(f.key)}/edit`}>Edit</Link>
                        </Button>
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
