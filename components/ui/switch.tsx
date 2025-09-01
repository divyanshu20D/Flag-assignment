"use client"

import type * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted dark:data-[state=unchecked]:bg-muted/60",
        "border border-border focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring shadow-xs",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-4 rounded-full ring-0 transition-transform shadow-sm",
          "bg-background dark:bg-foreground",
          "data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0",
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
