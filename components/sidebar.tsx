"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/auth/user-menu";

const items = [
  { href: "/flags", label: "Flags" },
  { href: "/audit-logs", label: "Audit Logs" },
  { href: "/settings", label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="h-screen w-full border-r border-gray-200 bg-white flex flex-col">
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <Link href="/flags" className="block">
          <span className="text-xl font-semibold text-gray-900">
            Feature Flags
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-2 overflow-y-auto">
        <ul className="flex flex-col gap-2">
          {items.map((it) => {
            const active = pathname.startsWith(it.href);
            return (
              <li key={it.href}>
                <Link
                  href={it.href}
                  className={cn(
                    "block rounded-2xl px-3 py-2 text-sm",
                    active
                      ? "bg-blue-600 text-white"
                      : "text-gray-900 hover:bg-gray-100"
                  )}
                >
                  {it.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3 border-t border-gray-200 flex-shrink-0">
        <UserMenu />
      </div>
    </aside>
  );
}
