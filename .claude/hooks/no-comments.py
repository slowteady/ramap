import json
import os
import re
import sys

CODE_EXT = ('.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.prisma')
LINE_COMMENT = re.compile(r'^\s*//')
BLOCK_OPEN = re.compile(r'^\s*/\*')
BLOCK_BODY = re.compile(r'^\s*\*(\s|/|$)')
INLINE = re.compile(r'\S\s+//\s')
DIRECTIVE = re.compile(r'eslint-disable|@ts-ignore|@ts-expect-error|@ts-nocheck')
HEREDOC = re.compile(r"<<-?\s*'?\"?([A-Za-z_][A-Za-z0-9_]*)'?\"?[^\n]*\n(.*?)\n\1(?:\n|$)", re.S)
PATH_IN_CMD = re.compile(r'[\w./-]+\.(?:tsx?|jsx?|mjs|cjs|prisma)\b')


def is_comment(line):
    if '://' in line and not LINE_COMMENT.match(line):
        return bool(DIRECTIVE.search(line))
    return bool(
        LINE_COMMENT.match(line)
        or BLOCK_OPEN.match(line)
        or BLOCK_BODY.match(line)
        or INLINE.search(line)
        or DIRECTIVE.search(line)
    )


def new_comment_lines(new_text, old_text):
    old_lines = {ln.strip() for ln in old_text.splitlines()}
    return [ln.strip()[:100] for ln in new_text.splitlines() if is_comment(ln) and ln.strip() not in old_lines]


def deny(reason):
    print(json.dumps({
        'hookSpecificOutput': {
            'hookEventName': 'PreToolUse',
            'permissionDecision': 'deny',
            'permissionDecisionReason': reason
        }
    }, ensure_ascii=False))
    sys.exit(0)


def main():
    try:
        data = json.load(sys.stdin)
    except Exception:
        sys.exit(0)
    tool = data.get('tool_name') or ''
    inp = data.get('tool_input') or {}

    if tool in ('Edit', 'Write', 'MultiEdit'):
        path = inp.get('file_path') or ''
        if not path.endswith(CODE_EXT):
            sys.exit(0)
        if tool == 'Write':
            old = ''
            try:
                with open(path, encoding='utf-8') as f:
                    old = f.read()
            except Exception:
                pass
            found = new_comment_lines(inp.get('content') or '', old)
        elif tool == 'Edit':
            found = new_comment_lines(inp.get('new_string') or '', inp.get('old_string') or '')
        else:
            found = []
            for e in inp.get('edits') or []:
                found += new_comment_lines(e.get('new_string') or '', e.get('old_string') or '')
        if found:
            deny(f"이 레포는 코드 주석을 쓰지 않아요. {os.path.basename(path)}에 새 주석 {len(found)}줄: "
                 + ' | '.join(found[:3]) + ". 주석을 지우고 다시 쓰세요. 설명은 PR, 이슈, docs에 남겨요.")
        sys.exit(0)

    if tool == 'Bash':
        cmd = inp.get('command') or ''
        if not PATH_IN_CMD.search(cmd):
            sys.exit(0)
        found = []
        for m in HEREDOC.finditer(cmd):
            found += [ln.strip()[:100] for ln in m.group(2).splitlines() if is_comment(ln)]
        if found:
            deny(f"이 레포는 코드 주석을 쓰지 않아요. Bash로 코드 파일에 주석 {len(found)}줄을 쓰려고 했어요: "
                 + ' | '.join(found[:3]) + ". 주석을 지우고 다시 실행하세요.")
    sys.exit(0)


if __name__ == '__main__':
    main()
