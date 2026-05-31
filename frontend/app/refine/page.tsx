"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Check, Copy, Loader2, Plus } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ModeNav } from "@/components/mode-nav";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ModelSelector } from "@/components/model-selector";
import { IterationCard } from "@/components/iteration-card";
import { useRefinement } from "@/lib/hooks/useRefinement";
import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/utils";

const TONES = ["Analytical", "Cinematic", "Concise", "Direct", "Persuasive", "Playful", "Technical"];
const TOOLS = [
  { value: "cursor", label: "Cursor" },
  { value: "bolt", label: "Bolt" },
  { value: "v0", label: "v0" },
  { value: "claude", label: "Claude" },
  { value: "generic", label: "Generic" },
];
const PROJECT_TYPES = [
  { value: "saas", label: "SaaS" },
  { value: "api", label: "API" },
  { value: "landing_page", label: "Landing Page" },
  { value: "cli", label: "CLI" },
  { value: "mobile_app", label: "Mobile App" },
];
const PROFILES = {
  quick: { label: "Quick", iterations: 2 },
  balanced: { label: "Balanced", iterations: 3 },
  deep: { label: "Deep", iterations: 5 },
} as const;
type ProfileKey = keyof typeof PROFILES;

function Corners() {
  return (
    <>
      <Plus className="pointer-events-none absolute -left-[7px] -top-[7px] h-3.5 w-3.5 text-primary/70" />
      <Plus className="pointer-events-none absolute -bottom-[7px] -right-[7px] h-3.5 w-3.5 text-primary/70" />
    </>
  );
}

function Pill({ active, ...props }: { active: boolean } & React.ComponentProps<typeof Button>) {
  return <Button size="sm" variant={active ? "default" : "outline"} {...props} />;
}

