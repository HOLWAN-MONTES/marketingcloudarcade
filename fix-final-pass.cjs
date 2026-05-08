const fs = require('fs');
const path = require('path');
const dir = 'src/pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.astro'));
let total = 0;
for (const file of files) {
  const fp = path.join(dir, file);
  let c = fs.readFileSync(fp, 'utf8');
  const orig = c;
  // Fix 🔍 Advanced → 🔴 Advanced (everywhere: badges, filter buttons, level-badge spans)
  c = c.replace(/🔍 Advanced/g, '🔴 Advanced');
  // Fix views hot icon: 🔍 inside views hot span → 🔥
  c = c.replace(/class="views hot">\u{1F50D}/gu, 'class="views hot">🔥');
  // No-results icon: 👁️ → 👾
  c = c.replace(/class="emoji">\u{1F441}\uFE0F<\/span>/gu, 'class="emoji">👾</span>');
  // Fix double variation selector 👁️️ → 👁️
  c = c.replace(/\u{1F441}\uFE0F\uFE0F/gu, '👁️');
  if (c !== orig) {
    fs.writeFileSync(fp, c, 'utf8');
    total++;
    console.log('Fixed: ' + file);
  }
}
console.log('Done. Fixed ' + total + ' file(s).');
