import json
import re


def extract_json(text: str):
    """Best-effort JSON extraction from an LLM response (handles ``` fences / prose)."""
    if not text:
        return None
    t = text.strip()
    t = re.sub(r"```(?:json)?", "", t).strip().strip("`").strip()
    try:
        return json.loads(t)
    except Exception:
        pass
    m = re.search(r"\{.*\}", t, re.DOTALL)
    if m:
        try:
            return json.loads(m.group(0))
        except Exception:
            return None
    return None
