"use client";

import { useEffect, useState } from "react";
import { ModeNav } from "@/components/mode-nav";
import { Reveal } from "@/components/reveal";
import { listRuns } from "@/lib/api";
import { RunSummary } from "@/lib/types";

// DEMO: hardcoded sample data — remove when backend is live
const SAMPLE_RUNS: RunSummary[] = [
  {
    run_id: "demo-1", mode: "user_defined",
    creator_model: "anthropic/claude-3.5-sonnet", critic_model: "openai/gpt-4o-mini",
    original_prompt: "Build a SaaS landing page with Next.js, Supabase auth, and Stripe billing.",
    final_score: 9, total_cost: 0.0123, total_tokens: 3420, max_iterations: 3,
    created_at: new Date(Date.now() - 3600_000).toISOString(),
  },
  {
    run_id: "demo-2", mode: "user_defined",
    creator_model: "openai/gpt-4o", critic_model: "openai/gpt-4o-mini",
    original_prompt: "Write a Cursor prompt to add JWT auth to a FastAPI service.",
    final_score: 8, total_cost: 0.0087, total_tokens: 2610, max_iterations: 2,
    created_at: new Date(Date.now() - 86_400_000).toISOString(),
  },
  {
    run_id: "demo-3", mode: "user_defined",
    creator_model: "google/gemini-pro-1.5", critic_model: "openai/gpt-4o-mini",
    original_prompt: "Generate a v0 prompt for a pricing page with three tiers.",
    final_score: 7, total_cost: 0.0019, total_tokens: 1980, max_iterations: 2,
    created_at: new Date(Date.now() - 3 * 86_400_000).toISOString(),
  },
];

const shortName = (m?: string) => (m ? m.split("/")[1] ?? m : "—");

export default function HistoryPage() {
  const [runs, setRuns] = useState<RunSummary[]>(SAMPLE_RUNS);

  useEffect(() => {
    listRuns()
      .then((r) => r.length > 0 && setRuns(r)) // keep demo data if backend empty/offline
      .catch(() => {});
  }, []);

  const avg = runs.length
    ? (runs.reduce((s, r) => s + (r.final_score ?? 0), 0) / runs.length).toFixed(1)
    : "—";
  const spend = runs.reduce((s, r) => s + (r.total_cost ?? 0), 0);
  const summary = [
    { label: "Runs", value: runs.length },
    { label: "Avg score", value: `${avg}/10` },
    { label: "Total spend", value: `$${spend.toFixed(4)}` },
  ];

  return (
    <main className="min-h-screen bg-background bg-blueprint text-foreground">
      <ModeNav />
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Reveal>
          <p className="font-eyebrow text-xs text-foreground/60">History</p>
          <h1 className="font-display mt-2 text-5xl">Your refinement runs.</h1>
        </Reveal>

        <Reveal>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {summary.map((s) => (
              <div key={s.label} className="rounded-[10px] border border-dashed border-white/10 bg-white/[0.02] p-4">
                <p className="font-eyebrow text-[10px] text-muted-foreground">{s.label}</p>
                <p className="font-display mt-2 text-3xl text-foreground">{s.value}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {runs.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">No runs yet. Forge a prompt to see it here.</p>
        ) : (
          <div className="mt-8 grid gap-3">
            {runs.map((r) => (
              <div key={r.run_id} className="rounded-[10px] border border-dashed border-white/10 bg-card p-5 transition-colors hover:border-white/20">
                <div className="flex items-start justify-between gap-4">
                  <p className="line-clamp-2 text-sm text-foreground/85">{r.original_prompt ?? "(no prompt stored)"}</p>
                  <span className={`font-display shrink-0 text-3xl ${(r.final_score ?? 0) >= 8 ? "text-primary" : "text-foreground"}`}>
                    {r.final_score != null ? `${r.final_score}/10` : "—"}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 font-eyebrow text-[10px] text-muted-foreground">
                  <span>{shortName(r.creator_model)}</span>
                  <span>${(r.total_cost ?? 0).toFixed(5)}</span>
                  <span>{r.total_tokens ?? 0} tokens</span>
                  <span>{r.max_iterations} iter</span>
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
