"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/refine", label: "Forge" },
  { href: "/bench", label: "Bench" },
  { href: "/history", label: "History" },
];

export function ModeNav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 border-b border-dashed border-white/10 bg-background/70 backdrop-blur-[10px]">
      <div className="flex items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="font-display text-xl">
          PromptForge<span className="text-primary">.</span>
        </Link>
        <nav className="flex items-center gap-1 rounded-[10px] border border-dashed border-white/10 p-1">
          {LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "font-eyebrow rounded-[7px] px-3 py-1.5 text-[11px] transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
