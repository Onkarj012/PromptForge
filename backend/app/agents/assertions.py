import json
import re

# Deterministic, code-only checks the agent runs against observed outputs.
# An assertion is {"type": ..., "value": ...}.


def _check(a: dict, output: str) -> bool:
    t = a.get("type")
    v = a.get("value", "")
    o = output or ""
    if t == "contains":
        return str(v).lower() in o.lower()
    if t == "not_contains":
        return str(v).lower() not in o.lower()
    if t == "regex":
        try:
            return re.search(str(v), o) is not None
        except re.error:
            return False
    if t == "json":
        try:
            json.loads(o.strip().strip("`").strip())
            return True
        except Exception:
            return False
    if t == "max_len":
        return len(o) <= int(v)
    if t == "min_len":
        return len(o) >= int(v)
    return True


def run_assertions(outputs: list[str], assertions: list[dict]) -> dict:
    if not assertions:
        return {"total": 0, "passed": 0, "pass_rate": 1.0, "results": []}
    results = []
    passed = 0
    for o in outputs:
        for a in assertions:
            ok = _check(a, o)
            passed += 1 if ok else 0
            results.append({"assertion": a, "passed": ok})
    total = len(results)
    return {"total": total, "passed": passed, "pass_rate": passed / total if total else 1.0, "results": results}
