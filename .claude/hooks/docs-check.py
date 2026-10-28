import json
import os
import pathlib
import re
import subprocess
import sys
import urllib.parse

STATUSES = {'초안', '유효', '대체됨'}
LINK = re.compile(r'\]\((<[^>]+>|(?:[^()\s]|\([^()]*\))+)\)')


def changed_docs(root):
    out = subprocess.run(
        ['git', '-C', str(root), '-c', 'core.quotepath=false', 'status', '--porcelain', '-uall', '--', 'docs'],
        capture_output=True, text=True
    ).stdout
    files = []
    for line in out.splitlines():
        path = line[3:].split(' -> ')[-1].strip().strip('"')
        p = root / path
        if line[:2].strip() != 'D' and p.suffix == '.md' and p.exists():
            files.append(p)
    return files


def kind(rel):
    parts = rel.parts
    if parts[:2] in (('docs', 'research'), ('docs', 'decisions')) and len(parts) == 3:
        return 'record', root / 'docs/README.md'
    if len(parts) >= 4 and parts[:2] == ('docs', 'modules'):
        index = root / 'docs/modules' / parts[2] / 'README.md'
        if len(parts) == 4 and parts[3] in ('requirements.md', 'design.md'):
            return 'spec', index
        if len(parts) == 5 and parts[3] in ('decisions', 'research'):
            return 'record', index
    return None, None


def frontmatter_status(text):
    if not text.startswith('---\n'):
        return None
    end = text.find('\n---', 4)
    if end < 0:
        return None
    m = re.search(r'^status:\s*(\S+)', text[4:end], re.M)
    return m.group(1) if m else None


def broken_links(p, text):
    bad = []
    for m in LINK.finditer(text):
        u = m.group(1).strip('<>')
        if re.match(r'^[a-z]+:|^#', u):
            continue
        path = urllib.parse.unquote(u.split('#')[0])
        if path and re.search(r'[./]', path) and not (p.parent / path).exists():
            bad.append(u)
    return bad


try:
    data = json.load(sys.stdin)
except Exception:
    data = {}
if data.get('stop_hook_active'):
    sys.exit(0)

root = pathlib.Path(os.environ.get('CLAUDE_PROJECT_DIR') or data.get('cwd') or '.')
problems = []
for p in changed_docs(root):
    rel = p.relative_to(root)
    text = p.read_text(encoding='utf-8')
    k, index = kind(rel)
    if k:
        st = frontmatter_status(text)
        if st not in STATUSES:
            problems.append(f'{rel}: frontmatter status가 없거나 잘못됨 (초안 / 유효 / 대체됨)')
        if index and index.exists() and p != index:
            idx = index.read_text(encoding='utf-8')
            names = {p.name, p.stem, p.name.replace(' ', '%20'), urllib.parse.quote(p.name)}
            if not any(n in idx for n in names):
                problems.append(f'{rel}: 색인 {index.relative_to(root)}에 없음')
    for u in broken_links(p, text):
        problems.append(f'{rel}: 깨진 링크 {u}')

if problems:
    print('문서 규칙 위반이 있어요. 고친 뒤 끝내세요 (.claude/rules/docs.md):\n- ' + '\n- '.join(problems), file=sys.stderr)
    sys.exit(2)
sys.exit(0)
