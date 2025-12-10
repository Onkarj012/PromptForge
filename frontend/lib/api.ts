import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Model definitions
export const AVAILABLE_MODELS = [
  // Claude Models
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    cost: '$3/1M tokens',
    strengths: ['Best for creation', 'Long context', 'Coding'],
    recommended: 'creator'
  },
  {
    id: 'anthropic/claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    cost: '$0.25/1M tokens',
    strengths: ['Fast', 'Cost-effective'],
    recommended: null
  },

  // OpenAI Models
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    cost: '$0.15/1M tokens',
    strengths: ['Best for critique', 'Fast', 'Affordable'],
    recommended: 'critic'
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    cost: '$2.50/1M tokens',
    strengths: ['High quality', 'Multimodal'],
    recommended: null
  },

  // Google Models
  {
    id: 'google/gemini-2.0-flash-exp:free',
    name: 'Gemini 2.0 Flash (Free)',
    provider: 'Google',
    cost: 'Free',
    strengths: ['Free tier', 'Fast', 'Good quality'],
    recommended: null
  },
  {
    id: 'google/gemini-pro-1.5',
    name: 'Gemini Pro 1.5',
    provider: 'Google',
    cost: '$1.25/1M tokens',
    strengths: ['Large context', 'Multimodal'],
    recommended: null
  },

  // DeepSeek Models
  {
    id: 'deepseek/deepseek-v3.2-speciale',
    name: 'DeepSeek 3.2',
    provider: 'DeepSeek',
    cost: '$0.14/1M tokens',
    strengths: ['Very fast', 'Great reasoning', 'Low cost'],
    recommended: 'critic' // DeepSeek is strong at logic-checking
  },
  {
    id: 'deepseek/deepseek-v3.1-terminus:exacto',
    name: 'DeepSeek 3.1',
    provider: 'DeepSeek',
    cost: '$0.55/1M tokens',
    strengths: ['Chain-of-thought reasoning', 'Mathematical tasks', 'Analysis'],
    recommended: null
  },
  {
    id: 'deepseek/deepseek-r1-0528',
    name: 'DeepSeek Reasoning',
    provider: 'DeepSeek',
    cost: '$0.20/1M tokens',
    strengths: ['Coding', 'Debugging', 'Fast code generation'],
    recommended: 'creator' // good for generating structured content
  }
];

// Type definitions
export interface PromptRequest {
  user_input: string;
  domain?: string;
  mode: 'auto' | 'manual';
  creator_model?: string;
  critic_model?: string;
  max_iterations: number;
}

export interface CriticFeedback {
  score: number;
  strengths: string[];
  issues: string[];
  suggestions: string[];
}

export interface RefinementIteration {
  iteration: number;
  prompt: string;
  critic_feedback: CriticFeedback;
  timestamp: string;
}

export interface RefinementResponse {
  original_input: string;
  final_prompt: string;
  iterations: RefinementIteration[];
  total_iterations: number;
  final_score: number;
  creator_model_used: string;
  critic_model_used: string;
  total_cost: number;
  metadata: Record<string, unknown>;
}

// API functions
export const refinePrompt = async (request: PromptRequest): Promise<RefinementResponse> => {
  const response = await api.post<RefinementResponse>('/refine/', request);
  return response.data;
};

export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};