import pathlib
code = pathlib.Path('src/components/Precarga.jsx').read_text(encoding='utf-8')
line = 1
state = 'normal'
stack = []
prev = ''
first_error = None
pairs = {')':'(', ']':'[', '}':'{'}

i = 0
while i < len(code):
    ch = code[i]
    nxt = code[i+1] if i+1 < len(code) else ''
    if ch == '\n':
        line += 1
        if state == 'singleLineComment':
            state = 'normal'
    if state == 'normal':
        if ch == '/' and nxt == '/':
            state = 'singleLineComment'
            i += 2
            prev = ch
            continue
        if ch == '/' and nxt == '*':
            state = 'multiLineComment'
            i += 2
            prev = ch
            continue
        if ch == '"':
            state = 'doubleQuote'
            i += 1
            prev = ch
            continue
        if ch == "'":
            state = 'singleQuote'
            i += 1
            prev = ch
            continue
        if ch == '`':
            state = 'templateString'
            i += 1
            prev = ch
            continue
        if ch in '([{':
            stack.append((ch, line))
        elif ch in ')]}':
            top = stack.pop() if stack else None
            if not top or top[0] != pairs[ch]:
                first_error = (line, ch, top[0] if top else None)
                break
    elif state == 'doubleQuote':
        if ch == '"' and prev != '\\':
            state = 'normal'
    elif state == 'singleQuote':
        if ch == "'" and prev != '\\':
            state = 'normal'
    elif state == 'templateString':
        if ch == '`' and prev != '\\':
            state = 'normal'
    elif state == 'multiLineComment':
        if ch == '*' and nxt == '/':
            state = 'normal'
            i += 1
    prev = ch
    i += 1

print('first_error', first_error)
print('stack_tail', stack[-10:])
print('stack_len', len(stack))
print('state', state)
