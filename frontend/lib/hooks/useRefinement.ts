import { useState } from "react";
import { refinePrompt } from "@/lib/api";
import { Iteration, RefineRequest, RefineResponse } from "@/lib/types";

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
  const [iterations, setIterations] = useState<Iteration[]>([]);
  const [response, setResponse] = useState<RefineResponse | null>(null);

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
