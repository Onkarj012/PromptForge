import { useState } from "react";
import { streamRefine } from "@/lib/api";
import { LiveIteration, RefineRequest, StreamEvent } from "@/lib/types";

function formatCritique(c?: {
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
}) {
  if (!c) return "";
  const lines: string[] = [];
  if (c.strengths?.length) lines.push("**Strengths**", ...c.strengths.map((s) => `- ${s}`));
  if (c.weaknesses?.length) lines.push("", "**Weaknesses**", ...c.weaknesses.map((s) => `- ${s}`));
  if (c.suggestions?.length) lines.push("", "**Suggestions**", ...c.suggestions.map((s) => `- ${s}`));
  return lines.join("\n");
}

// DEMO: seed so the result views render without a backend — replaced on first run.
const DEMO_FINAL = `## Objective
Build a production-ready SaaS landing page in an existing Next.js repo.

## Tech Stack
Next.js (App Router) · Tailwind CSS · Supabase (auth) · Stripe (billing)

## Implementation Plan
1. Create \`app/(marketing)/page.tsx\` with hero, features, pricing, and CTA.
2. Add a \`PricingTable\` wired to Stripe Checkout via \`/api/checkout\`.
3. Gate the dashboard with Supabase session middleware.

## Acceptance Criteria
- Lighthouse performance >= 90.
- "Start free" CTA initiates Stripe Checkout and redirects back on success.`;

const DEMO_ORIGINAL = "Build a SaaS landing page with Next.js, Supabase auth, and Stripe billing.";
const DEMO_ITERATIONS: LiveIteration[] = [
  { iteration: 1, prompt: "Build a SaaS landing page with Next.js, Supabase auth, and Stripe billing. Include hero, features, and pricing.", critique: "**Weaknesses**\n- No file structure or acceptance criteria\n- Stack not pinned", score: 6, cost: 0.0041 },
  { iteration: 2, prompt: "Build a SaaS landing page (Next.js App Router + Tailwind + Supabase + Stripe). Define sections, the pricing component, and a checkout route.", critique: "**Strengths**\n- Stack pinned, routes named\n\n**Weaknesses**\n- Stripe secret handling unstated", score: 8, cost: 0.0047 },
  { iteration: 3, prompt: DEMO_FINAL, critique: "**Strengths**\n- Tool-ready for Cursor\n- Verifiable acceptance criteria", score: 9, cost: 0.0035,
    outputs: [{ input: null, output: "Created app/(marketing)/page.tsx with hero, features, pricing, and a Stripe-backed CTA; added /api/checkout server action; gated /dashboard via Supabase middleware." }],
    assertions: { passed: 3, total: 3, pass_rate: 1 } },
];

export function useForge() {
  const [originalPrompt, setOriginalPrompt] = useState(DEMO_ORIGINAL);
  const [iterations, setIterations] = useState<LiveIteration[]>(DEMO_ITERATIONS);
  const [finalPrompt, setFinalPrompt] = useState<string | null>(DEMO_FINAL);
  const [finalScore, setFinalScore] = useState<number | null>(9);
  const [totalCost, setTotalCost] = useState<number | null>(0.0123);
  const [status, setStatus] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = (e: StreamEvent) => {
    switch (e.event) {
      case "draft":
        setStatus(`Drafting iteration ${e.iteration ?? ""}…`);
        break;
      case "test":
        setStatus("Running the prompt to observe outputs…");
        break;
      case "assert":
        setStatus(e.total ? `Checking assertions (${e.passed}/${e.total})…` : "Checking assertions…");
        break;
      case "critique":
        setStatus(`Scoring${e.score != null ? ` ${e.score}/10` : ""}…`);
        break;
      case "iteration":
        setIterations((prev) => [
          ...prev,
          {
            iteration: e.iteration ?? prev.length + 1,
            prompt: e.prompt ?? "",
            critique: formatCritique(e.critique),
            score: e.score ?? 0,
            cost: e.cost,
            outputs: e.test_outputs,
            assertions: e.assertions,
          },
        ]);
        break;
      case "done":
        setFinalPrompt(e.final_prompt ?? null);
        setFinalScore(e.final_score ?? null);
        setTotalCost(e.total_cost ?? null);
        setStatus("Complete");
        break;
      case "error":
        setError(e.message ?? "Refinement failed");
        break;
    }
  };

  const stream = async (payload: RefineRequest) => {
    setIsStreaming(true);
    setError(null);
    try {
      await streamRefine(payload, handle);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refinement failed");
    } finally {
      setIsStreaming(false);
    }
  };

  // Fresh run: resets the timeline and tracks the original prompt for diffing.
  const start = async (payload: RefineRequest) => {
    setOriginalPrompt(payload.prompt);
    setIterations([]);
    setFinalPrompt(null);
    setFinalScore(null);
    setTotalCost(null);
    setStatus("Starting…");
    await stream(payload);
  };

  // Steer: keep prior versions, append a new refined version from the current output.
  const steer = async (payload: RefineRequest) => {
    setStatus("Applying steer…");
    await stream(payload);
  };

  const reset = () => {
    setOriginalPrompt("");
    setIterations([]);
    setFinalPrompt(null);
    setFinalScore(null);
    setTotalCost(null);
    setStatus("");
    setError(null);
  };

  return {
    originalPrompt, iterations, finalPrompt, finalScore, totalCost,
    status, isStreaming, error, start, steer, reset,
  };
}
