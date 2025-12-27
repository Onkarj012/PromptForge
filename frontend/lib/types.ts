export type RefineRequest = {
    prompt: string;
    iterations: number;
    mode: 'user_defined' | "auto";
    creator_model: string;
    critic_model: string;
    domain?: string;
}

export type RefineResponse = {
    run_id: number;
    final_prompt: string;
    final_score?: number;
    total_cost: number;
    total_iterations: number;
};

export interface Iteration {
    iteration: number;
    prompt: string;
    critique: string;
    score: number;
}