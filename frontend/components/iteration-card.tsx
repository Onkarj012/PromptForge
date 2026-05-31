import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LiveIteration } from "@/lib/types";
import ReactMarkdown from "react-markdown";

interface IterationCardProps {
  iteration: LiveIteration;
}

export function IterationCard({ iteration }: IterationCardProps) {
  const a = iteration.assertions;
  return (
    <details className="group overflow-hidden rounded-[10px] border border-dashed border-white/10 bg-card">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-open:rotate-90" />
          <span className="font-eyebrow text-xs text-muted-foreground">Iteration {iteration.iteration}</span>
        </div>
        <div className="flex items-center gap-2">
          {a && a.total > 0 && (
            <Badge variant={a.passed === a.total ? "default" : "destructive"}>
              {a.passed}/{a.total} checks
            </Badge>
          )}
          <Badge variant={iteration.score >= 8 ? "default" : iteration.score >= 5 ? "secondary" : "destructive"}>
            Score: {iteration.score}/10
          </Badge>
        </div>
      </summary>
      <div className="space-y-4 border-t border-white/10 px-4 py-4">
        <div className="space-y-2">
          <h4 className="font-eyebrow text-xs text-muted-foreground">Refined Prompt</h4>
          <div className="prose prose-sm prose-invert max-w-none text-foreground/80">
            <ReactMarkdown>{iteration.prompt}</ReactMarkdown>
          </div>
        </div>
        {iteration.outputs && iteration.outputs.length > 0 && (
          <div className="space-y-2 border-t border-white/10 pt-3">
            <h4 className="font-eyebrow text-xs text-muted-foreground">Observed output (prompt was actually run)</h4>
            {iteration.outputs.slice(0, 2).map((o, i) => (
              <div key={i} className="rounded-[10px] border border-dashed border-white/10 bg-black/30 p-3">
                {o.input && <p className="mb-1 text-xs text-muted-foreground">input: {o.input}</p>}
                <p className="whitespace-pre-wrap text-sm text-foreground/85">{o.output}</p>
              </div>
            ))}
          </div>
        )}
        {iteration.critique && (
          <div className="space-y-2 border-t border-white/10 pt-3">
            <h4 className="font-eyebrow text-xs text-muted-foreground">Critique</h4>
            <div className="prose prose-sm prose-invert max-w-none italic text-muted-foreground">
              <ReactMarkdown>{iteration.critique}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </details>
  );
}
