"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMemo, useState } from "react"
import type { Flag } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AuditLogsPage() {
  const { data: flagsData } = useSWR<{ flags: Flag[] }>("/api/flags", fetcher)
  const [filter, setFilter] = useState<string>("all")
  const qs = useMemo(() => (filter !== "all" ? `?flag=${encodeURIComponent(filter)}` : ""), [filter])
  const { data, isLoading } = useSWR<{ logs: any[] }>(`/api/audit-logs${qs}`, fetcher)

  const logs = data?.logs ?? []

  return (
    <Card className="rounded-2xl shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-gray-900">Audit Logs</CardTitle>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v)}>
            <SelectTrigger className="bg-white min-w-40">
              <SelectValue placeholder="Filter by flag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Flags</SelectItem>
              {(flagsData?.flags ?? []).map((f) => (
                <SelectItem key={f.key} value={f.key}>
                  {f.key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-sm text-gray-900">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Flag Key</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>{new Date(l.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{l.user}</TableCell>
                    <TableCell>{l.flagKey}</TableCell>
                    <TableCell>{l.action}</TableCell>
                  </TableRow>
                ))}
                {logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-gray-900">
                      No logs to display.
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
