/**
 * fix-encoding-all.cjs
 * Fixes mojibake in all .astro files under src/
 *
 * The problem: Files saved as UTF-8 were re-read and re-saved as Latin-1,
 * so multi-byte UTF-8 sequences got stored as individual Latin-1 characters.
 * Fix: Read as Latin-1 → encode to buffer → decode as UTF-8.
 *
 * Examples of mojibake this fixes:
 *   ðŸ"‚  →  📂
 *   ðŸ—‚ï¸  →  🗂️
 *   Ã³    →  ó
 *   Ã­    →  í
 */

const fs   = require('fs');
const path = require('path');

const DIRS = ['src/pages', 'src/components', 'src/layouts'];

// Detect if a string contains mojibake patterns
function hasMojibake(text) {
  return (
    text.includes('ðŸ') ||   // emoji mojibake prefix
    text.includes('Ã')  ||   // accented letter mojibake
    text.includes('â€') ||   // typographic quote mojibake
    text.includes('â"')  ||   // box-drawing mojibake
    text.includes('â±')  ||   // ⏱ mojibake
    text.includes('â˜')  ||   // ☁ mojibake
    text.includes('âš')  ||   // ⚙ mojibake
    text.includes('â€')      // dash/quote mojibake
  );
}

let totalFixed = 0;

for (const dir of DIRS) {
  if (!fs.existsSync(dir)) continue;

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.astro'));

  for (const file of files) {
    const filepath = path.join(dir, file);
    const raw = fs.readFileSync(filepath, 'utf8');

    if (!hasMojibake(raw)) {
      console.log(`  ✓ OK        ${file}`);
      continue;
    }

    // Re-interpret the string: treat each JS character as a Latin-1 byte
    const buf       = Buffer.from(raw, 'latin1');
    const recovered = buf.toString('utf8');

    fs.writeFileSync(filepath, recovered, 'utf8');
    totalFixed++;
    console.log(`  ✔ FIXED     ${file}`);
  }
}

console.log(`\nDone. Fixed ${totalFixed} file(s).`);
