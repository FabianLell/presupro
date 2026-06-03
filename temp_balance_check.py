from pathlib import Path
text = Path('src/components/Precarga.jsx').read_text(encoding='utf-8')
clean = []
state = 'code'
escape = False
prev = ''
for ch in text:
    if state == 'code':
        if ch == '"':
            state = 'dq'
            clean.append(' ')
        elif ch == "'":
            state = 'sq'
            clean.append(' ')
        elif ch == '`':
            state = 'bt'
            clean.append(' ')
        elif ch == '/':
            state = 'slash'
            clean.append(ch)
        else:
            clean.append(ch)
    elif state == 'slash':
        if ch == '/':
            state = 'line_comment'
            clean.append(' ')
        elif ch == '*':
            state = 'block_comment'
            clean.append(' ')
        else:
            clean.append(ch)
            state = 'code'
    elif state == 'line_comment':
        clean.append(' ')
        if ch == '\n':
            state = 'code'
            clean[-1] = ch
    elif state == 'block_comment':
        clean.append(' ')
        if prev == '*' and ch == '/':
            state = 'code'
    elif state == 'dq':
        clean.append(' ')
        if escape:
            escape = False
        elif ch == '\\':
            escape = True
        elif ch == '"':
            state = 'code'
    elif state == 'sq':
        clean.append(' ')
        if escape:
            escape = False
        elif ch == '\\':
            escape = True
        elif ch == "'":
            state = 'code'
    elif state == 'bt':
        clean.append(' ')
        if escape:
            escape = False
        elif ch == '\\':
            escape = True
        elif ch == '`':
            state = 'code'
    prev = ch

text2 = ''.join(clean)
for kind, open_ch, close_ch in [('BRACE', '{', '}'), ('PAREN', '(', ')'), ('BRACKET', '[', ']')]:
    stack = []
    for idx, ch in enumerate(text2, start=1):
        if ch == open_ch:
            stack.append(idx)
        elif ch == close_ch:
            if stack:
                stack.pop()
            else:
                line = text.count('\n', 0, idx) + 1
                print(f'UNMATCHED_CLOSING_{kind} line={line} pos={idx}')
                break
    else:
        if stack:
            pos = stack[-1]
            line = text.count('\n', 0, pos) + 1
            print(f'UNMATCHED_OPENING_{kind} line={line} pos={pos}')
        else:
            print(f'{kind}_BALANCED')
