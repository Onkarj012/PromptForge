export type RefineRequest = {
    prompt: string;
    iterations: number;
    mode: 'user_defined' | "auto";
    creator_model: string;
    critic_model: string;
    domain?: string;
}

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
