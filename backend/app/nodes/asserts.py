from app.agents.state import AgentState
from app.agents.assertions import run_assertions


async def assertion_node(state: AgentState) -> AgentState:
    outputs = [o["output"] for o in state.get("test_outputs", [])]
    state["assertion_results"] = run_assertions(outputs, state.get("assertions") or [])
    return state
