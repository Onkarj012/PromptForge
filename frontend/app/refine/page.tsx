"use client"

import { useState } from "react"
import { refinePrompt } from "@/lib/api"
import { RefineResponse } from "@/lib/types"

export default function RefinePage() {
    const [prompt, setPrompt] = useState("")
    const [iterations, setIterations] = useState(3)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [result, setResult] = useState<RefineResponse | null>(null)

    async function handleSubmit() {
        setLoading(true)
        setError(null)
        setResult(null)

        try {
            const res = await refinePrompt({
                prompt,
                iterations,
                mode: "user_defined",
                creator_model: "openai/gpt-4o",
                critic_model: "openai/gpt-4o",
            })

            setResult(res)
        } catch (error) {
            setError(error instanceof Error ? error.message : "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Prompt Refinement</h1>

      {/* Prompt Input */}
      <textarea
        className="w-full min-h-[160px] border rounded p-4"
        placeholder="Enter your initial prompt..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      {/* Iterations */}
      <div className="flex items-center gap-4">
        <label className="font-medium">Iterations</label>
        <input
          type="number"
          min={1}
          max={10}
          value={iterations}
          onChange={(e) => setIterations(Number(e.target.value))}
          className="w-20 border rounded p-2"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading || !prompt.trim()}
        className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
      >
        {loading ? "Refining..." : "Run PromptForge"}
      </button>

      {/* Error */}
      {error && (
        <div className="p-4 border border-red-400 text-red-600 rounded">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <section className="mt-6 space-y-2">
          <h2 className="text-xl font-semibold">Final Prompt</h2>

          <pre className="whitespace-pre-wrap border rounded p-4 bg-gray-50">
            {result.final_prompt}
          </pre>

          <p className="text-sm text-muted-foreground">
            Run ID: {result.run_id}
          </p>
        </section>
      )}
    </main>
    )

}