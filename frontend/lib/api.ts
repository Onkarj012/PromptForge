import {
  RefineRequest,
  RefineResponse,
  BenchRequest,
  BenchResponse,
  RunSummary,
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

export const listRuns = () => get<RunSummary[]>("/prompt/runs");

export const getRun = (id: string) =>
  get<RunSummary & { final_prompt?: string; iterations_detail?: unknown[] }>(
    `/prompt/runs/${id}`,
  );
