"use client"

import { useEffect, useState } from "react"
import useSWR, { mutate } from "swr"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { RuleBuilder } from "./rule-builder"
import { EvaluationPanel } from "./evaluation-panel"
import type { Flag, Rule } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function FlagForm({ mode, flagKey }: { mode: "create" | "edit"; flagKey?: string }) {
  const router = useRouter()
  const isEdit = mode === "edit"

  const { data } = useSWR<{ flag: Flag }>(
    isEdit && flagKey ? `/api/flags/${encodeURIComponent(flagKey)}` : null,
    fetcher,
  )

  const [key, setKey] = useState(flagKey ?? "")
  const [defaultValue, setDefaultValue] = useState<"true" | "false">("false")
  const [enabled, setEnabled] = useState(false)
  const [rules, setRules] = useState<Rule[]>([])

  useEffect(() => {
    if (data?.flag && isEdit) {
      setKey(data.flag.key)
      setDefaultValue(data.flag.defaultValue ? "true" : "false")
      setEnabled(data.flag.enabled)
      setRules(data.flag.rules)
    }
  }, [data, isEdit])

  async function onSave() {
    if (!key.trim()) return
    const payload: Flag = {
      key: key.trim(),
      defaultValue: defaultValue === "true",
      enabled,
      rules,
      updatedAt: new Date().toISOString(),
    }
    if (isEdit) {
      await fetch(`/api/flags/${encodeURIComponent(key)}`, {
        // Fixed unterminated template literal
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    } else {
      await fetch(`/api/flags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    }
    mutate("/api/flags")
    // @ts-ignore
    window.dispatchEvent(new Event("flags:updated"))
    router.push("/flags")
  }

  function onCancel() {
    router.push("/flags")
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card className="rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle className="text-gray-900">{isEdit ? "Edit Flag" : "Create Flag"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 grid gap-1.5">
                <Label htmlFor="flag-key">Key</Label>
                <Input
                  id="flag-key"
                  placeholder="e.g. new-dashboard"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  disabled={isEdit}
                  className="bg-white"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="default-value">Default Value</Label>
                <Select value={defaultValue} onValueChange={(v) => setDefaultValue(v as "true" | "false")}>
                  <SelectTrigger id="default-value" className="bg-white">
                    <SelectValue placeholder="Select default" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">True</SelectItem>
                    <SelectItem value="false">False</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={enabled} onCheckedChange={setEnabled} id="enabled" />
              <Label htmlFor="enabled">Enabled</Label>
            </div>
          </CardContent>
        </Card>

        <RuleBuilder rules={rules} onChange={setRules} />

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-600/90" onClick={onSave}>
            Save
          </Button>
        </div>
      </div>

      <div className="lg:col-span-1">
        <EvaluationPanel flagKey={key} />
      </div>
    </div>
  )
}
