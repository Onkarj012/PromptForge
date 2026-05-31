"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Check, Copy, Loader2, Plus } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ModeNav } from "@/components/mode-nav";
import { PipelineFlow } from "@/components/pipeline-flow";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ModelSelector } from "@/components/model-selector";
import { IterationCard } from "@/components/iteration-card";
import { useForge } from "@/lib/hooks/useRefinement";
import { diffLines } from "@/lib/diff";
import { cn } from "@/lib/utils";

const TOOLS = ["cursor", "bolt", "v0", "claude", "generic"];
const DEPTHS = [
  { key: "quick", label: "Quick", iterations: 2 },
  { key: "balanced", label: "Balanced", iterations: 3 },
  { key: "deep", label: "Deep", iterations: 5 },
] as const;
const STEERS = ["More concise", "Add output format", "Stronger constraints", "Make it for Cursor", "Add examples"];
const VIEWS = ["diff", "side", "versions"] as const;
type View = (typeof VIEWS)[number];

function detectMode(input: string): "improve" | "generate" {
  const t = input.trim();
  if (t.length > 240 || /\n/.test(t) || /\b(you are|your task|respond|output|format|##|return only|step by step)\b/i.test(t))
    return "improve";
  return "generate";
}
function detectTool(input: string): string {
  const t = input.toLowerCase();
  if (/\bcursor\b/.test(t)) return "cursor";
  if (/\bv0\b/.test(t)) return "v0";
  if (/\bbolt\b/.test(t)) return "bolt";
  if (/(next\.?js|react|tailwind|supabase|typescript|api|backend|component|endpoint|\bcode\b)/.test(t)) return "cursor";
  return "generic";
}

function Corners() {
  return (
    <>
      <Plus className="pointer-events-none absolute -left-[7px] -top-[7px] h-3.5 w-3.5 text-primary/70" />
      <Plus className="pointer-events-none absolute -bottom-[7px] -right-[7px] h-3.5 w-3.5 text-primary/70" />
    </>
  );
}

const PillRow = ({ items, value, onPick, render }: { items: string[]; value: string; onPick: (v: string) => void; render?: (v: string) => string }) => (
  <div className="flex flex-wrap gap-1.5">
    {items.map((it) => (
      <button
        key={it}
        onClick={() => onPick(it)}
        className={cn(
          "rounded-[7px] border border-dashed px-2.5 py-1 text-[11px]",
          value === it ? "border-primary bg-primary/10 text-foreground" : "border-white/10 text-muted-foreground hover:text-foreground",
        )}
      >
        {render ? render(it) : it}
      </button>
    ))}
  </div>
);

export default function ForgePage() {
  const [input, setInput] = useState("");
  const [modeOverride, setModeOverride] = useState<"improve" | "generate" | null>(null);
  const [toolOverride, setToolOverride] = useState<string | null>(null);
  const [depthKey, setDepthKey] = useState<string>("balanced");
  const [creatorModel, setCreatorModel] = useState("anthropic/claude-3.5-sonnet");
  const [criticModel, setCriticModel] = useState("openai/gpt-4o-mini");
  const [view, setView] = useState<View>("diff");
  const [steerText, setSteerText] = useState("");
  const [copied, setCopied] = useState(false);

  const { originalPrompt, iterations, finalPrompt, finalScore, totalCost, status, isStreaming, error, start, steer } = useForge();

  const mode = modeOverride ?? detectMode(input);
  const tool = toolOverride ?? detectTool(input);
  const depth = DEPTHS.find((d) => d.key === depthKey) ?? DEPTHS[1];

  const phase = !isStreaming ? 0
    : /draft/i.test(status) ? 1
    : /scor/i.test(status) ? 2
    : /steer|apply/i.test(status) ? 3
    : /complete/i.test(status) ? 4
    : 1;

  const base = () => ({ mode: "user_defined" as const, creator_model: creatorModel, critic_model: criticModel, target_tool: tool });

  const runRefine = () => {
    if (input.trim().length < 10) return;
    start({ ...base(), prompt: input, iterations: depth.iterations });
  };
  const applySteer = (instruction: string) => {
    if (!finalPrompt || isStreaming) return;
    steer({ ...base(), prompt: finalPrompt, iterations: 1, steer: instruction });
    setSteerText("");
  };
  const copyFinal = async () => {
    if (!finalPrompt) return;
    await navigator.clipboard.writeText(finalPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const diff = useMemo(() => (originalPrompt && finalPrompt ? diffLines(originalPrompt, finalPrompt) : []), [originalPrompt, finalPrompt]);

  return (
    <main className="min-h-screen bg-background bg-blueprint text-foreground">
      <ModeNav />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <p className="font-eyebrow text-xs text-foreground/60">Forge Mode</p>
        <h1 className="font-display mt-2 text-4xl">Forge a better prompt.</h1>

        <div className="mt-6">
          <PipelineFlow phase={phase} streaming={isStreaming} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:items-start">
          {/* Composer (sticky on desktop) */}
          <div className="relative rounded-[10px] border border-dashed border-white/15 bg-card p-6 lg:sticky lg:top-24">
            <Corners />
            <div className="mb-3 flex items-center justify-between">
              <Label htmlFor="input" className="font-eyebrow text-xs text-muted-foreground">Your prompt or idea</Label>
              {input.trim().length > 0 && (
                <div className="flex items-center gap-1 font-eyebrow text-[10px]">
                  {(["improve", "generate"] as const).map((m) => (
                    <button key={m} onClick={() => setModeOverride(m)} className={cn("rounded-[7px] px-2 py-1", mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Textarea
              id="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. Build a SaaS landing page with Next.js + Stripe — or paste an existing system prompt to improve."
              className="min-h-[160px] border-white/10 bg-black/40 text-base"
              disabled={isStreaming}
            />
            <div className="mt-5">
              <p className="font-eyebrow mb-1.5 text-[10px] text-muted-foreground">Target tool</p>
              <PillRow items={TOOLS} value={tool} onPick={setToolOverride} />
            </div>
            <div className="mt-4">
              <p className="font-eyebrow mb-1.5 text-[10px] text-muted-foreground">Depth</p>
              <PillRow items={DEPTHS.map((d) => d.key)} value={depthKey} onPick={setDepthKey} render={(k) => {
                const d = DEPTHS.find((x) => x.key === k)!;
                return `${d.label} · ${d.iterations}`;
              }} />
            </div>
            <details className="group mt-5 border-t border-dashed border-white/10 pt-4">
              <summary className="font-eyebrow cursor-pointer list-none text-xs text-muted-foreground hover:text-foreground">+ Models</summary>
              <div className="mt-3 grid gap-4">
                <ModelSelector value={creatorModel} onValueChange={setCreatorModel} label="Creator Model" />
                <ModelSelector value={criticModel} onValueChange={setCriticModel} label="Critic Model" />
              </div>
            </details>
            <Button className="mt-6 w-full" onClick={runRefine} disabled={isStreaming || input.trim().length < 10}>
              {isStreaming ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {status || "Refining…"}</>) : `${mode === "generate" ? "Generate" : "Refine"} prompt`}
            </Button>
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Results */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-eyebrow text-xs text-foreground/60">
                {isStreaming ? status || "Working…" : finalScore != null ? `Result · ${finalScore}/10` : "Result"}
              </p>
              <div className="flex items-center gap-1 rounded-[10px] border border-dashed border-white/10 p-1">
                {VIEWS.map((v) => (
                  <button key={v} onClick={() => setView(v)} className={cn("font-eyebrow rounded-[7px] px-2.5 py-1.5 text-[11px]", view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
                    {v === "side" ? "side-by-side" : v}
                  </button>
                ))}
              </div>
            </div>

            {!isStreaming && finalScore != null && (
              <div className="mt-4 flex flex-wrap gap-6 font-eyebrow text-[10px] text-muted-foreground">
                <span>Score {finalScore}/10</span>
                <span>Cost ${(totalCost ?? 0).toFixed(4)}</span>
                <span>{iterations.length} versions</span>
              </div>
            )}

            {view === "diff" && finalPrompt && (
              <div className="mt-4 overflow-hidden rounded-[10px] border border-dashed border-white/10 bg-card">
                {diff.map((p, i) => (
                  <div key={i} className={cn("whitespace-pre-wrap px-4 py-0.5 font-mono text-xs", p.type === "add" && "bg-primary/10 text-foreground", p.type === "del" && "bg-destructive/10 text-muted-foreground line-through", p.type === "eq" && "text-foreground/55")}>
                    <span className="mr-3 select-none text-muted-foreground/60">{p.type === "add" ? "+" : p.type === "del" ? "−" : " "}</span>
                    {p.text || "\u00A0"}
                  </div>
                ))}
              </div>
            )}

            {view === "side" && (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-[10px] border border-dashed border-white/10 bg-card p-5">
                  <p className="font-eyebrow text-[10px] text-muted-foreground">Original</p>
                  <pre className="mt-3 whitespace-pre-wrap font-mono text-xs text-foreground/60">{originalPrompt}</pre>
                </div>
                <div className="relative rounded-[10px] border border-primary bg-card p-5">
                  <Corners />
                  <p className="font-eyebrow text-[10px] text-primary">Refined</p>
                  <div className="prose prose-sm prose-invert mt-3 max-w-none break-words">
                    <ReactMarkdown>{finalPrompt ?? "…"}</ReactMarkdown>
                  </div>
                </div>
              </div>
            )}

            {view === "versions" && (
              <div className="mt-4 space-y-4">
                {iterations.map((it, i) => (<IterationCard key={i} iteration={it} />))}
                {isStreaming && <div className="h-32 animate-pulse rounded-[10px] border border-dashed border-white/10 bg-white/[0.02]" />}
              </div>
            )}

            {finalPrompt && !isStreaming && (
              <div className="mt-6 rounded-[10px] border border-dashed border-white/15 bg-card p-5">
                <div className="flex items-center justify-between">
                  <p className="font-eyebrow text-xs text-muted-foreground">Steer the result</p>
                  <Button variant="ghost" size="sm" onClick={copyFinal}>
                    {copied ? <Check className="mr-1 h-3.5 w-3.5 text-primary" /> : <Copy className="mr-1 h-3.5 w-3.5" />} Copy
                  </Button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {STEERS.map((s) => (<Button key={s} size="sm" variant="outline" onClick={() => applySteer(s)}>{s}</Button>))}
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    value={steerText}
                    onChange={(e) => setSteerText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && steerText.trim() && applySteer(steerText.trim())}
                    placeholder="…or tell it what to change"
                    className="flex-1 rounded-[10px] border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60"
                  />
                  <Button onClick={() => steerText.trim() && applySteer(steerText.trim())} disabled={!steerText.trim()}>Apply</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
