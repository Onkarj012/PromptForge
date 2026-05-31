"use client";

import * as React from "react";
import {
  Check,
  Search,
  X,
  Zap,
  ChevronsUpDown,
  Sparkles,
  Star,
} from "lucide-react";
import {
  OpenAI,
  Anthropic,
  Google,
  Meta,
  Mistral,
  Moonshot,
  DeepSeek,
  Grok,
} from "@lobehub/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogHeader,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export interface Model {
  id: string;
  name: string;
  provider: string;
  description: string;
  inputPrice: number;
  outputPrice: number;
  capabilities: string[];
}

const MODELS: Model[] = [
  {
    id: "openai/gpt-5.2",
    name: "GPT-5.2",
    provider: "OpenAI",
    description: "Flagship reasoning and multimodal response.",
    inputPrice: 12.0,
    outputPrice: 36.0,
    capabilities: ["reasoning", "vision", "context"],
  },
  {
    id: "openai/gpt-5.1",
    name: "GPT-5.1",
    provider: "OpenAI",
    description: "High-precision instruction following.",
    inputPrice: 10.0,
    outputPrice: 30.0,
    capabilities: ["reasoning", "context"],
  },
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    description: "Balanced quality for general workloads.",
    inputPrice: 5.0,
    outputPrice: 15.0,
    capabilities: ["vision", "reasoning"],
  },
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    description: "Fast, cost-efficient responses.",
    inputPrice: 0.15,
    outputPrice: 0.6,
    capabilities: ["fast", "vision"],
  },
  {
    id: "openai/gpt-5-mini",
    name: "GPT-5 Mini",
    provider: "OpenAI",
    description: "Lightweight reasoning for quick iterations.",
    inputPrice: 2.0,
    outputPrice: 8.0,
    capabilities: ["fast", "reasoning"],
  },
  {
    id: "openai/gpt-oss-20b",
    name: "GPT-OSS-20B",
    provider: "OpenAI",
    description: "Open-weight option for experimentation.",
    inputPrice: 1.2,
    outputPrice: 4.5,
    capabilities: ["open", "context"],
  },
  {
    id: "anthropic/claude-opus-4.5",
    name: "Claude Opus 4.5",
    provider: "Anthropic",
    description: "Deep reasoning and agent-grade planning.",
    inputPrice: 12.0,
    outputPrice: 60.0,
    capabilities: ["reasoning", "context"],
  },
  {
    id: "anthropic/claude-sonnet-4.5",
    name: "Claude Sonnet 4.5",
    provider: "Anthropic",
    description: "Balanced performance and efficiency.",
    inputPrice: 6.0,
    outputPrice: 30.0,
    capabilities: ["reasoning", "context"],
  },
  {
    id: "anthropic/claude-haiku-4.5",
    name: "Claude Haiku 4.5",
    provider: "Anthropic",
    description: "Fast, concise outputs with strong control.",
    inputPrice: 2.5,
    outputPrice: 12.0,
    capabilities: ["fast", "context"],
  },
  {
    id: "anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    description: "Reliable model for coding and writing.",
    inputPrice: 3.0,
    outputPrice: 15.0,
    capabilities: ["reasoning", "vision", "context"],
  },
  {
    id: "google/gemini-3-pro-preview",
    name: "Gemini 3 Pro",
    provider: "Google",
    description: "Multimodal reasoning and planning.",
    inputPrice: 2.0,
    outputPrice: 12.0,
    capabilities: ["vision", "reasoning", "context"],
  },
  {
    id: "google/gemini-3-flash-preview",
    name: "Gemini 3 Flash",
    provider: "Google",
    description: "Low-latency generation for rapid loops.",
    inputPrice: 0.5,
    outputPrice: 3.0,
    capabilities: ["fast"],
  },
  {
    id: "google/gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "Google",
    description: "High-quality responses with long context.",
    inputPrice: 3.0,
    outputPrice: 18.0,
    capabilities: ["context", "reasoning"],
  },
  {
    id: "google/gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "Google",
    description: "Speed-focused general model.",
    inputPrice: 0.8,
    outputPrice: 4.0,
    capabilities: ["fast"],
  },
  {
    id: "deepseek/deepseek-r1",
    name: "DeepSeek R1",
    provider: "DeepSeek",
    description: "Hybrid reasoning focused on depth.",
    inputPrice: 3.0,
    outputPrice: 12.0,
    capabilities: ["reasoning", "context"],
  },
  {
    id: "deepseek/deepseek-v3.2",
    name: "DeepSeek V3.2",
    provider: "DeepSeek",
    description: "Balanced capability with cost control.",
    inputPrice: 2.5,
    outputPrice: 9.5,
    capabilities: ["reasoning", "context"],
  },
  {
    id: "deepseek/deepseek-v3.1-terminus",
    name: "DeepSeek V3.1 Terminus",
    provider: "DeepSeek",
    description: "Experimental model for heavy reasoning.",
    inputPrice: 4.0,
    outputPrice: 16.0,
    capabilities: ["reasoning"],
  },
  {
    id: "moonshotai/kimi-k2",
    name: "Kimi K2 Instruct",
    provider: "Moonshot AI",
    description: "Multi-expert instruction tuning.",
    inputPrice: 8.0,
    outputPrice: 32.0,
    capabilities: ["reasoning", "context"],
  },
  {
    id: "moonshotai/kimi-k2-thinking",
    name: "Kimi K2 Thinking",
    provider: "Moonshot AI",
    description: "Deep thinking mode for analysis-heavy tasks.",
    inputPrice: 9.0,
    outputPrice: 36.0,
    capabilities: ["reasoning", "context"],
  },
  {
    id: "meta-llama/llama-4-maverick",
    name: "LLaMA 4 Maverick",
    provider: "Meta",
    description: "Open-weight, fine-tunable model.",
    inputPrice: 1.2,
    outputPrice: 4.8,
    capabilities: ["open", "reasoning"],
  },
];

