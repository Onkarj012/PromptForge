"use client";

import { useEffect, useState } from "react";
import { AlertCircle, ChevronRight, Loader2, X } from "lucide-react";
import { ModeNav } from "@/components/mode-nav";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { benchRun, markBaseline, listBaselines } from "@/lib/api";
import { BenchResponse, Baseline } from "@/lib/types";
import { cn } from "@/lib/utils";

const MODELS = ["openai/gpt-4o", "openai/gpt-4o-mini", "anthropic/claude-3.5-sonnet", "google/gemini-pro-1.5", "meta-llama/llama-3.1-70b-instruct", "mistralai/mistral-large"];
const TEMPS = [0, 0.2, 0.7, 1];
const MAX_COMBOS = 36;
const short = (m: string) => m.split("/")[1] ?? m;

// DEMO: hardcoded sample — replaced on a real run.
const DEMO: BenchResponse = {
  run_id: "demo",
  cells: [
    { model: "anthropic/claude-3.5-sonnet", temperature: 0.2, score: 9, latency_ms: 1700, tokens: 1280, cost: 0.0061, outputs: [{ input: "Customer wants a refund for a late order.", output: "I'm sorry your order arrived late. I've issued a full refund to your original payment method; it'll appear in 3–5 days.", score: 9 }] },
    { model: "openai/gpt-4o", temperature: 0.2, score: 8, latency_ms: 2100, tokens: 1350, cost: 0.011, outputs: [{ input: "Customer wants a refund for a late order.", output: "Happy to help — I can process that refund for the late delivery. Confirming the order id…", score: 8 }] },
    { model: "anthropic/claude-3.5-sonnet", temperature: 0.7, score: 8, latency_ms: 1820, tokens: 1300, cost: 0.0063, outputs: [{ input: "Customer wants a refund for a late order.", output: "Totally understand the frustration with a late order! Let me get that refund sorted for you right away.", score: 8 }] },
    { model: "openai/gpt-4o-mini", temperature: 0.2, score: 6, latency_ms: 900, tokens: 1150, cost: 0.0004, outputs: [{ input: "Customer wants a refund for a late order.", output: "Okay. Refund issued.", score: 6 }] },
  ],
  baseline: null,
};

function scoreColor(s: number) {
  return s >= 8 ? "text-primary" : s >= 5 ? "text-foreground" : "text-destructive";
}

