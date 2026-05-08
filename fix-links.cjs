/**
 * fix-links.cjs
 * Converts all old .html-based links to Astro-style clean URLs.
 *
 * Before: href="pages/catalog.html"   href="catalog.html"   href="../index.html"
 * After:  href="/catalog"             href="/catalog"       href="/"
 */

const fs   = require('fs');
const path = require('path');

const DIRS = ['src/pages', 'src/components', 'src/layouts'];

// Collect all .astro files
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

  // 1. href="pages/filename.html"  or  href="pages/filename.html?cat=xxx"
  //    → href="/filename"  or  href="/filename?cat=xxx"
  c = c.replace(/href="pages\/([a-z0-9_-]+)\.html(\?[^"]*)?">/g, (_, name, qs) => {
    return `href="/${name}${qs || ''}">`;
  });
  c = c.replace(/href='pages\/([a-z0-9_-]+)\.html(\?[^']*)?'>/g, (_, name, qs) => {
    return `href='/${name}${qs || ''}'>`;
  });

  // 2. href="filename.html"  (bare, no pages/ prefix, no ../)
  //    → href="/filename"
  c = c.replace(/href="([a-z0-9_-]+)\.html(\?[^"]*)?">/g, (_, name, qs) => {
    // Don't touch if it looks like a protocol
    if (name.includes(':')) return _;
    return `href="/${name}${qs || ''}">`;
  });
  c = c.replace(/href='([a-z0-9_-]+)\.html(\?[^']*)?'>/g, (_, name, qs) => {
    if (name.includes(':')) return _;
    return `href='/${name}${qs || ''}'>`;
  });

  // 3. href="../index.html"  →  href="/"
  c = c.replace(/href="\.\.\/index\.html"/g, 'href="/"');
  c = c.replace(/href='\.\.\/index\.html'/g, "href='/'");

  // 4. href="index.html"  →  href="/"
  c = c.replace(/href="index\.html"/g, 'href="/"');
  c = c.replace(/href='index\.html'/g, "href='/'");

  // 5. JS fetch('pages/catalog.html')  →  fetch('/catalog')
  c = c.replace(/fetch\('pages\/([a-z0-9_-]+)\.html'\)/g, (_, name) => `fetch('/${name}')`);
  c = c.replace(/fetch\("pages\/([a-z0-9_-]+)\.html"\)/g, (_, name) => `fetch("/${name}")`);

  // 6. fetch('pages/' + link)  →  fetch(link)
  //    (catalog card hrefs are now /filename so link already starts with /)
  c = c.replace(/fetch\('pages\/' \+ link\)/g, 'fetch(link)');
  c = c.replace(/fetch\("pages\/" \+ link\)/g, 'fetch(link)');

  // 7. 'pages/' + originalHref  →  originalHref  (JS clone logic in index.astro)
  c = c.replace(/'pages\/' \+ originalHref/g, 'originalHref');
  c = c.replace(/"pages\/" \+ originalHref/g, 'originalHref');

  if (c !== orig) {
    fs.writeFileSync(fp, c, 'utf8');
    totalFixed++;
    console.log('  ✔ FIXED  ' + fp);
  } else {
    console.log('  ✓ OK     ' + fp);
  }
}

console.log(`\nDone. Fixed ${totalFixed} file(s).`);
