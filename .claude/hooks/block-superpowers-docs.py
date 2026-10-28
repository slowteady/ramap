import json
import re
import sys

TARGET = 'docs/superpowers'
WRITE_TO_TARGET = re.compile(r'(>>?|\btee\b|\bmkdir\b|\bcp\b|\bmv\b|\btouch\b)[^|;&\n]*docs/superpowers')

try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(0)

tool = data.get('tool_name') or ''
inp = data.get('tool_input') or {}
blocked = False

if tool in ('Write', 'Edit', 'MultiEdit'):
    blocked = TARGET in (inp.get('file_path') or '')
elif tool == 'Bash':
    cmd = inp.get('command') or ''
    blocked = bool(WRITE_TO_TARGET.search(cmd))

if blocked:
    print(json.dumps({
        'hookSpecificOutput': {
            'hookEventName': 'PreToolUse',
            'permissionDecision': 'deny',
            'permissionDecisionReason': 'docs/superpowers/에는 문서를 만들지 않아요. 설계는 docs/modules/<모듈>/design.md에, 구현 계획은 이슈의 "구현 계획" 아티팩트에 남겨요. (.claude/rules/superpowers.md)'
        }
    }, ensure_ascii=False))
sys.exit(0)
