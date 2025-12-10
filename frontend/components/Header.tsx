import { Sparkles, Zap } from "lucide-react";

export function Header() {
    return (
        <div className="text-center mb-16 relative z-10">
            <div className="inline-flex items-center justify-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-slate-400 text-xs font-medium tracking-widest uppercase backdrop-blur-md">
                <Zap size={12} className="text-white" />
                <span>Agentic AI Powered</span>
            </div>

            <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-6 relative inline-block">
                PROMPT<span className="text-white/20">FORGE</span>
                <span className="absolute -top-6 -right-6 text-white/10 animate-pulse">
                    <Sparkles size={40} strokeWidth={1} />
                </span>
            </h1>

            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-light leading-relaxed">
                Transforming raw ideas into <span className="text-white font-medium border-b border-white/20 pb-0.5">precision-engineered prompts</span> via autonomous multi-agent systems.
            </p>
        </div>
    );
}
