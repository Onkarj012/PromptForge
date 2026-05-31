"""Tool-specific formatting guides and project-type templates.

Injected into the creator prompt so the refined output is shaped for the
target coding tool and project type the user is building for.
"""

TOOL_GUIDES = {
    "cursor": (
        "Target tool: **Cursor** (AI coding agent operating inside a real repo).\n"
        "- Open with a one-line objective, then the tech stack.\n"
        "- Give an ordered, incremental implementation plan the agent can follow step by step.\n"
        "- Specify the file/folder structure to create or modify.\n"
        "- End with explicit constraints and verifiable acceptance criteria.\n"
        "- Assume the agent can read/edit files and run commands; tell it to work incrementally and verify."
    ),
    "bolt": (
        "Target tool: **Bolt.new** (builds a complete full-stack app in-browser from one prompt).\n"
        "- Describe the entire app in a single self-contained brief.\n"
        "- List every page/route, the data model, and key features.\n"
        "- Name the exact stack and any third-party integrations.\n"
        "- Be explicit about UI layout since Bolt scaffolds the whole project at once."
    ),
    "v0": (
        "Target tool: **v0** (Vercel UI/component generator: React + Tailwind + shadcn/ui).\n"
        "- Focus on the visual design, layout, and component breakdown.\n"
        "- Describe states (loading, empty, error), responsiveness, and interactions.\n"
        "- Specify props/variants for reusable components.\n"
        "- Keep it UI-centric; avoid backend logic unless asked."
    ),
    "claude": (
        "Target tool: **Claude / GPT chat** (conversational LLM).\n"
        "- Open by assigning a clear role and expertise.\n"
        "- Provide context, then the task, then the exact output format.\n"
        "- Use numbered requirements and, where helpful, a short example."
    ),
    "generic": (
        "Target tool: **Generic API/LLM**.\n"
        "- Produce a clear, self-contained, tool-agnostic prompt.\n"
        "- Use labeled sections: Objective, Context, Requirements, Constraints, Output Format."
    ),
}

PROJECT_TEMPLATES = {
    "saas": "Project type: SaaS app. Cover auth, billing/subscriptions, a dashboard, the data model, and deployment.",
    "api": "Project type: API/backend service. Cover endpoints, request/response schemas, auth, validation, and error handling.",
    "landing_page": "Project type: Landing page. Cover hero, value prop, sections, responsive layout, and a clear primary CTA.",
    "cli": "Project type: CLI tool. Cover commands, flags/arguments, config, output format, and error handling.",
    "mobile_app": "Project type: Mobile app. Cover screens, navigation, state management, and platform conventions.",
}


def build_context_block(state) -> str:
    """Build the tool/project/stack context section for the creator prompt."""
    parts = []

    project_type = state.get("project_type")
    if project_type and project_type in PROJECT_TEMPLATES:
        parts.append(f"## Project Context\n{PROJECT_TEMPLATES[project_type]}")

    stack = state.get("stack")
    if stack:
        parts.append(
            f"## Tech Stack\nTarget stack: {stack}. Use its idioms, conventions, and best practices."
        )

    tool = state.get("target_tool") or "generic"
    parts.append(f"## Output Formatting\n{TOOL_GUIDES.get(tool, TOOL_GUIDES['generic'])}")

    return "\n\n".join(parts)
