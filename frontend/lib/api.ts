import { RefineRequest, RefineResponse } from "./types";

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE

export async function refinePrompt(
    payload: RefineRequest
): Promise<RefineResponse> {
    const res = await fetch(`${API_BASE}/api/v1/prompt/refine`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    })

    if(!res.ok) {
        const text = await res.text()
        throw new Error(text || "Failed to refine prompt")
    }
    return res.json()
}
