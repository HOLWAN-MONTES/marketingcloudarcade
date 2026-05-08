/**
 * fix-links-v2.cjs
 * More aggressive link fixer - replaces ALL occurrences of
 * href="pages/X.html" and href="X.html" patterns regardless of
 * what comes after the closing quote.
 */

const fs   = require('fs');
const path = require('path');

const DIRS = ['src/pages', 'src/components', 'src/layouts'];

const files = [];
for (const dir of DIRS) {
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir)) {
    if (f.endsWith('.astro')) files.push(path.join(dir, f));
  }
}

let totalFixed = 0;

for (const fp of files) {
  let c = fs.readFileSync(fp, 'utf8');
  const orig = c;

  // 1. href="pages/filename.html"  →  href="/filename"
  //    (with optional query string)
  c = c.replace(/href="pages\/([a-z0-9_-]+)\.html(\?[^"]*)?"([^>]*>)/g, (_, name, qs, rest) => {
    return `href="/${name}${qs || ''}"${rest}`;
  });

  // 2. href='pages/filename.html'  →  href='/filename'
  c = c.replace(/href='pages\/([a-z0-9_-]+)\.html(\?[^']*)?'([^>]*>)/g, (_, name, qs, rest) => {
    return `href='/${name}${qs || ''}'${rest}`;
  });

  // 3. href="filename.html"  →  href="/filename"
  c = c.replace(/href="([a-z0-9_-]+)\.html(\?[^"]*)?"([^>]*>)/g, (_, name, qs, rest) => {
    if (name.includes(':')) return _;
    return `href="/${name}${qs || ''}"${rest}`;
  });

  // 4. href='filename.html'  →  href='/filename'
  c = c.replace(/href='([a-z0-9_-]+)\.html(\?[^']*)?'([^>]*>)/g, (_, name, qs, rest) => {
    if (name.includes(':')) return _;
    return `href='/${name}${qs || ''}'${rest}`;
  });

  // 5. ../index.html  →  /
  c = c.replace(/href="\.\.\/index\.html"/g, 'href="/"');
  c = c.replace(/href='\.\.\/index\.html'/g, "href='/'");

  // 6. index.html  →  /
  c = c.replace(/href="index\.html"/g, 'href="/"');
  c = c.replace(/href='index\.html'/g, "href='/'");

  // 7. JS fetch calls
  c = c.replace(/fetch\("pages\/([a-z0-9_-]+)\.html"\)/g, (_, name) => `fetch("/${name}")`);
  c = c.replace(/fetch\('pages\/([a-z0-9_-]+)\.html'\)/g, (_, name) => `fetch('/${name}')`);

  // 8. fetch('pages/' + link)  / fetch("pages/" + link)
  c = c.replace(/fetch\('pages\/' \+ link\)/g, 'fetch(link)');
  c = c.replace(/fetch\("pages\/" \+ link\)/g, 'fetch(link)');

  // 9. 'pages/' + originalHref  JS guard condition
  c = c.replace(/'pages\/' \+ originalHref/g, 'originalHref');
  c = c.replace(/"pages\/" \+ originalHref/g, 'originalHref');

  // 10. !originalHref.startsWith('pages/') guard — no longer needed but harmless
  //     We leave it as is since it won't break anything now

  if (c !== orig) {
    fs.writeFileSync(fp, c, 'utf8');
    totalFixed++;
    console.log('  ✔ FIXED  ' + path.basename(fp));
  } else {
    console.log('  ✓ OK     ' + path.basename(fp));
  }
}

console.log(`\nDone. Fixed ${totalFixed} file(s).`);
