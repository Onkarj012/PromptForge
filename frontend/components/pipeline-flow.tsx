"use client";

import { useEffect, useState } from "react";
import { FileText, Wand2, Search, RefreshCw, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STAGES = [
  { label: "Prompt", icon: FileText },
  { label: "Creator", icon: Wand2 },
  { label: "Critic", icon: Search },
  { label: "Iterate", icon: RefreshCw },
  { label: "Refined", icon: Check },
];

// Animated explainer: a prompt flowing through the agent pipeline.
// When `streaming`, the active stage tracks the live run; otherwise it auto-plays a demo loop.
export function PipelineFlow({ phase, streaming }: { phase: number; streaming: boolean }) {
  const [demo, setDemo] = useState(0);
  useEffect(() => {
    if (streaming) return;
    const id = setInterval(() => setDemo((d) => (d + 1) % STAGES.length), 1100);
    return () => clearInterval(id);
  }, [streaming]);
  const active = streaming ? phase : demo;

  return (
    <div className="rounded-[10px] border border-dashed border-white/10 bg-card/40 p-5">
      <div className="flex items-start">
        {STAGES.map((s, i) => (
          <div key={s.label} className={cn("flex items-start", i < STAGES.length - 1 && "flex-1")}>
            <div className="flex w-16 flex-col items-center gap-2">
              <div
                className={cn(
                  "grid h-11 w-11 place-items-center rounded-[10px] border transition-all duration-500",
                  i === active
                    ? "scale-110 border-primary bg-primary/15 text-primary shadow-[0_0_24px_rgba(242,65,0,0.3)]"
                    : i < active
                      ? "border-primary/40 text-primary/70"
                      : "border-white/10 text-muted-foreground",
                )}
              >
                <s.icon className={cn("h-4 w-4", i === active && s.label === "Iterate" && "animate-spin")} />
              </div>
              <span className={cn("font-eyebrow text-[10px]", i === active ? "text-foreground" : "text-muted-foreground")}>
                {s.label}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <div
                className={cn(
                  "relative mt-[22px] h-px flex-1 border-t border-dashed",
                  i < active ? "border-primary/50" : "border-white/15",
                )}
              >
                {i === active - 1 && (
                  <span className="flow-dot absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_8px_rgba(242,65,0,0.9)]" />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
