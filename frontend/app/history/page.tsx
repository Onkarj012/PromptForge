"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { ModeNav } from "@/components/mode-nav";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { listRuns } from "@/lib/api";
import { RunSummary } from "@/lib/types";

export default function HistoryPage() {
  const [runs, setRuns] = useState<RunSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listRuns()
      .then(setRuns)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load history"));
  }, []);

  return (
    <main className="min-h-screen bg-background bg-blueprint text-foreground">
      <ModeNav />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <p className="font-eyebrow text-xs text-foreground/60">History</p>
        <h1 className="font-display mt-2 text-4xl">Your refinement runs.</h1>

        {error && (
          <Alert variant="destructive" className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!runs && !error && (
          <div className="mt-10 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading...
          </div>
        )}

        {runs && runs.length === 0 && (
          <p className="mt-10 text-sm text-muted-foreground">
            No runs yet. Forge a prompt to see it here.
          </p>
        )}

        {runs && runs.length > 0 && (
          <div className="mt-8 grid gap-3">
            {runs.map((r) => (
              <div
                key={r.run_id}
                className="rounded-[10px] border border-dashed border-white/10 bg-white/[0.02] p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="line-clamp-2 text-sm text-foreground/80">
                    {r.original_prompt ?? "(no prompt stored)"}
                  </p>
                  <span className="font-display shrink-0 text-2xl text-primary">
                    {r.final_score != null ? `${r.final_score}/10` : "—"}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-4 font-eyebrow text-[10px] text-muted-foreground">
                  <span>{r.creator_model}</span>
                  <span>${(r.total_cost ?? 0).toFixed(5)}</span>
                  <span>{r.total_tokens ?? 0} tokens</span>
                  <span>{r.max_iterations} max iter</span>
                  <span>{r.created_at ? new Date(r.created_at).toLocaleString() : ""}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
