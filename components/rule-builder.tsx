"use client"

import { useId } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Rule } from "@/lib/types"

type Props = {
  rules: Rule[]
  onChange: (rules: Rule[]) => void
}

const ATTRIBUTES = ["country", "device", "plan"]
const COMPARATORS = [
  { label: "=", value: "eq" },
  { label: "in", value: "in" },
]

export function RuleBuilder({ rules, onChange }: Props) {
  const genId = useId()

  function update(idx: number, patch: Partial<Rule>) {
    const next = rules.slice()
    next[idx] = { ...next[idx], ...patch }
    onChange(next)
  }

  function add() {
    onChange([
      ...rules,
      {
        id: genId + "-" + (crypto?.randomUUID?.() ?? Math.random().toString(16).slice(2)),
        attribute: "country",
        comparator: "in",
        value: "",
        rollout: 100,
      },
    ])
  }

  function remove(idx: number) {
    const next = rules.slice()
    next.splice(idx, 1)
    onChange(next)
  }

  return (
    <Card className="rounded-2xl shadow-md">
      <CardHeader>
        <CardTitle className="text-gray-900">Rules</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {rules.map((r, idx) => {
          const attrId = `rule-${idx}-attribute`
          const compId = `rule-${idx}-comparator`
          const valId = `rule-${idx}-value`
          const rollId = `rule-${idx}-rollout`
          return (
            <div key={r.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
              <div className="grid gap-1.5">
                <Label htmlFor={attrId}>Attribute</Label>
                <Select value={r.attribute} onValueChange={(v) => update(idx, { attribute: v })}>
                  <SelectTrigger id={attrId}>
                    <SelectValue placeholder="Attribute" />
                  </SelectTrigger>
                  <SelectContent>
                    {ATTRIBUTES.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor={compId}>Comparator</Label>
                <Select value={r.comparator} onValueChange={(v) => update(idx, { comparator: v as any })}>
                  <SelectTrigger id={compId}>
                    <SelectValue placeholder="Comparator" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPARATORS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor={valId}>Value</Label>
                <Input
                  id={valId}
                  placeholder="e.g. US,CA"
                  value={r.value}
                  onChange={(e) => update(idx, { value: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor={rollId}>Rollout %</Label>
                <Input
                  id={rollId}
                  type="number"
                  min={0}
                  max={100}
                  value={r.rollout}
                  onChange={(e) => update(idx, { rollout: Number(e.target.value) })}
                />
              </div>
              <div className="flex gap-2 self-end">
                <Button variant="outline" className="w-full bg-transparent" onClick={() => remove(idx)}>
                  Remove
                </Button>
              </div>
            </div>
          )
        })}
        <div className="pt-2">
          <Button className="bg-blue-600 hover:bg-blue-600/90" onClick={add}>
            Add Rule
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
