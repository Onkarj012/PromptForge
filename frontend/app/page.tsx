import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/reveal";

const MODES = [
  {
    tag: "Forge Mode",
    title: "Build faster with AI",
    body: "Turn plain-English intent into optimized, tool-specific prompts for Cursor, Bolt, v0, and Claude. Generate, critique, score, iterate.",
    who: "For vibe coders & solo devs",
  },
  {
    tag: "Bench Mode",
    title: "Optimize & test AI quality",
    body: "Run one prompt across models and compare quality, latency, and cost. Set baselines, catch regressions, control spend.",
    who: "For AI teams & engineers",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Describe or paste",
    body: "Describe your project, or paste an existing prompt you want to sharpen.",
  },
  {
    step: "02",
    title: "Agents refine it",
    body: "A creator/critic loop generates, evaluates, and iterates until the prompt is resilient.",
  },
  {
    step: "03",
    title: "Copy or benchmark",
    body: "Copy your tool-ready prompt, or benchmark it across models for cost and quality.",
  },
];

const FEATURES = [
  "Multi-agent prompt optimization",
  "Tool-specific formatting",
  "Model benchmarking",
  "Cost & quality analytics",
  "Version history",
  "Regression testing",
];

const TIERS = [
  { name: "Free", price: "$0", note: "10 generations / 3 benchmarks", featured: false },
  { name: "Pro", price: "$19", note: "200 generations / 50 benchmarks", featured: true },
  { name: "Team", price: "$69", note: "Unlimited + CI/CD + API", featured: false },
];

const primaryBtn =
  "inline-flex items-center gap-2 rounded-[10px] bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform duration-300 [transition-timing-function:cubic-bezier(0.44,0,0.56,1)] hover:scale-[1.03]";
const secondaryBtn =
  "inline-flex items-center gap-2 rounded-[10px] border border-foreground/15 px-6 py-3 text-sm font-medium text-foreground transition-colors duration-300 hover:bg-foreground/5";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-[10px]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" className="font-display text-2xl">
            PromptForge<span className="text-primary">.</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-foreground/70 sm:flex">
            <a href="#paths" className="hover:text-foreground">Platform</a>
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
          </nav>
          <Link href="/refine" className={primaryBtn}>
            Start Free
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        {/* Hero */}
        <Reveal>
          <section className="py-20 sm:py-28">
            <p className="font-eyebrow text-xs text-foreground/60">
              Prompt engineering platform
              <span className="ml-1 inline-block text-primary animate-blink">_</span>
            </p>
            <h1 className="font-display mt-6 max-w-3xl text-5xl sm:text-7xl">
              Stop guessing your prompts.{" "}
              <span className="text-primary">Engineer them.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base text-foreground/70 sm:text-lg">
              Generate optimized prompts for Cursor, Bolt, and Claude — then
              benchmark them across models with cost and quality scoring.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/refine" className={primaryBtn}>
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/refine" className={secondaryBtn}>
                Watch Demo
              </Link>
            </div>
          </section>
        </Reveal>

        {/* Two paths */}
        <Reveal>
          <section id="paths" className="scroll-mt-24 py-12">
            <div className="grid gap-5 md:grid-cols-2">
              {MODES.map((m) => (
                <div
                  key={m.tag}
                  className="rounded-[10px] border border-border bg-card p-8 transition-transform duration-300 [transition-timing-function:cubic-bezier(0.44,0,0.56,1)] hover:scale-[1.02]"
                >
                  <p className="font-eyebrow text-xs text-primary">{m.tag}</p>
                  <h3 className="font-display mt-3 text-3xl">{m.title}</h3>
                  <p className="mt-3 text-sm text-foreground/70">{m.body}</p>
                  <p className="mt-6 text-xs text-foreground/50">{m.who}</p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* How it works */}
        <Reveal>
          <section id="how" className="scroll-mt-24 py-16">
            <p className="font-eyebrow text-xs text-foreground/60">How it works</p>
            <h2 className="font-display mt-3 text-4xl sm:text-5xl">
              Three steps to a better prompt.
            </h2>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {STEPS.map((s) => (
                <div key={s.step} className="border-t border-foreground/15 pt-5">
                  <p className="font-display text-3xl text-primary">{s.step}</p>
                  <h3 className="mt-3 text-base font-medium">{s.title}</h3>
                  <p className="mt-2 text-sm text-foreground/70">{s.body}</p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* Features */}
        <Reveal>
          <section className="py-16">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <div
                  key={f}
                  className="rounded-[10px] border border-border bg-card px-5 py-4 text-sm font-medium"
                >
                  {f}
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* Pricing */}
        <Reveal>
          <section id="pricing" className="scroll-mt-24 py-16">
            <h2 className="font-display text-4xl sm:text-5xl">
              Simple, transparent pricing.
            </h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {TIERS.map((t) => (
                <div
                  key={t.name}
                  className={`rounded-[10px] border p-8 ${
                    t.featured
                      ? "border-primary bg-card"
                      : "border-border bg-card"
                  }`}
                >
                  {t.featured && (
                    <p className="font-eyebrow text-xs text-primary">Most popular</p>
                  )}
                  <h3 className="font-display mt-2 text-2xl">{t.name}</h3>
                  <p className="font-display mt-2 text-4xl">
                    {t.price}
                    <span className="text-base text-foreground/50">/mo</span>
                  </p>
                  <p className="mt-3 text-sm text-foreground/70">{t.note}</p>
                  <Link
                    href="/refine"
                    className={`mt-6 ${t.featured ? primaryBtn : secondaryBtn} w-full justify-center`}
                  >
                    {t.featured ? "Start Pro" : `Choose ${t.name}`}
                  </Link>
                </div>
              ))}
            </div>
          </section>
        </Reveal>
      </div>

      {/* Final CTA — dark editorial section */}
      <Reveal>
        <section className="mt-10 bg-[#070707] py-24 text-[#efece4]">
          <div className="mx-auto max-w-6xl px-6 text-center lg:px-10">
            <h2 className="font-display mx-auto max-w-2xl text-5xl sm:text-6xl">
              Automation starts with a better prompt.
            </h2>
            <Link
              href="/refine"
              className={`${primaryBtn} mt-8`}
            >
              Start Forging — It&apos;s Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </Reveal>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 text-xs text-foreground/50 lg:px-10">
          <span className="font-display text-base text-foreground">
            PromptForge<span className="text-primary">.</span>
          </span>
          <span>© {new Date().getFullYear()} PromptForge</span>
        </div>
      </footer>
    </main>
  );
}
