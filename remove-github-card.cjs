const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.astro'));

let count = 0;
files.forEach(file => {
  const fullPath = path.join(pagesDir, file);
  let content = fs.readFileSync(fullPath, 'utf8');
  let original = content;

  // Remove the exact GitHub card box from the sidebar while keeping TOC, TAGS, and RELATED ARTICLES intact
  const githubCardRegex = /\r?\n\s*<div class="sidebar-card"[^>]*>\s*<div class="sidebar-card-title">.*?GITHUB<\/div>[\s\S]*?<\/div>/gi;
  content = content.replace(githubCardRegex, '');

  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('Removed GitHub sidebar card from:', file);
    count++;
  }
});

console.log(`Cleaned ${count} articles.`);
