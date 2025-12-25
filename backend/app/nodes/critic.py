import json
from app.agents.state import AgentState
from app.agents.llm import get_openrouter_llm


async def critic_node(state: AgentState) -> AgentState:
    llm = get_openrouter_llm(state["critic_model"])

    prompt = f"""
You are an expert prompt critic with deep knowledge of prompt engineering best practices.

## Your Task
Evaluate the following prompt comprehensively and provide structured feedback.

## Prompt to Evaluate
{state["current_prompt"]}

## Evaluation Criteria
Score the prompt on a scale of 1-10 based on:

1. **Clarity (0-2 points)**: Is the prompt clear and unambiguous?
2. **Specificity (0-2 points)**: Does it include concrete details and requirements?
3. **Structure (0-2 points)**: Is it well-organized and easy to follow?
4. **Completeness (0-2 points)**: Does it provide sufficient context and constraints?
5. **Actionability (0-2 points)**: Can an LLM produce the desired output from this prompt?

## Scoring Guidelines
- 1-3: Poor - Major issues, unclear intent, missing critical information
- 4-5: Below Average - Several weaknesses, vague or incomplete
- 6-7: Good - Clear and functional, but room for improvement
- 8-9: Excellent - Well-crafted, specific, and comprehensive
- 10: Perfect - Exceptional prompt engineering, no improvements needed

## Feedback Requirements
- **Strengths**: Identify 2-4 specific things the prompt does well
- **Weaknesses**: Identify 2-4 specific areas that need improvement
- **Suggestions**: Provide 2-4 concrete, actionable suggestions for improvement

## Output Format
Return ONLY valid JSON. No markdown code blocks. No explanatory text.

JSON schema:
{{
  "score": number (1-10),
  "strengths": ["strength 1", "strength 2", ...],
  "weaknesses": ["weakness 1", "weakness 2", ...],
  "suggestions": ["suggestion 1", "suggestion 2", ...]
}}
"""

    response = await llm.ainvoke(prompt)
    raw = response.content.strip()

    try:
        critique = json.loads(raw)
    except Exception:
        # 🔥 Fail-safe (never crash the system)
        critique = {
            "score": 5,
            "strengths": [],
            "weaknesses": ["Critic returned invalid JSON"],
            "suggestions": [],
            "raw_output": raw,
        }

    state["critique"] = critique
    return state
