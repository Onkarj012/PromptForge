import Link from "next/link"

export default function HomePage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">PromptForge</h1>
      <p className="mt-2 text-muted-foreground">
        Agentic prompt refinement platform.
      </p>
      <Link href="/refine" className="mt-4 px-4 py-2 rounded bg-black text-white">
        Refine Prompt
      </Link>
    </main>
  )
}
