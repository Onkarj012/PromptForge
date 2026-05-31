import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { ModeNav } from "@/components/mode-nav";
import { Reveal, Stagger, StaggerItem } from "@/components/reveal";
import { cn } from "@/lib/utils";

const MODES = [
  { tag: "Forge Mode", title: "Build faster with AI", body: "Turn plain-English intent into optimized, tool-specific prompts for Cursor, Bolt, v0, and Claude. Generate, critique, score, iterate.", who: "For vibe coders & solo devs" },
  { tag: "Bench Mode", title: "Test prompts across models", body: "Run your system prompt across models and temperatures over real test inputs. See how outputs change, score them, lock baselines.", who: "For AI teams & engineers" },
];
const STEPS = [
  { step: "01", title: "Describe or paste", body: "Describe your project, or paste an existing prompt you want to sharpen." },
  { step: "02", title: "Agents refine it", body: "A creator/critic loop generates, evaluates, and iterates until the prompt is resilient." },
  { step: "03", title: "Copy or benchmark", body: "Copy your tool-ready prompt, or benchmark it across models for cost and quality." },
];
const FEATURES = ["Multi-agent prompt optimization", "Tool-specific formatting", "Model benchmarking", "Cost & quality analytics", "Version history", "Regression testing"];
const TIERS = [
  { name: "Free", price: "$0", note: "10 generations / 3 benchmarks", featured: false },
  { name: "Pro", price: "$19", note: "200 generations / 50 benchmarks", featured: true },
  { name: "Team", price: "$69", note: "Unlimited + CI/CD + API", featured: false },
];
const FAQS = [
  { q: "How is this better than just asking Claude to improve my prompt?", a: "A multi-agent creator/critic loop catches what a single pass misses, scores quality objectively, formats for your target tool, and keeps a history — instead of manual back-and-forth." },
  { q: "Which tools does it format prompts for?", a: "Cursor, Bolt, v0, Claude, and a generic mode. Each gets structure tuned to how that tool consumes prompts." },
  { q: "What is Bench Mode?", a: "Run your system prompt across models and temperatures over real test inputs, score each output, and catch regressions against a saved baseline." },
  { q: "Do I need an account to try it?", a: "No — the Forge studio is open. Accounts, usage limits, and billing arrive with the paid tiers." },
];

const primaryBtn = "inline-flex items-center gap-2 rounded-[10px] bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform duration-300 [transition-timing-function:cubic-bezier(0.44,0,0.56,1)] hover:scale-[1.05]";
const secondaryBtn = "inline-flex items-center gap-2 rounded-[10px] border border-dashed border-foreground/20 px-6 py-3 text-sm font-medium text-foreground transition-colors duration-300 hover:bg-foreground/5";

