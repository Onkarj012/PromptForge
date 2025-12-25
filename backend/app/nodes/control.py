from app.agents.state import AgentState


async def control_node(state: AgentState) -> AgentState:
    current_iteration = state.get("iteration", 0)

    return {
        **state,
        "iteration": current_iteration + 1,
    }


def should_continue(state: AgentState) -> str:
    iteration = state.get("iteration", 0)
    max_iterations = state.get("max_iterations", 0)

    if iteration >= max_iterations:
        return "end"
    return "creator"
