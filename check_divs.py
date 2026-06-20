with open('replace_researcher.py', 'r', encoding='utf-8') as f:
    text = f.read()
    start = text.find('\"\"\"') + 3
    end = text.rfind('\"\"\"')
    html = text[start:end]
    div_open = html.count('<div')
    div_close = html.count('</div>')
    sec_open = html.count('<section')
    sec_close = html.count('</section>')
    print(f'div open: {div_open}, div close: {div_close}')
    print(f'section open: {sec_open}, section close: {sec_close}')