function Corners() {
  return (
    <>
      <Plus className="pointer-events-none absolute -left-[7px] -top-[7px] h-3.5 w-3.5 text-primary/70" />
      <Plus className="pointer-events-none absolute -bottom-[7px] -right-[7px] h-3.5 w-3.5 text-primary/70" />
    </>
  );
}

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-background bg-blueprint text-foreground">
      <ModeNav />

      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        {/* Hero */}
        <Reveal>
          <section className="py-20 sm:py-28">
            <p className="font-eyebrow text-xs text-foreground/60">
              Prompt engineering platform
              <span className="ml-1 inline-block text-primary animate-blink">_</span>
            </p>
            <h1 className="font-display mt-6 max-w-3xl text-5xl sm:text-7xl">
              Stop guessing your prompts. <span className="text-primary">Engineer them.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base text-foreground/70 sm:text-lg">
              Generate optimized prompts for Cursor, Bolt, and Claude — then benchmark them across
              models with cost and quality scoring.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/refine" className={primaryBtn}>Get Started Free<ArrowRight className="h-4 w-4" /></Link>
              <Link href="/bench" className={secondaryBtn}>Explore Bench</Link>
              <span className="animate-float font-eyebrow rounded-[10px] border border-dashed border-white/15 px-3 py-2 text-[10px] text-muted-foreground">
                creator → critic → score
              </span>
            </div>
          </section>
        </Reveal>

        {/* Two paths */}
        <section id="paths" className="scroll-mt-24 py-12">
          <Stagger className="grid gap-5 md:grid-cols-2">
            {MODES.map((m) => (
              <StaggerItem key={m.tag} className="relative rounded-[10px] border border-dashed border-white/15 bg-card p-8 transition-transform duration-300 [transition-timing-function:cubic-bezier(0.44,0,0.56,1)] hover:scale-[1.02]">
                <Corners />
                <p className="font-eyebrow text-xs text-primary">{m.tag}</p>
                <h3 className="font-display mt-3 text-3xl">{m.title}</h3>
                <p className="mt-3 text-sm text-foreground/70">{m.body}</p>
                <p className="mt-6 text-xs text-foreground/50">{m.who}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-24 py-16">
          <Reveal>
            <p className="font-eyebrow text-xs text-foreground/60">How it works</p>
            <h2 className="font-display mt-3 text-4xl sm:text-5xl">Three steps to a better prompt.</h2>
          </Reveal>
          <Stagger className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <StaggerItem key={s.step}>
                <span className="mb-5 block h-2.5 w-2.5 rounded-full bg-primary" />
                <p className="font-display text-3xl text-primary">{s.step}</p>
                <h3 className="mt-2 text-base font-medium">{s.title}</h3>
                <p className="mt-2 text-sm text-foreground/70">{s.body}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* Before / After */}
        <section className="py-16">
          <Reveal>
            <p className="font-eyebrow text-xs text-foreground/60">Before / After</p>
            <h2 className="font-display mt-3 text-4xl sm:text-5xl">See the difference.</h2>
          </Reveal>
          <Stagger className="mt-10 grid gap-5 md:grid-cols-2">
            <StaggerItem className="rounded-[10px] border border-dashed border-white/15 bg-card p-6">
              <p className="font-eyebrow text-xs text-muted-foreground">Raw prompt</p>
              <p className="mt-4 text-sm text-foreground/60">&ldquo;build me a saas with auth and billing&rdquo;</p>
              <p className="mt-6 text-xs text-foreground/40">Vague scope, no stack, no constraints — the tool guesses.</p>
            </StaggerItem>
            <StaggerItem className="relative rounded-[10px] border border-primary bg-card p-6">
              <Corners />
              <p className="font-eyebrow text-xs text-primary">PromptForge prompt</p>
              <p className="mt-4 text-sm text-foreground/80">Objective, Next.js + Supabase + Stripe stack, ordered build plan, file structure, constraints, and verifiable acceptance criteria — formatted for Cursor.</p>
              <p className="mt-6 text-xs text-foreground/50">Structured, tool-specific, scored — the tool builds the right thing first try.</p>
            </StaggerItem>
          </Stagger>
        </section>

        {/* Features */}
        <section className="py-16">
          <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <StaggerItem key={f} className="rounded-[10px] border border-dashed border-white/15 bg-card px-5 py-4 text-sm font-medium">
                {f}
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* Pricing */}
        <section id="pricing" className="scroll-mt-24 py-16">
          <Reveal>
            <h2 className="font-display text-4xl sm:text-5xl">Simple, transparent pricing.</h2>
          </Reveal>
          <Stagger className="mt-10 grid gap-5 md:grid-cols-3">
            {TIERS.map((t) => (
              <StaggerItem key={t.name} className={cn("relative rounded-[10px] border bg-card p-8", t.featured ? "border-primary" : "border-dashed border-white/15")}>
                {t.featured && <Corners />}
                {t.featured && <p className="font-eyebrow text-xs text-primary">Most popular</p>}
                <h3 className="font-display mt-2 text-2xl">{t.name}</h3>
                <p className="font-display mt-2 text-4xl">{t.price}<span className="text-base text-foreground/50">/mo</span></p>
                <p className="mt-3 text-sm text-foreground/70">{t.note}</p>
                <Link href="/refine" className={cn("mt-6 w-full justify-center", t.featured ? primaryBtn : secondaryBtn)}>{t.featured ? "Start Pro" : `Choose ${t.name}`}</Link>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* FAQ */}
        <section className="py-16">
          <Reveal>
            <h2 className="font-display text-4xl sm:text-5xl">Frequently asked.</h2>
          </Reveal>
          <Stagger className="mt-10 grid gap-3">
            {FAQS.map((f) => (
              <StaggerItem key={f.q} className="rounded-[10px] border border-dashed border-white/15 bg-card p-6">
                <p className="text-base font-medium">{f.q}</p>
                <p className="mt-2 text-sm text-foreground/70">{f.a}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      </div>

      {/* Final CTA */}
      <Reveal>
        <section className="mt-10 border-y border-dashed border-black/15 bg-[#efece4] py-24 text-[#0f0f0f]">
          <div className="mx-auto max-w-6xl px-6 text-center lg:px-10">
            <h2 className="font-display mx-auto max-w-2xl text-5xl sm:text-6xl">Automation starts with a better prompt.</h2>
            <Link href="/refine" className={`${primaryBtn} mt-8`}>Start Forging — It&apos;s Free<ArrowRight className="h-4 w-4" /></Link>
          </div>
        </section>
      </Reveal>

      <footer className="border-t border-dashed border-white/10 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 text-xs text-foreground/50 lg:px-10">
          <span className="text-base font-bold tracking-tight text-foreground [font-family:var(--font-accent)]">
            PromptForge<span className="text-primary">.</span>
          </span>
          <span>© {new Date().getFullYear()} PromptForge</span>
        </div>
      </footer>
    </main>
  );
}
