"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type Result = { value: boolean; reason: string } | null

export function EvaluationPanel({ flagKey }: { flagKey: string }) {
  const [unitId, setUnitId] = useState("user_123")
  const [attributes, setAttributes] = useState('{"country":"US","plan":"pro"}')
  const [result, setResult] = useState<Result>(null)
  const lastPayload = useRef<{ key: string; unitId: string; attributes: any } | null>(null)

  async function evaluate() {
    let attrs: any = {}
    try {
      attrs = attributes ? JSON.parse(attributes) : {}
    } catch {
      setResult({ value: false, reason: "Invalid JSON in attributes" })
      return
    }
    const payload = { key: flagKey, unitId, attributes: attrs }
    lastPayload.current = payload
    const res = await fetch("/api/v1/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => r.json())
    setResult(res)
  }

  // Re-evaluate on global "flags:updated" event (simulated realtime)
  useEffect(() => {
    function onUpdate() {
      if (lastPayload.current) {
        evaluate()
      }
    }
    // @ts-ignore
    window.addEventListener("flags:updated", onUpdate)
    return () => {
      // @ts-ignore
      window.removeEventListener("flags:updated", onUpdate)
    }
  }, [])

  return (
    <Card className="rounded-2xl shadow-md">
      <CardHeader>
        <CardTitle className="text-gray-900">Test Evaluation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <div>
            <Label>Unit ID</Label>
            <Input className="bg-white" value={unitId} onChange={(e) => setUnitId(e.target.value)} />
          </div>
          <div>
            <Label>Attributes JSON</Label>
            <Textarea
              className="bg-white"
              value={attributes}
              onChange={(e) => setAttributes(e.target.value)}
              rows={6}
            />
          </div>
          <div>
            <Button className="bg-blue-600 hover:bg-blue-600/90" onClick={evaluate}>
              Evaluate
            </Button>
          </div>
          {result && (
            <div className="rounded-2xl border border-gray-200 p-4 bg-white">
              <div className="text-sm text-gray-900">Output: {result.value ? "true" : "false"}</div>
              <div className="text-sm text-gray-900">Reason: {result.reason}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
