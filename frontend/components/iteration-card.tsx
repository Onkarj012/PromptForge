import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Iteration } from "@/lib/types";
import ReactMarkdown from "react-markdown";

interface IterationCardProps {
  iteration: Iteration;
}

export function IterationCard({ iteration }: IterationCardProps) {
  return (
    <Card className="overflow-hidden rounded-[10px] border-white/10 bg-card">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-4 py-3">
        <h3 className="font-eyebrow text-xs text-muted-foreground">
          Iteration {iteration.iteration}
        </h3>
        <Badge
          variant={
            iteration.score >= 8
              ? "default"
              : iteration.score >= 5
              ? "secondary"
              : "destructive"
          }
        >
          Score: {iteration.score}/10
        </Badge>
      </div>
      <CardContent className="space-y-4 p-4">
        <div className="space-y-2">
          <h4 className="font-eyebrow text-xs text-muted-foreground">
            Refined Prompt
          </h4>
          <div className="prose prose-sm prose-invert max-w-none text-foreground/80">
            <ReactMarkdown>{iteration.prompt}</ReactMarkdown>
          </div>
        </div>
        {iteration.critique && (
          <div className="space-y-2 border-t border-white/10 pt-2">
            <h4 className="font-eyebrow text-xs text-muted-foreground">
              Critique
            </h4>
            <div className="prose prose-sm prose-invert max-w-none italic text-muted-foreground">
              <ReactMarkdown>{iteration.critique}</ReactMarkdown>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
