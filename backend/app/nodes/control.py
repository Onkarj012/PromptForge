from app.agents.state import AgentState

SCORE_THRESHOLD = 9  # stop early once the prompt is excellent


async def control_node(state: AgentState) -> AgentState:
    current_iteration = state.get("iteration", 0) + 1
    critique = state.get("critique") or {}
    score = critique.get("score")

    iter_usage = state.get("iter_usage", {})
    iter_cost = round(iter_usage.get("cost", 0.0), 6)
    iter_tokens = iter_usage.get("input_tokens", 0) + iter_usage.get("output_tokens", 0)
    assertion_results = state.get("assertion_results") or {}

    history = list(state.get("history", []))
    history.append(
        {
            "iteration": current_iteration,
            "prompt": state.get("current_prompt", ""),
            "critique": critique,
            "score": score,
            "cost": iter_cost,
            "tokens": iter_tokens,
            "test_outputs": state.get("test_outputs", []),
            "assertions": assertion_results,
        }
    )

    return {
        **state,
        "iteration": current_iteration,
        "history": history,
        "final_score": score,
        "iter_usage": {"input_tokens": 0, "output_tokens": 0, "cost": 0.0},
    }


def should_continue(state: AgentState) -> str:
    iteration = state.get("iteration", 0)
    max_iterations = state.get("max_iterations", 0)
    score = (state.get("critique") or {}).get("score") or 0
    assertions_pass = (state.get("assertion_results") or {}).get("pass_rate", 1.0) >= 1.0

    if iteration >= max_iterations:
        return "end"
    # Stop early only when it's excellent AND all deterministic checks pass.
    if score >= SCORE_THRESHOLD and assertions_pass:
        return "end"
    return "creator"
