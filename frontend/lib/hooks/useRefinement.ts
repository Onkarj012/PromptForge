import { useState } from "react";
import { refinePrompt } from "@/lib/api";
import { Iteration, RefineRequest, RefineResponse } from "@/lib/types";

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
      
      // Since the API currently doesn't stream iterations or return them in the response,
      // we'll populate a single "final" iteration from the result for now.
      // In a real implementation with streaming, this would update iteratively.
      setIterations([
        {
          iteration: result.total_iterations,
          prompt: result.final_prompt,
          critique: "Final result generated.",
          score: result.final_score || 0,
        }
      ]);

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
