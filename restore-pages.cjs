const fs = require('fs');
const path = require('path');

const map = [
  { dist: 'dist/index.html', astro: 'src/pages/index.astro', title: 'Marketing Cloud Arcade' },
  { dist: 'dist/about/index.html', astro: 'src/pages/about.astro', title: 'Sobre m | Marketing Cloud Arcade' },
  { dist: 'dist/catalog/index.html', astro: 'src/pages/catalog.astro', title: 'Catlogo | Marketing Cloud Arcade' }
];

map.forEach(item => {
  if (!fs.existsSync(item.dist)) {
    console.log('Skipping ' + item.dist + ' (not found)');
    return;
  }
  
  let content = fs.readFileSync(item.dist, 'utf8');
  
  const startMarker = '<!-- ════════════════ CONTENT ════════════════ -->';
  const endMarker = '<!-- ════════════════ FOOTER ════════════════ -->';
  
  let startIdx = content.indexOf(startMarker);
  let endIdx = content.indexOf(endMarker);
  
  if (startIdx === -1 || endIdx === -1) {
    console.log('Markers not found in ' + item.dist);
    return;
  }
  
  startIdx += startMarker.length;
  
  let extracted = content.substring(startIdx, endIdx).trim();
  
  // Remove data-astro-cid attributes
  extracted = extracted.replace(/ data-astro-cid-[a-z0-9]+/g, '');
  
  // Also remove class="astro-j7pv25f6" etc if Astro added them on top level
  extracted = extracted.replace(/ class="astro-[a-z0-9]+"/g, '');
  
  // We need to restore the <style> block if it was in the <head>
  // Astro moves page-specific styles to <style> or <link>.
  // But wait, the original user project used inline or global styles! 
  // Let's just wrap it.
  
  const finalAstro = "---\nimport Layout from '../layouts/Layout.astro';\n---\n<Layout title=\"" + item.title + "\">\n" + extracted + "\n</Layout>\n";
  
  fs.writeFileSync(item.astro, finalAstro, 'utf8');
  console.log('Successfully restored ' + item.astro);
});
