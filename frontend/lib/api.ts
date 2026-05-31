import {
  RefineRequest,
  RefineResponse,
  BenchRequest,
  BenchResponse,
  RunSummary,
  StreamEvent,
  Baseline,
  ResumeRequest,
} from "./types";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

async function post<T>(path: string, payload: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}/api/v1${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.text()) || `Request failed: ${path}`);
  return res.json();
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}/api/v1${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error((await res.text()) || `Request failed: ${path}`);
  return res.json();
}

export const refinePrompt = (payload: RefineRequest) =>
  post<RefineResponse>("/prompt/refine", payload);

export const benchRun = (payload: BenchRequest) =>
  post<BenchResponse>("/bench/run", payload);

export const markBaseline = (runId: string) =>
  post<{ run_id: string; is_baseline: boolean }>(`/bench/runs/${runId}/baseline`, {});

export const listBaselines = () => get<Baseline[]>("/bench/baselines");

export const listRuns = () => get<RunSummary[]>("/prompt/runs");

export const getRun = (id: string) =>
  get<RunSummary & { final_prompt?: string; iterations_detail?: unknown[] }>(
    `/prompt/runs/${id}`,
  );

export async function streamRefine(
  payload: RefineRequest,
  onEvent: (e: StreamEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  return streamSSE("/prompt/refine/stream", payload, onEvent, signal);
}

export async function resumeRefine(
  payload: ResumeRequest,
  onEvent: (e: StreamEvent) => void,
): Promise<void> {
  return streamSSE("/prompt/refine/resume", payload, onEvent);
}

async function streamSSE(
  path: string,
  payload: unknown,
  onEvent: (e: StreamEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });
  if (!res.ok || !res.body) throw new Error((await res.text()) || "Stream failed");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const parts = buf.split("\n\n");
    buf = parts.pop() ?? "";
    for (const part of parts) {
      const line = part.trim();
      if (line.startsWith("data:")) {
        try {
          onEvent(JSON.parse(line.slice(5).trim()) as StreamEvent);
        } catch {
          /* ignore malformed keep-alive chunks */
        }
      }
    }
  }
}
