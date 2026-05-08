const fs = require('fs');

function extractBody(filepath, outpath, title) {
    const content = fs.readFileSync(filepath, 'utf8');
    let startIdx = content.indexOf('<section');
    if (startIdx === -1) {
        startIdx = content.indexOf('<div id="reading-progress"></div>');
        if (startIdx !== -1) startIdx += 33;
    }
    let endIdx = content.indexOf('<div id="dynamic-footer">');
    if (endIdx === -1) endIdx = content.indexOf('<footer');
    if (startIdx === -1 || endIdx === -1) return console.log('Failed to find boundaries for ' + filepath);
    
    let body = content.substring(startIdx, endIdx).trim();
    body = body.replace('<div id="dynamic-navbar"></div>', '');
    
    let script = '';
    const scriptIdx = content.indexOf('<script>');
    if (scriptIdx !== -1) {
        const endScript = content.indexOf('</script>', scriptIdx);
        if (endScript !== -1) {
            script = content.substring(scriptIdx, endScript + 9).replace('<script>', '<script is:inline>');
        }
    }
    
    const astro = ---
import Layout from '../layouts/Layout.astro';
---
<Layout title=" + title + ">
   + body + 
  
   + script + 
</Layout>;

    fs.writeFileSync(outpath, astro, 'utf8');
    console.log('Created ' + outpath);
}

extractBody('pages/about.html', 'src/pages/about.astro', 'Sobre mí | Marketing Cloud Arcade');
extractBody('pages/catalog.html', 'src/pages/catalog.astro', 'Catálogo | Marketing Cloud Arcade');
