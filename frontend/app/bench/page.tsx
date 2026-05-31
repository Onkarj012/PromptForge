"use client";

import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { ModeNav } from "@/components/mode-nav";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

export default function BenchPage() {
  const [prompt, setPrompt] = useState("");
  const [selected, setSelected] = useState<string[]>([
    "openai/gpt-4o-mini",
    "anthropic/claude-3.5-sonnet",
  ]);
  const [results, setResults] = useState<BenchResult[] | null>(SAMPLE_BENCH);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (m: string) =>
    setSelected((s) => (s.includes(m) ? s.filter((x) => x !== m) : [...s, m]));

  const run = async () => {
    if (prompt.trim().length < 1 || selected.length === 0) return;
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

  return (
    <main className="min-h-screen bg-background bg-blueprint text-foreground">
      <ModeNav />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <p className="font-eyebrow text-xs text-foreground/60">Bench Mode</p>
        <h1 className="font-display mt-2 text-4xl">Benchmark across models.</h1>
        <p className="mt-3 max-w-xl text-sm text-foreground/70">
          Run one prompt across models and compare quality, latency, tokens, and cost.
        </p>

        <div className="mt-8 grid gap-4 rounded-[10px] border border-dashed border-white/10 bg-white/[0.02] p-5">
          <div>
            <Label htmlFor="bench-prompt">Prompt</Label>
            <Textarea
              id="bench-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Paste the prompt you want to compare across models..."
              className="mt-2 min-h-[120px] border-white/10 bg-black/40"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label>Models ({selected.length})</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {BENCH_MODELS.map((m) => (
                <Button
                  key={m}
                  type="button"
                  size="sm"
                  variant={selected.includes(m) ? "default" : "outline"}
                  onClick={() => toggle(m)}
                  disabled={isLoading}
                >
                  {m.split("/")[1] ?? m}
                </Button>
              ))}
            </div>
          </div>
          <Button onClick={run} disabled={isLoading || !prompt.trim() || selected.length === 0}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Benchmarking {selected.length} models...
              </>
            ) : (
              "Run Benchmark"
            )}
          </Button>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        {results && (
          <div className="mt-8 overflow-x-auto rounded-[10px] border border-dashed border-white/10">
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
                  <tr key={r.model} className="border-b border-dashed border-white/10">
                    <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-3 font-medium">{r.model.split("/")[1] ?? r.model}</td>
                    {r.error ? (
                      <td colSpan={5} className="px-4 py-3 text-destructive">{r.error}</td>
                    ) : (
                      <>
                        <td className={cn("px-4 py-3 font-semibold", (r.score ?? 0) >= 8 ? "text-primary" : "")}>
                          {r.score}/10
                        </td>
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
        )}
      </div>
    </main>
  );
}