export default function Page() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [userInput, setUserInput] = useState("");
  const [domain, setDomain] = useState("");
  const [goal, setGoal] = useState("");
  const [audience, setAudience] = useState("");
  const [constraints, setConstraints] = useState("");
  const [tone, setTone] = useState("");
  const [targetTool, setTargetTool] = useState("cursor");
  const [projectType, setProjectType] = useState("");
  const [stack, setStack] = useState("");
  const [profile, setProfile] = useState<ProfileKey>("balanced");
  const [creatorModel, setCreatorModel] = useState("anthropic/claude-3.5-sonnet");
  const [criticModel, setCriticModel] = useState("openai/gpt-4o-mini");
  const [isFinalCopied, setIsFinalCopied] = useState(false);

  const { isLoading, error, iterations, response, startRefinement, reset } = useRefinement();

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${ta.scrollHeight}px`;
    }
  }, [userInput]);

  const buildPrompt = () => {
    const parts = [userInput.trim()];
    if (goal.trim()) parts.push(`Goal: ${goal.trim()}`);
    if (audience.trim()) parts.push(`Audience: ${audience.trim()}`);
    if (tone.trim()) parts.push(`Tone: ${tone.trim()}`);
    if (constraints.trim()) parts.push(`Constraints: ${constraints.trim()}`);
    return parts.filter(Boolean).join("\n\n");
  };

  const handleSubmit = async () => {
    if (userInput.trim().length < 10) return;
    await startRefinement({
      prompt: buildPrompt(),
      domain: domain || undefined,
      mode: "user_defined",
      creator_model: creatorModel,
      critic_model: criticModel,
      iterations: PROFILES[profile].iterations,
      target_tool: targetTool,
      project_type: projectType || undefined,
      stack: stack || undefined,
    });
  };

  const handleReset = () => {
    reset();
    setUserInput("");
    setDomain("");
    setGoal("");
    setAudience("");
    setConstraints("");
    setTone("");
    setTargetTool("cursor");
    setProjectType("");
    setStack("");
    setProfile("balanced");
  };

  const handleFinalCopy = async () => {
    if (!response?.final_prompt) return;
    await navigator.clipboard.writeText(response.final_prompt);
    setIsFinalCopied(true);
    setTimeout(() => setIsFinalCopied(false), 2000);
  };

  const stats = [
    { label: "Final Score", value: response?.final_score != null ? `${response.final_score}/10` : "—" },
    { label: "Cost", value: response?.total_cost != null ? `$${response.total_cost.toFixed(4)}` : "—" },
    { label: "Iterations", value: response?.iterations ?? "—" },
  ];

  return (
    <main className="min-h-screen bg-background bg-blueprint text-foreground">
      <ModeNav />
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Reveal>
          <p className="font-eyebrow text-xs text-foreground/60">Forge Mode</p>
          <h1 className="font-display mt-2 text-5xl">Refine your prompt.</h1>
          <p className="mt-4 max-w-xl text-sm text-foreground/70">
            Describe what you want to build. A creator/critic loop generates, evaluates, and
            iterates it into a tool-ready prompt.
          </p>
        </Reveal>

        {/* Composer */}
        <Reveal>
          <div className="relative mt-10 rounded-[10px] border border-dashed border-white/15 bg-card p-6">
            <Corners />
            <Label htmlFor="prompt" className="font-eyebrow text-xs text-muted-foreground">
              Your prompt
            </Label>
            <Textarea
              id="prompt"
              ref={textareaRef}
              placeholder="e.g. Build a SaaS landing page with Next.js, Supabase auth, and Stripe billing."
              className="mt-3 min-h-[120px] resize-none overflow-hidden border-white/10 bg-black/40 text-base"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={isLoading}
            />

            <div className="mt-6">
              <p className="font-eyebrow mb-2 text-xs text-muted-foreground">Target tool</p>
              <div className="flex flex-wrap gap-2">
                {TOOLS.map((t) => (
                  <Pill key={t.value} active={targetTool === t.value} onClick={() => setTargetTool(t.value)} disabled={isLoading}>
                    {t.label}
                  </Pill>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="font-eyebrow mb-2 text-xs text-muted-foreground">Depth</p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(PROFILES) as ProfileKey[]).map((k) => (
                  <Pill key={k} active={profile === k} onClick={() => setProfile(k)} disabled={isLoading}>
                    {PROFILES[k].label} · {PROFILES[k].iterations}
                  </Pill>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <ModelSelector value={creatorModel} onValueChange={setCreatorModel} label="Creator Model" />
              <ModelSelector value={criticModel} onValueChange={setCriticModel} label="Critic Model" />
            </div>

            <details className="group mt-6 border-t border-dashed border-white/10 pt-5">
              <summary className="font-eyebrow cursor-pointer list-none text-xs text-muted-foreground hover:text-foreground">
                + Project context (optional)
              </summary>
              <div className="mt-4 grid gap-4">
                <div>
                  <p className="font-eyebrow mb-2 text-xs text-muted-foreground">Project type</p>
                  <div className="flex flex-wrap gap-2">
                    {PROJECT_TYPES.map((p) => (
                      <Pill key={p.value} active={projectType === p.value} onClick={() => setProjectType(projectType === p.value ? "" : p.value)} disabled={isLoading}>
                        {p.label}
                      </Pill>
                    ))}
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="stack">Stack</Label>
                    <Input id="stack" placeholder="Next.js + Supabase + Stripe" className="mt-2 border-white/10 bg-black/40" value={stack} onChange={(e) => setStack(e.target.value)} disabled={isLoading} />
                  </div>
                  <div>
                    <Label htmlFor="domain">Domain</Label>
                    <Input id="domain" placeholder="product, code, story" className="mt-2 border-white/10 bg-black/40" value={domain} onChange={(e) => setDomain(e.target.value)} disabled={isLoading} />
                  </div>
                  <div>
                    <Label htmlFor="goal">Goal</Label>
                    <Input id="goal" placeholder="Desired outcome" className="mt-2 border-white/10 bg-black/40" value={goal} onChange={(e) => setGoal(e.target.value)} disabled={isLoading} />
                  </div>
                  <div>
                    <Label htmlFor="audience">Audience</Label>
                    <Input id="audience" placeholder="Who the output is for" className="mt-2 border-white/10 bg-black/40" value={audience} onChange={(e) => setAudience(e.target.value)} disabled={isLoading} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="constraints">Constraints</Label>
                  <Textarea id="constraints" placeholder="Formatting, structure, exclusions" className="mt-2 min-h-[80px] resize-none border-white/10 bg-black/40" value={constraints} onChange={(e) => setConstraints(e.target.value)} disabled={isLoading} />
                </div>
                <div>
                  <p className="font-eyebrow mb-2 text-xs text-muted-foreground">Tone</p>
                  <div className="flex flex-wrap gap-2">
                    {TONES.map((t) => (
                      <Pill key={t} active={tone === t} onClick={() => setTone(tone === t ? "" : t)} disabled={isLoading}>
                        {t}
                      </Pill>
                    ))}
                  </div>
                </div>
              </div>
            </details>

            <div className="mt-6 flex items-center gap-3">
              <Button className="flex-1" onClick={handleSubmit} disabled={isLoading || userInput.trim().length < 10}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Refining...
                  </>
                ) : (
                  "Refine Prompt"
                )}
              </Button>
              {response && (
                <Button variant="outline" onClick={handleReset} disabled={isLoading}>
                  New
                </Button>
              )}
            </div>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </Reveal>

        {/* Results */}
        {(iterations.length > 0 || isLoading) && (
          <section className="mt-16">
            <div className="flex items-end justify-between">
              <div>
                <p className="font-eyebrow text-xs text-foreground/60">Output</p>
                <h2 className="font-display mt-2 text-3xl">Refinement timeline.</h2>
              </div>
            </div>

            {response && (
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {stats.map((s) => (
                  <div key={s.label} className="rounded-[10px] border border-dashed border-white/10 bg-white/[0.02] p-4">
                    <p className="font-eyebrow text-[10px] text-muted-foreground">{s.label}</p>
                    <p className="font-display mt-2 text-3xl text-foreground">{s.value}</p>
                  </div>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="mt-8 space-y-4">
                <div className="h-40 animate-pulse rounded-[10px] border border-dashed border-white/10 bg-white/[0.02]" />
                <div className="h-40 animate-pulse rounded-[10px] border border-dashed border-white/10 bg-white/[0.02]" />
              </div>
            )}

            {iterations.length > 0 && (
              <div className="mt-8 space-y-4">
                {iterations.map((iteration) => (
                  <IterationCard key={iteration.iteration} iteration={iteration} />
                ))}

                {response && (
                  <div className="relative rounded-[10px] border border-primary bg-card p-6">
                    <Corners />
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-eyebrow text-xs text-primary">Final refined prompt</h3>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleFinalCopy}>
                        {isFinalCopied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5 text-foreground/70" />}
                      </Button>
                    </div>
                    <div className={cn("prose prose-sm prose-invert max-w-none break-words")}>
                      <ReactMarkdown>{response.final_prompt}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