const PROVIDER_STYLES: Record<string, { badge: string }> = {
  OpenAI: { badge: "text-muted-foreground" },
  Anthropic: { badge: "text-muted-foreground" },
  Google: { badge: "text-muted-foreground" },
  DeepSeek: { badge: "text-muted-foreground" },
  "Moonshot AI": { badge: "text-muted-foreground" },
  Meta: { badge: "text-muted-foreground" },
  Mistral: { badge: "text-muted-foreground" },
  xAI: { badge: "text-muted-foreground" },
  Zhipu: { badge: "text-muted-foreground" },
};

const CAPABILITY_STYLES: Record<string, string> = {
  reasoning: "bg-primary/10 text-primary border-primary/20",
  vision: "bg-sky-500/10 text-sky-200 border-sky-500/20",
  fast: "bg-amber-500/10 text-amber-200 border-amber-500/20",
  context: "bg-white/[0.06]/70 text-foreground border-white/15/60",
  open: "bg-white/[0.03] text-foreground/70 border-white/15/60",
};

type ProviderIconComponent = React.ComponentType<{
  className?: string;
  size?: number;
}>;

function getProviderIcon(provider: string): ProviderIconComponent {
  const key = provider.toLowerCase();
  if (key.includes("openai")) return OpenAI;
  if (key.includes("anthropic")) return Anthropic;
  if (key.includes("google")) return Google;
  if (key.includes("meta")) return Meta;
  if (key.includes("mistral")) return Mistral;
  if (key.includes("moonshot")) return Moonshot;
  if (key.includes("deepseek")) return DeepSeek;
  if (key.includes("xai") || key.includes("grok")) return Grok;
  return Sparkles;
}

function getProviderStyle(provider: string) {
  return (
    PROVIDER_STYLES[provider] ?? {
      badge: "text-muted-foreground",
    }
  );
}

function ProviderMark({
  provider,
  size = 32,
}: {
  provider: string;
  size?: number;
}) {
  const Icon = getProviderIcon(provider);
  return (
    <div
      className={cn("flex items-center justify-center text-foreground")}
      style={{ width: size, height: size }}
    >
      <Icon
        size={Math.round(size * 0.6)}
        className="h-[60%] w-[60%] text-current"
        aria-hidden
      />
    </div>
  );
}

interface ModelSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  label: string;
}