export default function BenchPage() {
  const [systemPrompt, setSystemPrompt] = useState("");
  const [testInputs, setTestInputs] = useState<string[]>([""]);
  const [models, setModels] = useState<string[]>(["openai/gpt-4o-mini", "anthropic/claude-3.5-sonnet"]);
  const [temps, setTemps] = useState<number[]>([0.2, 0.7]);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [criteria, setCriteria] = useState("");
  const [baselineId, setBaselineId] = useState("");
  const [baselines, setBaselines] = useState<Baseline[]>([]);
  const [result, setResult] = useState<BenchResponse | null>(DEMO);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedBaseline, setSavedBaseline] = useState(false);

  useEffect(() => {
    listBaselines().then(setBaselines).catch(() => {});
  }, []);

  const validInputs = testInputs.map((t) => t.trim()).filter(Boolean);
  const combos = models.length * temps.length * (validInputs.length || 1);
  const overLimit = combos > MAX_COMBOS;

  const toggle = <T,>(arr: T[], v: T, set: (x: T[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const run = async () => {
    if (!systemPrompt.trim() || validInputs.length === 0 || models.length === 0 || temps.length === 0 || overLimit) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    setSavedBaseline(false);
    try {
      const res = await benchRun({
        system_prompt: systemPrompt, test_inputs: validInputs, models, temperatures: temps,
        max_tokens: maxTokens, criteria: criteria || undefined, baseline_id: baselineId || undefined,
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Benchmark failed");
    } finally {
      setIsLoading(false);
    }
  };

  const saveBaseline = async () => {
    if (!result || result.run_id === "demo") return;
    try {
      await markBaseline(result.run_id);
      setSavedBaseline(true);
      listBaselines().then(setBaselines).catch(() => {});
    } catch {
      /* ignore */
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <ModeNav />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <p className="font-eyebrow text-xs text-foreground/60">Bench Mode</p>
        <h1 className="font-display mt-2 text-4xl">Test your prompt across models.</h1>
        <p className="mt-3 max-w-2xl text-sm text-foreground/70">
          Run your system prompt against multiple models and temperatures over real test inputs.
          See how the output changes, score each, and lock a baseline to catch regressions.
        </p>

        {/* Config */}
        <div className="mt-8 grid gap-5 rounded-[10px] border border-dashed border-white/15 bg-card p-6">
          <div>
            <Label htmlFor="sys" className="font-eyebrow text-xs text-muted-foreground">System / agent prompt</Label>
            <Textarea id="sys" value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} placeholder="You are a support agent for… Always…" className="mt-2 min-h-[120px] border-white/10 bg-black/40 text-base" disabled={isLoading} />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label className="font-eyebrow text-xs text-muted-foreground">Test inputs</Label>
              <button onClick={() => setTestInputs((t) => [...t, ""])} className="font-eyebrow text-[10px] text-primary hover:underline">+ add</button>
            </div>
            <div className="mt-2 grid gap-2">
              {testInputs.map((ti, i) => (
                <div key={i} className="flex gap-2">
                  <input value={ti} onChange={(e) => setTestInputs((arr) => arr.map((x, j) => (j === i ? e.target.value : x)))} placeholder={`Representative user message #${i + 1}`} className="flex-1 rounded-[10px] border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60" disabled={isLoading} />
                  {testInputs.length > 1 && (
                    <button onClick={() => setTestInputs((arr) => arr.filter((_, j) => j !== i))} className="grid w-9 place-items-center rounded-[10px] border border-dashed border-white/10 text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="font-eyebrow mb-1.5 text-[10px] text-muted-foreground">Models · {models.length}</p>
              <div className="flex flex-wrap gap-1.5">
                {MODELS.map((m) => (
                  <button key={m} onClick={() => toggle(models, m, setModels)} disabled={isLoading} className={cn("rounded-[7px] border border-dashed px-2.5 py-1 text-[11px]", models.includes(m) ? "border-primary bg-primary/10 text-foreground" : "border-white/10 text-muted-foreground hover:text-foreground")}>{short(m)}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="font-eyebrow mb-1.5 text-[10px] text-muted-foreground">Temperatures · {temps.length}</p>
              <div className="flex flex-wrap gap-1.5">
                {TEMPS.map((t) => (
                  <button key={t} onClick={() => toggle(temps, t, setTemps)} disabled={isLoading} className={cn("rounded-[7px] border border-dashed px-2.5 py-1 text-[11px]", temps.includes(t) ? "border-primary bg-primary/10 text-foreground" : "border-white/10 text-muted-foreground hover:text-foreground")}>{t}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="maxtok" className="font-eyebrow text-xs text-muted-foreground">Max tokens / call</Label>
              <input id="maxtok" type="number" min={1} max={8000} value={maxTokens} onChange={(e) => setMaxTokens(Math.max(1, Math.min(8000, parseInt(e.target.value) || 1024)))} className="mt-2 w-full rounded-[10px] border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none" disabled={isLoading} />
            </div>
            <div>
              <Label htmlFor="crit" className="font-eyebrow text-xs text-muted-foreground">Criteria (optional)</Label>
              <input id="crit" value={criteria} onChange={(e) => setCriteria(e.target.value)} placeholder="concise, on-brand, no refunds over $50" className="mt-2 w-full rounded-[10px] border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60" disabled={isLoading} />
            </div>
            <div>
              <Label htmlFor="base" className="font-eyebrow text-xs text-muted-foreground">Compare to baseline</Label>
              <select id="base" value={baselineId} onChange={(e) => setBaselineId(e.target.value)} className="mt-2 w-full rounded-[10px] border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none" disabled={isLoading}>
                <option value="">None</option>
                {baselines.map((b) => (<option key={b.run_id} value={b.run_id}>{b.label || b.run_id.slice(0, 8)}</option>))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className={cn("font-eyebrow text-[10px]", overLimit ? "text-destructive" : "text-muted-foreground")}>
              {combos} runs {overLimit ? `· exceeds ${MAX_COMBOS}` : `· max ${MAX_COMBOS}`}
            </span>
            <Button onClick={run} disabled={isLoading || overLimit || !systemPrompt.trim() || validInputs.length === 0}>
              {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running {combos}…</>) : "Run benchmark"}
            </Button>
          </div>
          {error && (<Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>)}
        </div>

        {/* Results */}
        {result && result.cells.length > 0 && (
          <section className="mt-12">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-3xl">Results.</h2>
              <Button variant="outline" size="sm" onClick={saveBaseline} disabled={result.run_id === "demo"}>
                {savedBaseline ? "Saved as baseline" : "Save as baseline"}
              </Button>
            </div>

            {result.baseline && (
              <div className={cn("mt-4 rounded-[10px] border p-4 text-sm", result.baseline.regressed ? "border-destructive bg-destructive/10" : "border-primary bg-primary/10")}>
                <p className="font-eyebrow text-[10px]">{result.baseline.regressed ? "Regression detected" : "No regression vs baseline"}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs">
                  {result.baseline.deltas.map((d) => (
                    <span key={`${d.model}-${d.temperature}`} className={cn(d.pass ? "text-foreground/70" : "text-destructive")}>
                      {short(d.model)}@{d.temperature}: {d.delta >= 0 ? "+" : ""}{d.delta}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 space-y-3">
              {result.cells.map((c, i) => (
                <details key={`${c.model}-${c.temperature}`} className="group overflow-hidden rounded-[10px] border border-dashed border-white/10 bg-card">
                  <summary className="flex cursor-pointer list-none items-center gap-4 px-4 py-3">
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
                    <span className="w-8 font-eyebrow text-[10px] text-muted-foreground">#{i + 1}</span>
                    <span className="flex-1 font-medium">{short(c.model)} <span className="text-muted-foreground">@ {c.temperature}</span></span>
                    <span className={cn("font-display text-2xl", scoreColor(c.score))}>{c.score}/10</span>
                    <span className="hidden font-eyebrow text-[10px] text-muted-foreground sm:block">{c.latency_ms}ms · {c.tokens}tok · ${c.cost.toFixed(5)}</span>
                  </summary>
                  <div className="space-y-3 border-t border-white/10 px-4 py-4">
                    {c.outputs.map((o, j) => (
                      <div key={j} className="rounded-[10px] border border-dashed border-white/10 bg-black/30 p-3">
                        <p className="font-eyebrow text-[10px] text-muted-foreground">Input · score {o.score}/10</p>
                        <p className="mt-1 text-xs text-foreground/60">{o.input}</p>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/85">{o.output}</p>
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
