"use client";

import { useState } from "react";
import { Loader2, AlertCircle, Plus } from "lucide-react";
import { ModeNav } from "@/components/mode-nav";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Reveal } from "@/components/reveal";
import { benchRun } from "@/lib/api";
import { BenchResult } from "@/lib/types";
import { cn } from "@/lib/utils";

const BENCH_MODELS = [
  "openai/gpt-4o",
  "openai/gpt-4o-mini",
  "anthropic/claude-3.5-sonnet",
  "google/gemini-pro-1.5",
  "meta-llama/llama-3.1-70b-instruct",
  "mistralai/mistral-large",
];

// DEMO: hardcoded sample data — remove when backend is live
const SAMPLE_BENCH: BenchResult[] = [
  { model: "anthropic/claude-3.5-sonnet", score: 9, latency_ms: 1840, tokens: 1320, cost: 0.00642, quality_per_dollar: 1402 },
  { model: "google/gemini-pro-1.5", score: 8, latency_ms: 1560, tokens: 1290, cost: 0.0019, quality_per_dollar: 4210 },
  { model: "openai/gpt-4o", score: 8, latency_ms: 2210, tokens: 1410, cost: 0.0118, quality_per_dollar: 678 },
  { model: "openai/gpt-4o-mini", score: 6, latency_ms: 980, tokens: 1205, cost: 0.00038, quality_per_dollar: 15789 },
];

const shortName = (m: string) => m.split("/")[1] ?? m;

export default function BenchPage() {
  const [prompt, setPrompt] = useState("");
  const [selected, setSelected] = useState<string[]>(["openai/gpt-4o-mini", "anthropic/claude-3.5-sonnet"]);
  const [results, setResults] = useState<BenchResult[] | null>(SAMPLE_BENCH);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (m: string) => setSelected((s) => (s.includes(m) ? s.filter((x) => x !== m) : [...s, m]));

  const run = async () => {
    if (!prompt.trim() || selected.length === 0) return;
    setIsLoading(true);
    setError(null);
    setResults(null);
    try {
      const res = await benchRun({ prompt, models: selected });
      setResults(res.results);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Benchmark failed");
    } finally {
      setIsLoading(false);
    }
  };

  const winner = results?.find((r) => !r.error);
  const cheapest = results?.filter((r) => r.quality_per_dollar != null)
    .sort((a, b) => (b.quality_per_dollar ?? 0) - (a.quality_per_dollar ?? 0))[0];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <ModeNav />
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Reveal>
          <p className="font-eyebrow text-xs text-foreground/60">Bench Mode</p>
          <h1 className="font-display mt-2 text-5xl">Benchmark across models.</h1>
          <p className="mt-4 max-w-xl text-sm text-foreground/70">
            Run one prompt across models and compare quality, latency, tokens, and cost — so you
            pick the cheapest model that still performs.
          </p>
        </Reveal>

        {/* Composer */}
        <Reveal>
          <div className="relative mt-10 rounded-[10px] border border-dashed border-white/15 bg-card p-6">
            <Plus className="pointer-events-none absolute -left-[7px] -top-[7px] h-3.5 w-3.5 text-primary/70" />
            <Plus className="pointer-events-none absolute -bottom-[7px] -right-[7px] h-3.5 w-3.5 text-primary/70" />
            <Label htmlFor="bench-prompt" className="font-eyebrow text-xs text-muted-foreground">
              Prompt
            </Label>
            <Textarea
              id="bench-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Paste the prompt you want to compare across models..."
              className="mt-3 min-h-[100px] border-white/10 bg-black/40 text-base"
              disabled={isLoading}
            />
            <div className="mt-6">
              <p className="font-eyebrow mb-2 text-xs text-muted-foreground">Models · {selected.length}</p>
              <div className="flex flex-wrap gap-2">
                {BENCH_MODELS.map((m) => (
                  <Button key={m} type="button" size="sm" variant={selected.includes(m) ? "default" : "outline"} onClick={() => toggle(m)} disabled={isLoading}>
                    {shortName(m)}
                  </Button>
                ))}
              </div>
            </div>
            <Button className="mt-6 w-full" onClick={run} disabled={isLoading || !prompt.trim() || selected.length === 0}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Benchmarking {selected.length} models...
                </>
              ) : (
                "Run Benchmark"
              )}
            </Button>
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </Reveal>

        {/* Results */}
        {results && results.length > 0 && (
          <section className="mt-16">
            <p className="font-eyebrow text-xs text-foreground/60">Results</p>
            <h2 className="font-display mt-2 text-3xl">The comparison.</h2>

            {/* Highlights */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {winner && (
                <div className="relative rounded-[10px] border border-primary bg-card p-5">
                  <Plus className="pointer-events-none absolute -left-[7px] -top-[7px] h-3.5 w-3.5 text-primary/70" />
                  <p className="font-eyebrow text-[10px] text-primary">Best quality</p>
                  <p className="font-display mt-2 text-2xl">{shortName(winner.model)}</p>
                  <p className="mt-1 text-sm text-foreground/70">Score {winner.score}/10 · ${winner.cost?.toFixed(5)}</p>
                </div>
              )}
              {cheapest && (
                <div className="rounded-[10px] border border-dashed border-white/15 bg-card p-5">
                  <p className="font-eyebrow text-[10px] text-muted-foreground">Best quality / $</p>
                  <p className="font-display mt-2 text-2xl">{shortName(cheapest.model)}</p>
                  <p className="mt-1 text-sm text-foreground/70">{cheapest.quality_per_dollar} pts per $ · score {cheapest.score}/10</p>
                </div>
              )}
            </div>

            {/* Table */}
            <div className="mt-6 overflow-x-auto rounded-[10px] border border-dashed border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="font-eyebrow text-[10px] text-muted-foreground">
                  <tr className="border-b border-dashed border-white/10">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Model</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3">Latency</th>
                    <th className="px-4 py-3">Tokens</th>
                    <th className="px-4 py-3">Cost</th>
                    <th className="px-4 py-3">Quality/$</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={r.model} className="border-b border-dashed border-white/10 last:border-0">
                      <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-3 font-medium">{shortName(r.model)}</td>
                      {r.error ? (
                        <td colSpan={5} className="px-4 py-3 text-destructive">{r.error}</td>
                      ) : (
                        <>
                          <td className={cn("px-4 py-3 font-semibold", (r.score ?? 0) >= 8 && "text-primary")}>{r.score}/10</td>
                          <td className="px-4 py-3 text-foreground/70">{r.latency_ms}ms</td>
                          <td className="px-4 py-3 text-foreground/70">{r.tokens}</td>
                          <td className="px-4 py-3 text-foreground/70">${r.cost?.toFixed(5)}</td>
                          <td className="px-4 py-3 text-foreground/70">{r.quality_per_dollar ?? "—"}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
