import json, re, sys

d = json.load(sys.stdin)
tool = d.get("tool_name", "")
inp = d.get("tool_input", {}) or {}
blocked = False

if tool == "Bash":
    c = inp.get("command", "")
    if re.search(r"gh\s+issue\s+close", c) or (
        re.search(r"gh\s+api", c) and re.search(r"state['\"=:\s]+closed", c)
    ):
        blocked = True
elif re.fullmatch(r"mcp__.+__issue_write", tool) and inp.get("state") == "closed":
    blocked = True

if blocked:
    print("에이전트는 이슈를 닫을 수 없음. 이슈는 사람이 PR을 머지할 때 닫힌다.", file=sys.stderr)
    sys.exit(2)
