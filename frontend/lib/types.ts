export type RefineRequest = {
    prompt: string
    iterations: number
    mode: 'user_defined' | "auto"
    creator_model: string
    critic_model: string
}

export type RefineResponse = {
    run_id: number
    final_prompt: string
    iterations?: number
}