import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Iteration } from "@/lib/types";
import ReactMarkdown from "react-markdown";

interface IterationCardProps {
  iteration: Iteration;
}

export function IterationCard({ iteration }: IterationCardProps) {
  return (
    <Card className="overflow-hidden bg-zinc-900 border-zinc-800">
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-800/50 border-b border-zinc-800">
        <h3 className="text-sm font-medium text-zinc-100">
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
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Refined Prompt
          </h4>
          <div className="prose prose-sm dark:prose-invert max-w-none text-zinc-300">
            <ReactMarkdown>{iteration.prompt}</ReactMarkdown>
          </div>
        </div>
        {iteration.critique && (
          <div className="space-y-2 pt-2 border-t border-zinc-800/50">
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Critique
            </h4>
            <div className="prose prose-sm dark:prose-invert max-w-none text-zinc-400 italic">
              <ReactMarkdown>{iteration.critique}</ReactMarkdown>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
