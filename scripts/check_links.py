import io
import os
import re
import sys

link_re = re.compile(r'\[[^\]]*\]\(([^)]+)\)')
bad = []
checked = 0

for dirpath, dirnames, filenames in os.walk('.'):
    norm = dirpath.replace(os.sep, '/')
    skip = False
    for seg in norm.split('/'):
        if seg in ('.git', 'archive', '.venv', 'output', '.idea', 'out', '.audit-work'):
            skip = True
    if skip:
        dirnames[:] = []
        continue
    for fn in filenames:
        if not fn.endswith('.md'):
            continue
        p = os.path.join(dirpath, fn)
        try:
            text = io.open(p, encoding='utf-8').read()
        except Exception as e:
            bad.append((p, 'READ FAIL %s' % e))
            continue
        for m in link_re.finditer(text):
            target = m.group(1).strip()
            if target.startswith(('http://', 'https://', '#', 'mailto:')):
                continue
            filepart = target.split('#')[0]
            if not filepart:
                continue
            full = os.path.normpath(os.path.join(dirpath, filepart))
            checked += 1
            if not os.path.exists(full):
                bad.append((p, target))

print('checked links:', checked)
if bad:
    print('BROKEN:')
    for p, t in bad:
        print('  %s -> %s' % (p, t))
    sys.exit(1)
print('ALL LINKS OK')
