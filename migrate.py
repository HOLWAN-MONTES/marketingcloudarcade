import sys

def extract_body(filepath, output_astro_path, title):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find start
        start_idx = content.find('<section')
        if start_idx == -1:
            start_idx = content.find('<div id="reading-progress"></div>')
            if start_idx != -1:
                start_idx += len('<div id="reading-progress"></div>')
        
        # Find end
        end_idx = content.find('<div id="dynamic-footer">')
        if end_idx == -1:
            end_idx = content.find('<footer')
        
        if start_idx == -1 or end_idx == -1:
            print(f"Could not find boundaries for {filepath}")
            return
            
        body = content[start_idx:end_idx].strip()
        
        # Remove dynamic-navbar if exists
        nav_str = '<div id="dynamic-navbar"></div>'
        if nav_str in body:
            body = body.replace(nav_str, '')
            
        script_idx = content.find('<script>')
        script_end_idx = content.find('</script>', script_idx)
        script = ""
        if script_idx != -1 and script_end_idx != -1:
            script = content[script_idx:script_end_idx+9]
            # Replace <script> with <script is:inline>
            script = script.replace('<script>', '<script is:inline>')
            
        astro_content = f\"\"\"---
import Layout from '../layouts/Layout.astro';
---
<Layout title="{title}">
  {body}
  
  {script}
</Layout>
\"\"\"
        with open(output_astro_path, 'w', encoding='utf-8') as f:
            f.write(astro_content)
        print(f"Successfully created {output_astro_path}")
    except Exception as e:
        print(f"Error: {e}")

extract_body('pages/about.html', 'src/pages/about.astro', 'Sobre mí | Marketing Cloud Arcade')
extract_body('pages/catalog.html', 'src/pages/catalog.astro', 'Catálogo | Marketing Cloud Arcade')
