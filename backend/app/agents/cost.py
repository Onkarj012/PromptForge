"""Token usage extraction + rough cost estimation.

Costs are estimates from a small static price table (USD per 1M tokens);
real per-generation pricing would require an extra OpenRouter lookup.
"""

# (input_per_1M, output_per_1M) USD — matched by substring on the model id.
_PRICES = {
    "gpt-4o-mini": (0.15, 0.60),
    "gpt-4o": (2.5, 10.0),
    "gpt-4.1": (2.0, 8.0),
    "gpt-4": (30.0, 60.0),
    "o1": (15.0, 60.0),
    "claude-3.5-sonnet": (3.0, 15.0),
    "claude-3-opus": (15.0, 75.0),
    "claude-3.5-haiku": (0.8, 4.0),
    "claude-3-haiku": (0.25, 1.25),
    "gemini": (0.5, 1.5),
    "llama": (0.2, 0.3),
    "mistral": (0.3, 0.9),
}
_DEFAULT = (1.0, 3.0)


def _rate(model: str):
    m = (model or "").lower()
    for key, rate in _PRICES.items():
        if key in m:
            return rate
    return _DEFAULT


def estimate_cost(model: str, input_tokens: int, output_tokens: int) -> float:
    pin, pout = _rate(model)
    return (input_tokens * pin + output_tokens * pout) / 1_000_000


def extract_usage(response) -> tuple[int, int]:
    """Return (input_tokens, output_tokens) from a LangChain AIMessage."""
    um = getattr(response, "usage_metadata", None) or {}
    if um:
        return int(um.get("input_tokens", 0)), int(um.get("output_tokens", 0))
    meta = getattr(response, "response_metadata", {}) or {}
    tu = meta.get("token_usage") or meta.get("usage") or {}
    return int(tu.get("prompt_tokens", 0)), int(tu.get("completion_tokens", 0))


def accumulate(state: dict, response, model: str) -> None:
    """Add a response's tokens/cost to the run-total and per-iteration buckets."""
    inp, out = extract_usage(response)
    cost = estimate_cost(model, inp, out)
    for bucket in ("usage", "iter_usage"):
        b = state.setdefault(bucket, {"input_tokens": 0, "output_tokens": 0, "cost": 0.0})
        b["input_tokens"] += inp
        b["output_tokens"] += out
        b["cost"] += cost
