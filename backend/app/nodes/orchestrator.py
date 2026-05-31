from app.agents.state import AgentState
from app.agents.llm import get_openrouter_llm
from app.agents.cost import accumulate
from app.agents.parsing import extract_json

DEFAULT_BUDGET = {"max_steps": 6, "max_tokens": 200_000, "max_cost": 1.0}


def _record(state: AgentState, action: str, reason: str, focus=None, confidence=None):
    decisions = list(state.get("decisions", []))
    decisions.append({
        "step": state.get("steps_used", 0),
        "action": action,
        "reason": reason,
        "focus": focus,
        "confidence": confidence,
    })
    state["decisions"] = decisions


def _over_budget(state: AgentState) -> str | None:
    b = {**DEFAULT_BUDGET, **(state.get("budget") or {})}
    usage = state.get("usage", {})
    cost = usage.get("cost", 0.0)
    tokens = usage.get("input_tokens", 0) + usage.get("output_tokens", 0)
    if state.get("steps_used", 0) > b["max_steps"]:
        return f"step budget reached ({b['max_steps']})"
    if cost > b["max_cost"]:
        return f"cost budget reached (${b['max_cost']})"
    if tokens > b["max_tokens"]:
        return f"token budget reached ({b['max_tokens']})"
    return None


def _bounded_decision(state: AgentState) -> dict:
    """Deterministic, rule-based decision (no LLM)."""
    crit = state.get("critique") or {}
    score = crit.get("score") or 0
    ar = state.get("assertion_results") or {}
    asserts_ok = ar.get("pass_rate", 1.0) >= 1.0
    it = state.get("iteration", 0)
    maxit = state.get("max_iterations", 3)
    if (score >= 9 and asserts_ok) or it >= maxit:
        reason = "quality bar met" if score >= 9 and asserts_ok else "max iterations reached"
        return {"action": "finish", "reason": reason, "focus": None}
    weak = "; ".join((crit.get("weaknesses") or [])[:3])
    failed = ar.get("total", 0) - ar.get("passed", 0)
    focus = (f"Fix the {failed} failed assertion(s). " if failed else "") + (f"Address: {weak}" if weak else "Tighten clarity, structure, and constraints.")
    return {"action": "refine", "reason": focus[:140], "focus": focus}


async def _auto_decision(state: AgentState, model: str) -> dict:
    crit = state.get("critique") or {}
    ar = state.get("assertion_results") or {}
    prompt = (
        "You are the orchestrator of a prompt-engineering agent. Decide the next action.\n"
        "Choose 'refine' only if another pass will meaningfully improve the prompt; choose 'finish' "
        "when it is excellent and deterministic checks pass, or further iteration won't help.\n"
        'Return ONLY JSON: {"action": "refine"|"finish", "focus": "<what to improve next, if refine>", '
        '"reason": "<short>", "confidence": <0-1>}\n\n'
        f"Latest score: {crit.get('score')}/10\n"
        f"Strengths: {crit.get('strengths')}\nWeaknesses: {crit.get('weaknesses')}\n"
        f"Assertions: {ar.get('passed', 0)}/{ar.get('total', 0)} passed\n"
        f"Iteration: {state.get('iteration', 0)} / max {state.get('max_iterations', 3)}\n"
        f"Current prompt:\n{(state.get('current_prompt') or '')[:2000]}"
    )
    try:
        resp = await get_openrouter_llm(model, temperature=0).ainvoke(prompt)
        accumulate(state, resp, model)
        d = extract_json(resp.content)
        if isinstance(d, dict) and d.get("action") in ("refine", "finish"):
            return d
    except Exception:
        pass
    return _bounded_decision(state)


async def orchestrator_node(state: AgentState) -> AgentState:
    state["steps_used"] = state.get("steps_used", 0) + 1
    mode = state.get("autonomy") or "auto"
    gated = bool(state.get("gated"))

    # Resume of a previously gated action.
    if state.get("resume_approved") and state.get("pending_action"):
        act = state["pending_action"]
        state["pending_action"] = None
        state["resume_approved"] = False
        state["awaiting_approval"] = False
        state["next_action"] = act
        if act == "finish":
            state["termination_reason"] = "approved by user"
        _record(state, act, "resumed after approval")
        return state

    # Budget guard.
    over = _over_budget(state)
    if over:
        state["next_action"] = "finish"
        state["termination_reason"] = over
        _record(state, "finish", over)
        return state

    # First step: produce an initial draft.
    if not state.get("history"):
        state["next_action"] = "refine"
        _record(state, "refine", "initial draft")
        return state

    # Decide.
    decision = _bounded_decision(state) if mode == "bounded" else await _auto_decision(state, state.get("orchestrator_model") or "openai/gpt-4o-mini")
    action = decision.get("action", "finish")
    state["focus"] = decision.get("focus")
    if action == "refine" and decision.get("focus"):
        state["steer"] = decision["focus"]  # creator injects this as the next-draft directive

    # Human gate (pause for approval) unless fully autonomous.
    if gated and mode != "totally_auto":
        state["pending_action"] = action
        state["awaiting_approval"] = True
        state["next_action"] = "gate"
        _record(state, "gate", f"awaiting approval to {action}: {decision.get('reason', '')}", decision.get("focus"), decision.get("confidence"))
        return state

    state["next_action"] = action
    if action == "finish":
        state["termination_reason"] = decision.get("reason", "quality bar met")
    _record(state, action, decision.get("reason", ""), decision.get("focus"), decision.get("confidence"))
    return state


def route_action(state: AgentState) -> str:
    return "creator" if state.get("next_action") == "refine" else "end"
