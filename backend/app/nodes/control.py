from app.agents.state import AgentState


async def control_node(state: AgentState) -> AgentState:
    current_iteration = state.get("iteration", 0) + 1
    critique = state.get("critique") or {}
    score = critique.get("score")

    history = list(state.get("history", []))
    history.append(
        {
            "iteration": current_iteration,
            "prompt": state.get("current_prompt", ""),
            "critique": critique,
            "score": score,
        }
    )

    return {
        **state,
        "iteration": current_iteration,
        "history": history,
        "final_score": score,
    }


def should_continue(state: AgentState) -> str:
    iteration = state.get("iteration", 0)
    max_iterations = state.get("max_iterations", 0)

    if iteration >= max_iterations:
        return "end"
    return "creator"
