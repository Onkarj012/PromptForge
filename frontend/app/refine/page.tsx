"use client";

import Link from "next/link";
import {
  AlertCircle,
  Check,
  Copy,
  Gauge,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ModelSelector } from "@/components/model-selector";
import { IterationCard } from "@/components/iteration-card";
import { useRefinement } from "@/lib/hooks/useRefinement";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

const TONES = [
  "Analytical",
  "Cinematic",
  "Concise",
  "Direct",
  "Persuasive",
  "Playful",
  "Technical",
];

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
  quick: {
    label: "Quick",
    description: "2 iterations",
    iterations: 2,
  },
  balanced: {
    label: "Balanced",
    description: "3 iterations",
    iterations: 3,
  },
  deep: {
    label: "Deep",
    description: "5 iterations",
    iterations: 5,
  },
} as const;

type ProfileKey = keyof typeof PROFILES;
type ProfileState = ProfileKey | "custom";

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
  const [profile, setProfile] = useState<ProfileState>("balanced");
  const [maxIterations, setMaxIterations] = useState<number>(
    PROFILES.balanced.iterations,
  );
  const [creatorModel, setCreatorModel] = useState(
    "anthropic/claude-3.5-sonnet",
  );
  const [criticModel, setCriticModel] = useState("openai/gpt-4o-mini");

  const { isLoading, error, iterations, response, startRefinement, reset } =
    useRefinement();

  const [isFinalCopied, setIsFinalCopied] = useState(false);

  const handleFinalCopy = async () => {
    if (response?.final_prompt) {
      await navigator.clipboard.writeText(response.final_prompt);
      setIsFinalCopied(true);
      setTimeout(() => setIsFinalCopied(false), 2000);
    }
  };

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    handleInput();
  }, [userInput]);

  const buildPrompt = () => {
    const sections = [userInput.trim()];
    if (goal.trim()) {
      sections.push(`Goal: ${goal.trim()}`);
    }
    if (audience.trim()) {
      sections.push(`Audience: ${audience.trim()}`);
    }
    if (tone.trim()) {
      sections.push(`Tone: ${tone.trim()}`);
    }
    if (constraints.trim()) {
      sections.push(`Constraints: ${constraints.trim()}`);
    }
    return sections.filter(Boolean).join("\n\n");
  };

  const builtPrompt = buildPrompt();
  const wordCount = builtPrompt.trim()
    ? builtPrompt.trim().split(/\s+/).length
    : 0;
  const charCount = builtPrompt.length;

  const profileLabel =
    profile === "custom" ? "Custom" : PROFILES[profile].label;

  const handleSubmit = async () => {
    if (!userInput.trim() || userInput.length < 10) {
      return;
    }

    try {
      await startRefinement({
        prompt: builtPrompt,
        domain: domain || undefined,
        mode: "user_defined",
        creator_model: creatorModel,
        critic_model: criticModel,
        iterations: maxIterations,
        target_tool: targetTool,
        project_type: projectType || undefined,
        stack: stack || undefined,
      });
    } catch (error) {
      console.error("Refinement failed:", error);
    }
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
    setMaxIterations(PROFILES.balanced.iterations);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const applyProfile = (nextProfile: ProfileKey) => {
    setProfile(nextProfile);
    setMaxIterations(PROFILES[nextProfile].iterations);
  };

  const statusLabel = isLoading ? "Running" : response ? "Complete" : "Idle";

  return (
    <main className="relative min-h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 motion-safe:animate-in motion-safe:fade-in">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 right-1/4 h-[420px] w-[420px] rounded-full bg-primary/20 blur-[140px]" />
        <div className="absolute bottom-0 left-1/4 h-[360px] w-[360px] rounded-full bg-fuchsia-500/10 blur-[160px]" />
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_80%_20%,rgba(63,63,70,0.12),transparent)]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-zinc-800/60 bg-zinc-950/80 px-6 py-4 backdrop-blur">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center border border-zinc-800/70 bg-zinc-900/70">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                PromptForge
              </p>
              <p className="text-sm font-medium">Prompt Studio</p>
            </div>
          </Link>
          <div className="hidden items-center gap-2 text-xs text-zinc-300 sm:flex">
            <Badge className="border border-zinc-800/70 bg-zinc-900/70 text-zinc-200">
              {statusLabel}
            </Badge>
            <span>Agentic refinement workspace</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={isLoading}
            >
              New Session
            </Button>
          </div>
        </header>

        <ResizablePanelGroup
          orientation="horizontal"
          className="flex-1 border-t border-zinc-800/40"
        >
          <ResizablePanel defaultSize={48} minSize={32}>
            <div className="flex h-full flex-col gap-6 overflow-auto p-6 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-700">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                    Input Layer
                  </p>
                  <h2 className="text-lg font-semibold text-zinc-100">
                    Prompt Studio
                  </h2>
                </div>
                {response && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    disabled={isLoading}
                  >
                    New Prompt
                  </Button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-none border border-zinc-800/70 bg-zinc-900/50 p-3">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400">
                    Words
                  </p>
                  <p className="mt-2 text-sm font-semibold text-zinc-100">
                    {wordCount}
                  </p>
                </div>
                <div className="rounded-none border border-zinc-800/70 bg-zinc-900/50 p-3">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400">
                    Characters
                  </p>
                  <p className="mt-2 text-sm font-semibold text-zinc-100">
                    {charCount}
                  </p>
                </div>
                <div className="rounded-none border border-zinc-800/70 bg-zinc-900/50 p-3">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400">
                    Profile
                  </p>
                  <p className="mt-2 text-sm font-semibold text-zinc-100">
                    {profileLabel}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 rounded-none border border-zinc-800/70 bg-zinc-900/40 p-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="prompt">Your Prompt</Label>
                  <span className="text-xs text-zinc-400">Min 10 chars</span>
                </div>
                <Textarea
                  id="prompt"
                  ref={textareaRef}
                  placeholder="Describe what you want to create..."
                  className="min-h-[140px] resize-none overflow-hidden border-zinc-800/70 bg-zinc-950/60"
                  onInput={handleInput}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  disabled={isLoading}
                />

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <Label htmlFor="domain">Domain (Optional)</Label>
                    <Input
                      id="domain"
                      placeholder="e.g., product, code, story"
                      className="mt-2 border-zinc-800/70 bg-zinc-950/60"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="iterations">Max Iterations</Label>
                    <Input
                      id="iterations"
                      type="number"
                      min={1}
                      max={5}
                      className="mt-2 border-zinc-800/70 bg-zinc-950/60"
                      value={maxIterations}
                      onChange={(e) => {
                        const nextValue = parseInt(e.target.value, 10);
                        const safeValue = Number.isNaN(nextValue)
                          ? PROFILES.balanced.iterations
                          : nextValue;
                        const clampedValue = Math.min(
                          5,
                          Math.max(1, safeValue),
                        );
                        setMaxIterations(clampedValue);
                        const matchedProfile = (
                          Object.keys(PROFILES) as ProfileKey[]
                        ).find(
                          (key) => PROFILES[key].iterations === clampedValue,
                        );
                        setProfile(matchedProfile ?? "custom");
                      }}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="grid gap-3">
                  <div>
                    <Label htmlFor="goal">Goal (Optional)</Label>
                    <Input
                      id="goal"
                      placeholder="Outcome you want from the refined prompt"
                      className="mt-2 border-zinc-800/70 bg-zinc-950/60"
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="audience">Audience (Optional)</Label>
                    <Input
                      id="audience"
                      placeholder="Who the output is for"
                      className="mt-2 border-zinc-800/70 bg-zinc-950/60"
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="constraints">Constraints (Optional)</Label>
                    <Textarea
                      id="constraints"
                      placeholder="Formatting, structure, exclusions"
                      className="mt-2 min-h-[90px] resize-none border-zinc-800/70 bg-zinc-950/60"
                      value={constraints}
                      onChange={(e) => setConstraints(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Tone (Optional)</Label>
                  <div className="flex flex-wrap gap-2">
                    {TONES.map((toneOption) => (
                      <Button
                        key={toneOption}
                        type="button"
                        variant={tone === toneOption ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                          setTone(tone === toneOption ? "" : toneOption)
                        }
                      >
                        {toneOption}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 rounded-none border border-zinc-800/70 bg-zinc-900/40 p-4">
                <div className="grid gap-2">
                  <Label>Target Tool</Label>
                  <div className="flex flex-wrap gap-2">
                    {TOOLS.map((t) => (
                      <Button
                        key={t.value}
                        type="button"
                        variant={targetTool === t.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTargetTool(t.value)}
                        disabled={isLoading}
                      >
                        {t.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Project Type (Optional)</Label>
                  <div className="flex flex-wrap gap-2">
                    {PROJECT_TYPES.map((p) => (
                      <Button
                        key={p.value}
                        type="button"
                        variant={
                          projectType === p.value ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          setProjectType(projectType === p.value ? "" : p.value)
                        }
                        disabled={isLoading}
                      >
                        {p.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="stack">Stack (Optional)</Label>
                  <Input
                    id="stack"
                    placeholder="e.g., Next.js + Supabase + Stripe"
                    className="mt-2 border-zinc-800/70 bg-zinc-950/60"
                    value={stack}
                    onChange={(e) => setStack(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Refinement Profile</Label>
                <div className="grid gap-2 sm:grid-cols-3">
                  {(Object.keys(PROFILES) as ProfileKey[]).map((key) => (
                    <Button
                      key={key}
                      type="button"
                      variant={profile === key ? "default" : "outline"}
                      className="justify-between"
                      onClick={() => applyProfile(key)}
                    >
                      <span>{PROFILES[key].label}</span>
                      <span className="text-xs text-zinc-300">
                        {PROFILES[key].description}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ModelSelector
                  value={creatorModel}
                  onValueChange={setCreatorModel}
                  label="Creator Model"
                />

                <ModelSelector
                  value={criticModel}
                  onValueChange={setCriticModel}
                  label="Critic Model"
                />
              </div>

              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={isLoading || userInput.length < 10}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Refining...
                  </>
                ) : (
                  "Refine Prompt"
                )}
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="rounded-none border border-zinc-800/70 bg-zinc-900/50 p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-zinc-400">
                  <Gauge className="h-3 w-3 text-primary" />
                  Prompt Checklist
                </div>
                <ul className="mt-3 space-y-2 text-xs text-zinc-300">
                  <li>Specify the desired outcome and audience.</li>
                  <li>Call out constraints, exclusions, and format needs.</li>
                  <li>Keep the prompt focused on a single job-to-be-done.</li>
                </ul>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel defaultSize={52} minSize={32}>
            <div className="flex h-full flex-col gap-4 p-6 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                    Output Layer
                  </p>
                  <h2 className="text-lg font-semibold text-zinc-100">
                    Refinement Timeline
                  </h2>
                </div>
                <Badge className="border border-zinc-800/70 bg-zinc-900/70 text-zinc-200">
                  {statusLabel}
                </Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-none border border-zinc-800/70 bg-zinc-900/50 p-3">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400">
                    Final Score
                  </p>
                  <p className="mt-2 text-sm font-semibold text-zinc-100">
                    {response?.final_score !== undefined
                      ? `${response.final_score}/10`
                      : "--"}
                  </p>
                </div>
                <div className="rounded-none border border-zinc-800/70 bg-zinc-900/50 p-3">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400">
                    Cost
                  </p>
                  <p className="mt-2 text-sm font-semibold text-zinc-100">
                    {response?.total_cost !== undefined
                      ? `$${response.total_cost.toFixed(4)}`
                      : "--"}
                  </p>
                </div>
                <div className="rounded-none border border-zinc-800/70 bg-zinc-900/50 p-3">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400">
                    Iterations
                  </p>
                  <p className="mt-2 text-sm font-semibold text-zinc-100">
                    {response?.iterations ?? "--"}
                  </p>
                </div>
              </div>

              {!isLoading && iterations.length === 0 && (
                <div className="flex flex-1 flex-col items-center justify-center rounded-none border border-dashed border-zinc-800/70 bg-zinc-900/30 p-8 text-center">
                  <Sparkles className="h-6 w-6 text-primary" />
                  <p className="mt-4 text-sm text-zinc-200">
                    Submit a prompt to see the refinement process.
                  </p>
                  <p className="mt-2 text-xs text-zinc-400">
                    The timeline will capture critique, revisions, and scoring.
                  </p>
                </div>
              )}

              {isLoading && (
                <div className="space-y-4">
                  <Skeleton className="h-[200px] w-full" />
                  <Skeleton className="h-[200px] w-full" />
                </div>
              )}

              {iterations.length > 0 && (
                <ScrollArea className="flex-1 min-h-0">
                  <div className="space-y-4 pr-4">
                    {iterations.map((iteration) => (
                      <IterationCard
                        key={iteration.iteration}
                        iteration={iteration}
                      />
                    ))}

                    {response && (
                      <div className="mt-6 rounded-none border border-primary/20 bg-primary/5 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-semibold text-primary">
                            Final Refined Prompt
                          </h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-primary/10"
                            onClick={handleFinalCopy}
                          >
                            {isFinalCopied ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3 text-primary/70" />
                            )}
                          </Button>
                        </div>
                        <div className="prose dark:prose-invert max-w-none text-sm break-words motion-safe:animate-fade-in">
                          <ReactMarkdown>{response.final_prompt}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </main>
  );
}
