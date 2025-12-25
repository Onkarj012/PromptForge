from app.agents.state import AgentState
from app.agents.llm import get_openrouter_llm


async def creator_node(state: AgentState) -> AgentState:
    llm = get_openrouter_llm(state["creator_model"])

    prompt = f"""
You are an expert prompt engineer specializing in creating clear, effective, and well-structured prompts for large language models.

## Your Task
Refine and improve the following prompt based on the critique provided.

## Original Prompt
{state["original_prompt"]}

## Previous Critique
{state.get("critique") if state.get("critique") else "This is the first iteration - focus on clarity, specificity, and structure."}

## Prompt Engineering Principles
1. **Clarity**: Use precise, unambiguous language
2. **Specificity**: Include concrete details, constraints, and requirements
3. **Structure**: Organize information logically with clear sections if needed
4. **Context**: Provide necessary background information
5. **Output Format**: Specify the desired format, length, and style
6. **Examples**: Include examples when they add clarity (if appropriate)
7. **Constraints**: Define boundaries, limitations, or requirements

## Instructions
- Address ALL weaknesses mentioned in the critique
- Preserve the strengths that were identified
- Implement the suggestions provided
- Ensure the improved prompt is self-contained and clear
- Make the prompt actionable and specific

## Output
Return ONLY the improved prompt text. No explanations, no meta-commentary, no markdown formatting.
"""

    response = await llm.ainvoke(prompt)

    state["current_prompt"] = response.content
    return state
