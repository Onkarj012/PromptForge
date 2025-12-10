"use client";

import axios from "axios";
import { useState } from "react";
import {
  refinePrompt,
  PromptRequest,
  RefinementResponse,
} from "@/lib/api";
import { AlertCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { PromptForm } from "@/components/PromptForm";
import { ResultDisplay } from "@/components/ResultDisplay";

export default function Home() {
  const [formData, setFormData] = useState<Omit<PromptRequest, "mode">>({
    user_input: "",
    domain: "",
    creator_model: "openai/gpt-4o-mini",
    critic_model: "openai/gpt-4o-mini",
    max_iterations: 3,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RefinementResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await refinePrompt({
        ...formData,
        mode: "manual",
      });
      setResult(response);
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.detail ?? err.message
        : err instanceof Error
          ? err.message
          : "An error occurred";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen py-10 px-4 md:px-8 overflow-hidden relative">
      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-900/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-900/20 blur-[100px]" />
      </div>

      <div className="container mx-auto max-w-5xl relative z-10">
        <Header />

        <div className="max-w-3xl mx-auto">
          <PromptForm
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            loading={loading}
          />

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8 flex items-start gap-3 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="shrink-0 mt-0.5 text-red-400" size={20} />
              <div>
                <p className="font-semibold text-red-400">Optimization Failed</p>
                <p className="text-sm text-red-200/80">{error}</p>
              </div>
            </div>
          )}
        </div>

        {result && (
          <div className="max-w-4xl mx-auto mt-12">
            <ResultDisplay result={result} />
          </div>
        )}

        {/* Footer */}
        <footer className="mt-20 text-center text-sm text-slate-500 pb-8">
          <p>Built with Next.js, FastAPI & Agentic AI</p>
        </footer>
      </div>
    </main>
  );
}
