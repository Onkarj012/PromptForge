import { PromptRequest, AVAILABLE_MODELS } from "@/lib/api";
import { Loader2, Sparkles, MessageSquare, Box } from "lucide-react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";

interface PromptFormProps {
    formData: Omit<PromptRequest, "mode">;
    setFormData: (data: Omit<PromptRequest, "mode">) => void;
    handleSubmit: (e: React.FormEvent) => void;
    loading: boolean;
}

export function PromptForm({
    formData,
    setFormData,
    handleSubmit,
    loading,
}: PromptFormProps) {
    const getModelInfo = (modelId: string | undefined) => {
        if (!modelId) return undefined;
        return AVAILABLE_MODELS.find((m) => m.id === modelId);
    };

    return (
        <Card className="mb-12 border-white/10 bg-transparent shadow-none p-0 overflow-visible">
            <form onSubmit={handleSubmit} className="relative z-20">
                {/* Main Input - Hero Style */}
                <div className="mb-8 relative group">
                    <div className="absolute inset-0 bg-white/5 rounded-2xl blur-xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
                    <div className="relative bg-black/40 backdrop-blur-2xl rounded-2xl border border-white/10 p-2 transition-all duration-300 focus-within:border-white/20 focus-within:ring-1 focus-within:ring-white/10 focus-within:bg-black/60 shadow-2xl">
                        <textarea
                            value={formData.user_input}
                            onChange={(e) =>
                                setFormData({ ...formData, user_input: e.target.value })
                            }
                            className="w-full px-6 py-6 bg-transparent border-none outline-none text-white placeholder-zinc-600 font-light text-2xl leading-relaxed resize-y min-h-[160px] scrollbar-thin scrollbar-thumb-zinc-700"
                            rows={4}
                            placeholder="Describe your vision..."
                            required
                            minLength={10}
                        />
                        <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-white/2 rounded-b-xl">
                            <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium tracking-wider uppercase">
                                <MessageSquare size={14} />
                                <span>Input Protocol</span>
                            </div>
                            <div className="text-xs text-zinc-500">
                                {formData.user_input.length} chars
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid Layout for Controls */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                    {/* Left Column: Configuration (4 cols) */}
                    <div className="md:col-span-4 space-y-6">
                        {/* Domain Input */}
                        <div className="glass-panel p-5 rounded-xl">
                            <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">
                                <Box size={14} />
                                Target Domain
                            </label>
                            <input
                                type="text"
                                value={formData.domain}
                                onChange={(e) =>
                                    setFormData({ ...formData, domain: e.target.value })
                                }
                                className="w-full px-0 py-2 bg-transparent border-b border-white/10 focus:border-white/50 outline-none text-white placeholder-zinc-700 transition-all text-sm font-mono"
                                placeholder="e.g. system_architecture"
                            />
                        </div>

                        {/* Iterations Slider */}
                        <div className="glass-panel p-5 rounded-xl">
                            <label className="flex justify-between text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">
                                <span>Refinement Cycles</span>
                                <span className="text-white">{formData.max_iterations}</span>
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="5"
                                step="1"
                                value={formData.max_iterations}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        max_iterations: parseInt(e.target.value),
                                    })
                                }
                                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                            />
                            <div className="flex justify-between text-[10px] text-zinc-600 mt-2 font-mono uppercase">
                                <span>Speed</span>
                                <span>Quality</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Model Selection (8 cols) */}
                    <div className="md:col-span-8 glass-panel p-1 rounded-xl flex flex-col md:flex-row gap-1">
                        {/* Creator Model */}
                        <div className="flex-1 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300 mb-2 block">
                                Creator Engine
                            </label>
                            <select
                                value={formData.creator_model}
                                onChange={(e) =>
                                    setFormData({ ...formData, creator_model: e.target.value })
                                }
                                className="w-full bg-transparent border-none text-sm text-white focus:ring-0 cursor-pointer p-0 font-medium"
                            >
                                {AVAILABLE_MODELS.map((model) => (
                                    <option key={model.id} value={model.id} className="bg-black text-gray-300">
                                        {model.name}
                                    </option>
                                ))}
                            </select>
                            <div className="h-px w-full bg-white/10 my-3" />
                            <p className="text-[10px] text-zinc-500 leading-normal line-clamp-2">
                                {getModelInfo(formData.creator_model)?.strengths.join(" • ")}
                            </p>
                        </div>

                        {/* Critic Model */}
                        <div className="flex-1 p-4 rounded-lg bg-transparent hover:bg-white/5 transition-colors cursor-pointer group border-l border-white/5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300 mb-2 block">
                                Critic Engine
                            </label>
                            <select
                                value={formData.critic_model}
                                onChange={(e) =>
                                    setFormData({ ...formData, critic_model: e.target.value })
                                }
                                className="w-full bg-transparent border-none text-sm text-white focus:ring-0 cursor-pointer p-0 font-medium"
                            >
                                {AVAILABLE_MODELS.map((model) => (
                                    <option key={model.id} value={model.id} className="bg-black text-gray-300">
                                        {model.name}
                                    </option>
                                ))}
                            </select>
                            <div className="h-px w-full bg-white/10 my-3" />
                            <p className="text-[10px] text-zinc-500 leading-normal line-clamp-2">
                                {getModelInfo(formData.critic_model)?.strengths.join(" • ")}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <Button
                        type="submit"
                        variant="glass"
                        size="lg"
                        className="w-full h-16 text-lg tracking-widest uppercase font-bold text-white bg-white/5 hover:bg-white/20 border-white/10 hover:border-white/30"
                        disabled={loading}
                        isLoading={loading}
                        leftIcon={!loading && <Sparkles size={18} className="text-white" />}
                    >
                        {loading ? "Initializing Agents..." : "Execute refinement protocol"}
                    </Button>
                </div>
            </form>
        </Card>
    );
}
