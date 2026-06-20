with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

auth_idx = html.find('<div id="auth-modal"')
researcher_idx = html.find('<!-- ============================================================\n       RESEARCHER PORTAL SECTIONS')

if auth_idx != -1 and researcher_idx != -1:
    modals = html[auth_idx:researcher_idx]
    
    # Remove modals from their current place
    new_html = html[:auth_idx] + html[researcher_idx:]
    
    # Insert before the closing body tag or bottom scripts
    script_idx = new_html.rfind('<script src="assets/js/data.js"></script>')
    if script_idx != -1:
        final_html = new_html[:script_idx] + "\n<!-- MODALS MOVED HERE -->\n" + modals + "\n" + new_html[script_idx:]
        with open('index.html', 'w', encoding='utf-8') as f:
            f.write(final_html)
        print("Successfully moved modals out of the portal-shell!")
    else:
        print("Could not find script_idx")
else:
    print("Could not find auth_idx or researcher_idx")
