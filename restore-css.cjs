const fs = require('fs');
const path = require('path');

const map = [
  { dist: 'dist/index.html', astro: 'src/pages/index.astro' },
  { dist: 'dist/about/index.html', astro: 'src/pages/about.astro' },
  { dist: 'dist/catalog/index.html', astro: 'src/pages/catalog.astro' }
];

map.forEach(item => {
  if (!fs.existsSync(item.dist)) return;
  
  let distHtml = fs.readFileSync(item.dist, 'utf8');
  let astroCode = fs.readFileSync(item.astro, 'utf8');
  
  // Extract styles
  let styleBlocks = [];
  const regex = /<style[^>]*>([\s\S]*?)<\/style>/g;
  let match;
  while ((match = regex.exec(distHtml)) !== null) {
     styleBlocks.push(match[1]);
  }
  
  if (styleBlocks.length > 0) {
    let combinedCss = styleBlocks.join('\n');
    combinedCss = combinedCss.replace(/\[data-astro-cid-[a-z0-9]+\]/g, '');
    
    astroCode = astroCode.replace(/<Layout[^>]*>/, "$&" + "\n<style>\n" + combinedCss + "\n</style>\n");
    fs.writeFileSync(item.astro, astroCode, 'utf8');
    console.log('Restored CSS for ' + item.astro);
  }
});
