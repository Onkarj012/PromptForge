import Link from "next/link";
import {
  ArrowRight,
  Gauge,
  Layers,
  ShieldCheck,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/reveal";

const FEATURES = [
  {
    title: "Dual-model critique",
    description:
      "Pair a creator model with a critic to surface gaps, edge cases, and clarity issues.",
    icon: Layers,
  },
  {
    title: "Signal-rich scoring",
    description:
      "Track prompt quality with structured scoring and a visible refinement trail.",
    icon: Gauge,
  },
  {
    title: "Guardrails built-in",
    description:
      "Nudge output toward tone, constraints, and domain alignment without extra work.",
    icon: ShieldCheck,
  },
];

const WORKFLOW = [
  {
    step: "01",
    title: "Seed the prompt",
    description: "Capture the raw idea and a clear desired outcome.",
  },
  {
    step: "02",
    title: "Layer constraints",
    description: "Add audience, tone, and guardrails that the critic can enforce.",
  },
  {
    step: "03",
    title: "Refine in loops",
    description: "Run iterative critique until the prompt is resilient and crisp.",
  },
];

const SIGNALS = [
  {
    label: "Models",
    value: "Multi-provider",
    detail: "OpenAI, Anthropic, Google, and more",
  },
  {
    label: "Iterations",
    value: "1-5",
    detail: "Quick passes or deep refinement",
  },
  {
    label: "Output",
    value: "Markdown",
    detail: "Readable, ready-to-ship prompts",
  },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100 motion-safe:animate-in motion-safe:fade-in">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/4 h-[420px] w-[420px] rounded-full bg-primary/20 blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 h-[360px] w-[360px] rounded-full bg-fuchsia-500/10 blur-[160px]" />
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_10%_10%,rgba(63,63,70,0.16),transparent)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10 lg:px-10">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center border border-zinc-800/70 bg-zinc-900/70">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                PromptForge
              </p>
              <p className="text-sm font-medium">Agentic prompt refinement</p>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-xs text-zinc-300 sm:flex">
            <a href="#features" className="hover:text-zinc-200">
              Features
            </a>
            <a href="#workflow" className="hover:text-zinc-200">
              Workflow
            </a>
            <a href="#signals" className="hover:text-zinc-200">
              Signals
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/refine"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "border-zinc-700/70 bg-zinc-950/60"
              )}
            >
              Open Studio
            </Link>
          </div>
        </header>

        <Reveal>
          <section className="mt-16 grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <Badge className="border border-zinc-800/70 bg-zinc-900/70 text-zinc-200">
                Build prompts that survive critique
              </Badge>
              <h1 className="text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
                Forge prompts with clarity, constraints, and confidence.
              </h1>
              <p className="text-base text-zinc-300 sm:text-lg">
                PromptForge layers structured critique on top of your ideas so you can
                ship prompts that hold up under pressure. Define your intent, pin down
                constraints, and iterate with purpose.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/refine"
                  className={cn(buttonVariants({ size: "lg" }), "group")}
                >
                  Start Refining
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/refine"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "border-zinc-700/70 bg-zinc-950/60"
                  )}
                >
                  View Live Studio
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {SIGNALS.map((signal) => (
                  <div
                    key={signal.label}
                    className="rounded-none border border-zinc-800/70 bg-zinc-900/50 p-3"
                  >
                    <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400">
                      {signal.label}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-zinc-100">
                      {signal.value}
                    </p>
                    <p className="mt-1 text-xs text-zinc-400">{signal.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-none border border-zinc-800/70 bg-zinc-900/50 p-6 transition-shadow duration-300 hover:shadow-[0_0_30px_rgba(93,66,190,0.08)]">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-zinc-400">
                <span>Live Preview</span>
                <span className="text-primary">Refined</span>
              </div>
              <div className="mt-6 space-y-4 text-sm">
                <div className="rounded-none border border-zinc-800/70 bg-zinc-950/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                    Input
                  </p>
                  <p className="mt-2 text-zinc-200">
                    Design a landing page for a new AI productivity app.
                  </p>
                </div>
                <div className="rounded-none border border-primary/40 bg-primary/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-primary">
                    Refined Prompt
                  </p>
                  <p className="mt-2 text-zinc-100">
                    Craft a conversion-focused landing page for an AI productivity
                    app. Emphasize time savings, clarity of workflow, and a confident
                    tone. Include sections for benefits, feature proof, and a
                    high-contrast CTA.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-none border border-zinc-800/70 bg-zinc-900/60 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                      Score
                    </p>
                    <p className="mt-1 text-sm font-semibold text-zinc-100">
                      8.6/10
                    </p>
                  </div>
                  <div className="rounded-none border border-zinc-800/70 bg-zinc-900/60 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                      Iterations
                    </p>
                    <p className="mt-1 text-sm font-semibold text-zinc-100">3</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section id="features" className="mt-20 scroll-mt-24">
            <div className="flex items-center gap-3 text-sm text-zinc-300">
              <Wand2 className="h-4 w-4 text-primary" />
              <span className="uppercase tracking-[0.4em]">Why PromptForge</span>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-none border border-zinc-800/70 bg-zinc-900/50 p-5 transition duration-300 hover:border-primary/40 hover:bg-zinc-900/70"
                >
                  <feature.icon className="h-5 w-5 text-primary" />
                  <h3 className="mt-4 text-sm font-semibold text-zinc-100">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-300">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section
            id="workflow"
            className="mt-20 grid gap-10 scroll-mt-24 lg:grid-cols-[0.6fr_0.4fr]"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-primary/80">
                Workflow
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-zinc-50">
                From raw idea to polished prompt.
              </h2>
              <div className="mt-6 grid gap-4">
                {WORKFLOW.map((item) => (
                  <div
                    key={item.step}
                    className="flex items-start gap-4 border-b border-zinc-800/60 pb-4"
                  >
                    <div className="text-sm font-semibold text-primary">
                      {item.step}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-100">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm text-zinc-300">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-none border border-zinc-800/70 bg-zinc-900/50 p-6 transition duration-300 hover:border-primary/40">
              <p className="text-xs uppercase tracking-[0.4em] text-zinc-400">
                Output-ready
              </p>
              <h3 className="mt-3 text-lg font-semibold text-zinc-100">
                Ship prompts with structure.
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-zinc-300">
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Markdown-ready final prompt blocks.
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Transparent scoring and iteration trail.
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Model pairings for specialized refinement.
                </li>
              </ul>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section id="signals" className="mt-20 scroll-mt-24">
            <div className="rounded-none border border-zinc-800/70 bg-zinc-900/50 p-6">
              <div className="flex items-center gap-3 text-sm text-zinc-300">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="uppercase tracking-[0.4em]">
                  Command Center Ready
                </span>
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-zinc-100">
                Everything you need to run prompt refinement like a system.
              </h2>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {SIGNALS.map((signal) => (
                  <div
                    key={`signal-${signal.label}`}
                    className="rounded-none border border-zinc-800/70 bg-zinc-950/60 p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                      {signal.label}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-zinc-100">
                      {signal.value}
                    </p>
                    <p className="mt-1 text-xs text-zinc-400">{signal.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="mt-20">
            <div className="flex flex-col items-start justify-between gap-6 rounded-none border border-zinc-800/70 bg-zinc-900/50 p-6 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-zinc-400">
                  Ready to refine
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-zinc-100">
                  Enter the studio and ship sharper prompts today.
                </h2>
              </div>
              <Link
                href="/refine"
                className={cn(buttonVariants({ size: "lg" }), "group")}
              >
                Launch Prompt Studio
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </section>
        </Reveal>
      </div>
    </main>
  );
}