export function ModelSelector({
  value,
  onValueChange,
  label,
}: ModelSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [selectedProvider, setSelectedProvider] = React.useState<string | null>(
    null,
  );

  const selectedModel = React.useMemo(
    () => MODELS.find((model) => model.id === value),
    [value],
  );

  const providers = React.useMemo(() => {
    return Array.from(new Set(MODELS.map((model) => model.provider))).sort();
  }, []);

  const filteredModels = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return MODELS.filter((model) => {
      const matchesSearch =
        !query ||
        model.name.toLowerCase().includes(query) ||
        model.provider.toLowerCase().includes(query) ||
        model.description.toLowerCase().includes(query) ||
        model.capabilities.some((capability) => capability.includes(query));
      const matchesProvider = selectedProvider
        ? model.provider === selectedProvider
        : true;
      return matchesSearch && matchesProvider;
    });
  }, [search, selectedProvider]);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
        {label}
      </span>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <Button
              variant="outline"
              className="h-12 w-full justify-between border-white/10 bg-black/40 px-3 text-left"
            />
          }
        >
          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex items-center gap-3 overflow-hidden">
              {selectedModel ? (
                <>
                  <ProviderMark provider={selectedModel.provider} size={28} />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">
                      {selectedModel.name}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      {selectedModel.provider}
                    </div>
                  </div>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">Select a model...</span>
              )}
            </div>
            <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </DialogTrigger>

        <DialogContent
          size="lg"
          className="h-[82vh] max-h-[860px] border border-white/10/80 bg-background p-0 overflow-hidden"
        >
          <div className="flex h-full min-h-0 flex-col">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-4">
              <DialogHeader>
                <DialogTitle className="text-sm font-semibold text-foreground">
                  Model Library
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Filter by provider, search by capability, then pick the best
                  model for this run.
                </DialogDescription>
              </DialogHeader>
              <DialogClose
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:bg-white/[0.06]/60 hover:text-foreground"
                  />
                }
              >
                <X className="h-4 w-4" />
              </DialogClose>
            </div>

            <div className="flex min-h-0 flex-1 flex-col md:flex-row">
              <aside className="flex w-full flex-col border-b border-white/10 bg-background/80 md:w-64 md:border-b-0 md:border-r md:min-h-0">
                <div className="px-4 pt-4">
                  <p className="text-sm uppercase tracking-[0.25em] text-foreground/70">
                    Providers
                  </p>
                </div>
                <ScrollArea className="flex-1 min-h-0">
                  <div className="space-y-1 p-3">
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-between text-sm font-semibold text-foreground",
                        !selectedProvider &&
                          "bg-white/[0.03] text-foreground hover:bg-card/90",
                      )}
                      onClick={() => setSelectedProvider(null)}
                    >
                      <span className="flex items-center gap-2">
                        <Star
                          className="h-3 w-3 text-foreground"
                          fill="white"
                          stroke="white"
                        />
                        All Models
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {MODELS.length}
                      </span>
                    </Button>
                    {providers.map((provider) => {
                      const providerStyle = getProviderStyle(provider);
                      return (
                        <Button
                          key={provider}
                          variant="ghost"
                          className={cn(
                            "w-full justify-between text-sm font-semibold text-foreground",
                            selectedProvider === provider &&
                              "bg-white/[0.03] text-foreground hover:bg-card/90",
                          )}
                          onClick={() => setSelectedProvider(provider)}
                        >
                          <span className="flex items-center gap-2">
                            <ProviderMark provider={provider} size={18} />
                            {provider}
                          </span>
                          <span className={cn("text-xs", providerStyle.badge)}>
                            {
                              MODELS.filter(
                                (model) => model.provider === provider,
                              ).length
                            }
                          </span>
                        </Button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </aside>

              <section className="flex min-h-0 min-w-0 flex-1 flex-col">
                <div className="border-b border-white/10 p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search models, providers, capabilities..."
                      className="h-10 border-white/10 bg-black/40 pl-9"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                  </div>
                </div>

                <ScrollArea className="flex-1 min-h-0">
                  <div className="grid gap-3 p-4 pb-8 md:grid-cols-2">
                    {filteredModels.map((model) => {
                      const isSelected = value === model.id;
                      return (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => {
                            onValueChange(model.id);
                            setOpen(false);
                          }}
                          className={cn(
                            "group flex h-full min-w-0 flex-col gap-3 overflow-hidden rounded-[10px] border p-4 text-left transition",
                            "hover:border-primary/40 hover:bg-primary/5",
                            isSelected
                              ? "border-primary/50 bg-primary/10"
                              : "border-white/10 bg-black/40",
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex min-w-0 items-start gap-3">
                              <ProviderMark
                                provider={model.provider}
                                size={34}
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="truncate text-sm font-semibold text-foreground">
                                    {model.name}
                                  </h4>
                                  {model.capabilities.includes("fast") && (
                                    <Zap className="h-3.5 w-3.5 text-amber-300" />
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {model.provider}
                                </p>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="flex h-5 w-5 items-center justify-center rounded-[10px] border border-primary/60 bg-primary/20">
                                <Check className="h-3 w-3 text-primary" />
                              </div>
                            )}
                          </div>

                          <p className="line-clamp-2 text-xs text-foreground/70">
                            {model.description}
                          </p>

                          <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-3">
                            <div className="flex flex-wrap gap-1.5">
                              {model.capabilities.map((capability, index) => (
                                <Badge
                                  key={`${model.id}-${capability}-${index}`}
                                  variant="secondary"
                                  className={cn(
                                    "h-5 border px-1.5 text-[10px] font-normal",
                                    CAPABILITY_STYLES[capability] ??
                                      "bg-white/[0.03] text-foreground/70 border-white/15/60",
                                  )}
                                >
                                  {capability}
                                </Badge>
                              ))}
                            </div>
                            <span className="text-[10px] font-mono text-muted-foreground">
                              ${model.inputPrice}/{model.outputPrice}
                            </span>
                          </div>
                        </button>
                      );
                    })}

                    {filteredModels.length === 0 && (
                      <div className="col-span-full flex flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
                        <Search className="h-8 w-8 opacity-30" />
                        <p className="text-sm">No models match that search.</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => setSearch("")}
                        >
                          Clear search
                        </Button>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                <div className="border-t border-white/10 bg-background/80 px-4 py-2 text-center text-[10px] text-muted-foreground">
                  Prices represent input/output per 1M tokens. Availability
                  depends on OpenRouter support.
                </div>
              </section>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
