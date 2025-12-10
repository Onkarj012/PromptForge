import { RefinementResponse, AVAILABLE_MODELS } from "@/lib/api";
import { Markdown } from "@/components/Markdown";
import { Copy, Check, TrendingUp, DollarSign, Activity, ArrowRight, Lightbulb, AlertTriangle, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";

interface ResultDisplayProps {
    result: RefinementResponse;
}

export function ResultDisplay({ result }: ResultDisplayProps) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async (text: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getScoreColor = (score: number) => {
        if (score >= 9) return "text-emerald-400";
        if (score >= 7) return "text-amber-400";
        return "text-rose-400";
    };

    const improvement = result.iterations.length > 1
        ? (result.final_score - result.iterations[0].critic_feedback.score).toFixed(1)
        : "0.0";

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Final Score", value: result.final_score.toFixed(1) + "/10", icon: Activity, color: "text-emerald-400" },
                    { label: "Iterations", value: result.total_iterations, icon: TrendingUp, color: "text-blue-400" },
                    { label: "Total Cost", value: "$" + result.total_cost.toFixed(4), icon: DollarSign, color: "text-white" },
                    { label: "Improvement", value: "+" + improvement, icon: ArrowRight, color: "text-amber-400" },
                ].map((stat, i) => (
                    <Card key={i} className="p-5 flex items-center justify-between border-white/5 bg-white/5 backdrop-blur-md">
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">{stat.label}</p>
                            <p className={`text-2xl font-light ${stat.color}`}>{stat.value}</p>
                        </div>
                        <div className={`p-2 rounded-lg bg-white/5 ${stat.color} opacity-80`}>
                            <stat.icon size={18} />
                        </div>
                    </Card>
                ))}
            </div>

            {/* Final Result */}
            <Card className="relative overflow-visible border-white/10 bg-black/40 shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-white/10" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2 tracking-wide uppercase">
                            <SparklesIcon /> System Output
                        </h2>
                        <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest">Optimized for deployment</p>
                    </div>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => copyToClipboard(result.final_prompt)}
                        className="bg-white/5 hover:bg-white/10 border-white/10 text-xs uppercase tracking-widest"
                        leftIcon={copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    >
                        {copied ? "Copied" : "Copy to Clipboard"}
                    </Button>
                </div>

                <div className="p-8 rounded-xl bg-white/5 border border-white/5 text-slate-200 leading-loose font-light text-lg">
                    <Markdown content={result.final_prompt} />
                </div>
            </Card>

            {/* Journey Accordion (simplified visualization) */}
            <div className="space-y-4 pt-8 border-t border-white/10">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 mb-6">
                    <Activity size={14} /> Refinement Log
                </h3>

                {result.iterations.map((iter, idx) => (
                    <div key={iter.iteration} className="group relative pl-8 border-l border-white/10 pb-8 last:pb-0 last:border-l-0">
                        {/* Timeline dot */}
                        <div className={`absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full ring-4 ring-black ${idx === result.iterations.length - 1 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-zinc-700"}`} />

                        <div className="p-5 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-mono text-zinc-500 uppercase">Cycle 0{iter.iteration}</span>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/5 ${getScoreColor(iter.critic_feedback.score)}`}>
                                    SCORE {iter.critic_feedback.score}
                                </span>
                            </div>

                            {/* Feedback Highlights */}
                            <div className="flex flex-wrap gap-2">
                                {iter.critic_feedback.strengths.slice(0, 1).map((s, i) => (
                                    <span key={i} className="inline-flex items-center gap-1.5 text-[10px] text-zinc-400 bg-white/5 px-3 py-1.5 rounded-md border border-white/5">
                                        <CheckCircle size={10} className="text-emerald-500" /> {s}
                                    </span>
                                ))}
                                {iter.critic_feedback.issues.slice(0, 1).map((s, i) => (
                                    <span key={i} className="inline-flex items-center gap-1.5 text-[10px] text-zinc-400 bg-white/5 px-3 py-1.5 rounded-md border border-white/5">
                                        <AlertTriangle size={10} className="text-amber-500" /> {s}
                                    </span>
                                ))}
                                {iter.critic_feedback.suggestions.slice(0, 1).map((s, i) => (
                                    <span key={i} className="inline-flex items-center gap-1.5 text-[10px] text-zinc-400 bg-white/5 px-3 py-1.5 rounded-md border border-white/5">
                                        <Lightbulb size={10} className="text-blue-500" /> {s}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SparklesIcon() {
    return (
        <svg
            className="text-white"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="none"
        >
            <path d="M12 2L14.4 7.2L20 9.2L14.4 11.2L12 16.6L9.6 11.2L4 9.2L9.6 7.2L12 2Z" />
        </svg>
    )
}
