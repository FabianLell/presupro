import pathlib
import re
code = pathlib.Path('src/components/Precarga.jsx').read_text(encoding='utf-8')
# Remove JS strings and comments in multiple passes to avoid false positives.
code = re.sub(r'//.*?$', lambda m: ' ' * len(m.group(0)), code, flags=re.MULTILINE)
code = re.sub(r'/\*.*?\*/', lambda m: ' ' * len(m.group(0)), code, flags=re.DOTALL)
code = re.sub(r'"(?:\\.|[^"\\])*"', lambda m: ' ' * len(m.group(0)), code)
code = re.sub(r"'(?:\\.|[^'\\])*'", lambda m: ' ' * len(m.group(0)), code)
code = re.sub(r'`(?:\\.|[^\\`])*`', lambda m: ' ' * len(m.group(0)), code)
# Find all JSX tags in crude manner.
tags = list(re.finditer(r'<(/?)([A-Za-z][A-Za-z0-9]*)[^>]*?(\/?)>', code))
stack = []
for m in tags:
    closing, name, selfclose = m.groups()
    if selfclose == '/' or name.lower() in ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']:
        continue
    if closing == '':
        stack.append((name, m.start()))
    else:
        for i in range(len(stack)-1, -1, -1):
            if stack[i][0] == name:
                stack.pop(i)
                break
        else:
            print('unmatched close', name, 'at', m.start())
            break
print('remaining stack len', len(stack))
print('remaining stack', stack[:10])
