import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ModelSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  label: string;
}

const MODELS = [
  // OpenAI – Latest GPT Models
  { value: "openai:gpt-4o", label: "GPT-4o" },
  { value: "openai:gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "openai:chatgpt-5.1", label: "GPT-5.1" },
  { value: "openai:gpt-5.2", label: "GPT-5.2" },
  { value: "openai:gpt-5-mini", label: "GPT-5 Mini" },
  { value: "openai/gpt-oss-20b", label: "GPT-OSS-20B" },

  // Anthropic – Claude Family
  { value: "anthropic:claude-opus-4.5", label: "Claude Opus 4.5" },
  { value: "anthropic:claude-sonnet-4.5", label: "Claude Sonnet 4.5" },
  { value: "anthropic:claude-haiku-4.5", label: "Claude Haiku 4.5" },

  // Google – Gemini Series
  { value: "google:gemini-3-pro-preview", label: "Gemini 3 Pro (Preview)" },
  { value: "google/gemini-3-flash-preview", label: "Gemini 3 Flash (Preview)" },
  { value: "google:gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { value: "google:gemini-2.5-flash", label: "Gemini 2.5 Flash" },

  // DeepSeek Models (OpenRouter)
  { value: "deepseek/deepseek-r1", label: "DeepSeek R1" },
  { value: "deepseek/deepseek-v3.2", label: "DeepSeek V3.2" },
  { value: "deepseek/deepseek-v3.1-terminus", label: "DeepSeek V3.1 Terminus" },

  // Moonshot AI – Kimi K2 Family
  { value: "moonshotai/kimi-k2", label: "Kimi K2 Instruct" },
  { value: "moonshotai/kimi-k2-thinking", label: "Kimi K2 Thinking" },

  // Other Useful Third-Party Models (Optional)
  // e.g., LLAMA / Misc Open Models
  { value: "z-ai/glm-4.7", label: "GLM 4.7" },
  { value: "meta-llama/llama-4-maverick", label: "LLaMA 4 Maverick" },
];

export function ModelSelector({
  value,
  onValueChange,
  label,
}: ModelSelectorProps) {
  return (
    <div>
      <Label>{label}</Label>
      <Select value={value} onValueChange={(val) => val && onValueChange(val)}>
        <SelectTrigger className="mt-2 text-left">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MODELS.map((model) => (
            <SelectItem key={model.value} value={model.value}>
              {model.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
