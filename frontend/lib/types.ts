export type RefineRequest = {
    prompt: string;
    iterations: number;
    mode: 'user_defined' | "auto";
    creator_model: string;
    critic_model: string;
    domain?: string;
    target_tool?: string;
    project_type?: string;
    stack?: string;
    steer?: string;
}

export type StreamEvent = {
    event: "start" | "draft" | "critique" | "iteration" | "done" | "error";
    iteration?: number;
    prompt?: string;
    score?: number;
    critique?: { strengths?: string[]; weaknesses?: string[]; suggestions?: string[] };
    cost?: number;
    original_prompt?: string;
    final_prompt?: string;
    final_score?: number;
    iterations?: number;
    total_cost?: number;
    total_tokens?: number;
    message?: string;
};

export type LiveIteration = {
    iteration: number;
    prompt: string;
    critique: string;
    score: number;
    cost?: number;
};

export type RefineResponse = {
    run_id: string;
    final_prompt: string;
    final_score?: number;
    total_cost?: number;
    iterations: number;
    iterations_detail?: Array<{
        iteration: number;
        prompt: string;
        critique?: {
            score?: number;
            strengths?: string[];
            weaknesses?: string[];
            suggestions?: string[];
        };
        score?: number;
    }>;
};

export interface Iteration {
    iteration: number;
    prompt: string;
    critique: string;
    score: number;
}

export type BenchRequest = {
    prompt: string;
    models: string[];
    critic_model?: string;
};

export type BenchResult = {
    model: string;
    output?: string;
    score?: number;
    latency_ms?: number;
    tokens?: number;
    cost?: number;
    quality_per_dollar?: number | null;
    error?: string;
};

export type BenchResponse = {
    run_id: string;
    results: BenchResult[];
};

export type RunSummary = {
    run_id: string;
    mode: string;
    creator_model?: string;
    critic_model?: string;
    original_prompt?: string;
    final_score?: number;
    total_cost?: number;
    total_tokens?: number;
    max_iterations?: number;
    created_at?: string;
};
