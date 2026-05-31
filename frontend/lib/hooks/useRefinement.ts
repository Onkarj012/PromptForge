import { useState } from "react";
import { refinePrompt } from "@/lib/api";
import { Iteration, RefineRequest, RefineResponse } from "@/lib/types";

// DEMO: hardcoded sample data — remove when backend is live
const DEMO_FINAL_PROMPT = `## Objective
Build a production-ready SaaS landing page in an existing Next.js repo.

## Tech Stack
Next.js (App Router) · Tailwind CSS · Supabase (auth) · Stripe (billing)

## Implementation Plan
1. Create \`app/(marketing)/page.tsx\` with hero, features, pricing, and CTA sections.
2. Add a \`PricingTable\` component wired to Stripe Checkout via an \`/api/checkout\` route.
3. Gate the dashboard route with Supabase session middleware.

## Constraints
- Mobile-first, responsive at 390 / 768 / 1280px.
- No client secrets in the bundle; use server actions for Stripe.

## Acceptance Criteria
- Lighthouse performance >= 90.
- "Start free" CTA initiates Stripe Checkout and redirects back on success.`;

const SAMPLE_ITERATIONS: Iteration[] = [
  {
    iteration: 1,
    prompt:
      "Build a SaaS landing page with Next.js, Supabase auth, and Stripe billing. Include hero, features, and pricing.",
    critique:
      "**Strengths**\n- Clear product intent\n\n**Weaknesses**\n- No file structure or acceptance criteria\n- Stack not pinned\n\n**Suggestions**\n- Specify routes and components\n- Add measurable acceptance criteria",
    score: 6,
  },
  {
    iteration: 2,
    prompt:
      "Build a SaaS landing page (Next.js App Router + Tailwind + Supabase + Stripe). Define sections, the pricing component, and a checkout route.",
    critique:
      "**Strengths**\n- Stack pinned, routes named\n\n**Weaknesses**\n- Stripe secret handling unstated\n\n**Suggestions**\n- Require server actions for secrets\n- Add a Lighthouse target",
    score: 8,
  },
  {
    iteration: 3,
    prompt: DEMO_FINAL_PROMPT,
    critique:
      "**Strengths**\n- Tool-ready structure for Cursor\n- Verifiable acceptance criteria\n- Security constraints explicit\n\n**Weaknesses**\n- None significant",
    score: 9,
  },
];

const SAMPLE_RESPONSE: RefineResponse = {
  run_id: "demo",
  final_prompt: DEMO_FINAL_PROMPT,
  final_score: 9,
  total_cost: 0.0123,
  iterations: 3,
  iterations_detail: [],
};

function formatCritique(critique?: {
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
}) {
  if (!critique) {
    return "Final result generated.";
  }

  const lines: string[] = [];
  if (critique.strengths?.length) {
    lines.push("**Strengths**");
    critique.strengths.forEach((item) => lines.push(`- ${item}`));
  }
  if (critique.weaknesses?.length) {
    lines.push("");
    lines.push("**Weaknesses**");
    critique.weaknesses.forEach((item) => lines.push(`- ${item}`));
  }
  if (critique.suggestions?.length) {
    lines.push("");
    lines.push("**Suggestions**");
    critique.suggestions.forEach((item) => lines.push(`- ${item}`));
  }

  return lines.length ? lines.join("\n") : "Final result generated.";
}

export function useRefinement() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [iterations, setIterations] = useState<Iteration[]>(SAMPLE_ITERATIONS);
  const [response, setResponse] = useState<RefineResponse | null>(SAMPLE_RESPONSE);

  const startRefinement = async (request: Omit<RefineRequest, "mode"> & { mode?: "user_defined" | "auto" }) => {
    setIsLoading(true);
    setError(null);
    setIterations([]);
    setResponse(null);

    try {
      const result = await refinePrompt({
        ...request,
        mode: request.mode || "user_defined",
      });
      setResponse(result);

      if (result.iterations_detail?.length) {
        setIterations(
          result.iterations_detail.map((item) => ({
            iteration: item.iteration,
            prompt: item.prompt,
            critique: formatCritique(item.critique),
            score: item.score ?? item.critique?.score ?? 0,
          }))
        );
      } else {
        setIterations([
          {
            iteration: result.iterations,
            prompt: result.final_prompt,
            critique: "Final result generated.",
            score: result.final_score || 0,
          },
        ]);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
      setIterations([]);
      setResponse(null);
      setError(null);
      setIsLoading(false);
  }

  return {
    isLoading,
    error,
    iterations,
    response,
    startRefinement,
    reset
  };
}
