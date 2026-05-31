from app.agents.state import AgentState
from app.agents.llm import get_openrouter_llm
from app.agents.cost import accumulate

# The agentic leap: actually run the candidate prompt and observe real outputs.


async def tester_node(state: AgentState) -> AgentState:
    prompt = state["current_prompt"]
    model = state.get("test_model") or state.get("critic_model")
    test_inputs = state.get("test_inputs") or []
    llm = get_openrouter_llm(model, temperature=0.7, max_tokens=800)

    outputs = []
    if test_inputs:
        for ti in test_inputs:
            resp = await llm.ainvoke([("system", prompt), ("user", ti)])
            accumulate(state, resp, model)
            outputs.append({"input": ti, "output": resp.content})
    else:
        # No scenarios: run the prompt directly and observe what it produces.
        resp = await llm.ainvoke(prompt)
        accumulate(state, resp, model)
        outputs.append({"input": None, "output": resp.content})

    state["test_outputs"] = outputs
    return state
