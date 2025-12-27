"use client";

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
import { useRef, useState } from "react";
import { AlertCircle, Loader2, Check, Copy } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function Page() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [userInput, setUserInput] = useState("");
  const [domain, setDomain] = useState("");
  const [maxIterations, setMaxIterations] = useState(3);
  const [creatorModel, setCreatorModel] = useState(
    "anthropic/claude-3.5-sonnet"
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

  const handleSubmit = async () => {
    if (!userInput.trim() || userInput.length < 10) {
      return;
    }

    try {
      await startRefinement({
        prompt: userInput,
        domain: domain || undefined,
        mode: "user_defined",
        creator_model: creatorModel,
        critic_model: criticModel,
        iterations: maxIterations,
      });
    } catch (error) {
      console.error("Refinement failed:", error);
    }
  };

  const handleReset = () => {
    reset();
    setUserInput("");
    setDomain("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <main className="h-screen w-screen">
      <ResizablePanelGroup orientation="horizontal" className="h-full w-full">
        {/* Left Panel - Input */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="flex flex-col gap-4 p-6 h-full overflow-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                PromptForge
              </h2>
              {response && (
                <Button variant="outline" size="sm" onClick={handleReset}>
                  New Prompt
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="prompt">Your Prompt</Label>
                <Textarea
                  id="prompt"
                  ref={textareaRef}
                  placeholder="Describe what you want to create... (min 10 characters)"
                  className="min-h-[120px] resize-none overflow-hidden mt-2"
                  onInput={handleInput}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="domain">Domain (Optional)</Label>
                <Input
                  id="domain"
                  placeholder="e.g., pixel_art, code, story"
                  className="mt-2"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="iterations">
                  Max Iterations: {maxIterations}
                </Label>
                <Input
                  id="iterations"
                  type="number"
                  min={1}
                  max={5}
                  className="mt-2"
                  value={maxIterations}
                  onChange={(e) =>
                    setMaxIterations(parseInt(e.target.value) || 3)
                  }
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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

              {response && (
                <Alert>
                  <AlertDescription className="space-y-2">
                    {response.final_score !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Final Score:</span>
                        <Badge>{response.final_score}/10</Badge>
                      </div>
                    )}
                    {response.total_cost !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Total Cost:</span>
                        <span className="text-sm">
                          ${response.total_cost.toFixed(4)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Iterations:</span>
                      <span className="text-sm">{response.iterations}</span>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Right Panel - Results */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="flex flex-col h-full p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Refinement Process
            </h2>

            {!isLoading && iterations.length === 0 && (
              <div className="flex h-full items-center justify-center">
                <p className="text-zinc-500 text-center">
                  Submit a prompt to see the refinement process
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
                    <div className="mt-6 p-4 border border-primary/20 rounded-lg bg-primary/5">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-primary">
                          ✨ Final Refined Prompt
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
                      <div className="prose dark:prose-invert max-w-none text-sm break-words animate-fade-in">
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
    </main>
  );
}
