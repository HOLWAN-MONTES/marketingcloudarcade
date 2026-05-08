/**
 * fix-catalog-corruption.cjs
 *
 * Fixes the specific corrupted character sequences found in catalog.astro
 * (and any other .astro file with the same patterns).
 *
 * Run with:  node fix-catalog-corruption.cjs
 */

const fs   = require('fs');
const path = require('path');

const DIRS = ['src/pages', 'src/components', 'src/layouts'];

// ─── Exact byte-sequence replacements ─────────────────────────────────────
// Each entry: [corruptedString, correctEmoji, contextHint]
// The corruptedString uses actual Unicode codepoints matching what we found.
const EXACT = [
  // Hero heading icon  📂 (open folder)  fffd,0078,001c,001a
  ['\uFFFDx\u001C\u001A',  '📂'],

  // AMPscript icon  📋 (clipboard)  fffd,0078,001c,fffd
  ['\uFFFDx\u001C\uFFFD',  '📋'],

  // SQL icon  🗃️ (card file box)  fffd,0078,0014,fffd
  ['\uFFFDx\u0014\uFFFD',  '🗃️'],

  // Automation icon  ⚙️ (gear)  starts with fffd + "a\"️"  (complex)
  // We handle the ⚙️ variant with a string replace targeting the full mangled span
  // -> handled below as context-aware

  // Innovations icon  🤖 (robot)  fffd,0078,fffd,0013
  ['\uFFFDx\uFFFD\u0013',  '🤖'],

  // Resources icon  🔗 (link)  fffd,0078,001d,0014
  ['\uFFFDx\u001D\u0014',  '🔗'],

  // Search icon  🔍 (magnifying glass)  fffd,0078,001d,fffd
  ['\uFFFDx\u001D\uFFFD',  '🔍'],

  // Level badges:  🟢/🟡/🔴  fffd,0078,0078,fffd
  // We can't distinguish Beginner vs Intermediate vs Advanced from the
  // sequence alone — we'll use context-aware regex below instead.
  // ['\uFFFDxx\uFFFD',  '??'],

  // Date icon  📅  fffd,0078,001c  (followed by & Apr 2025 etc.)
  ['\uFFFDx\u001C',  '📅'],

  // Views icon  👁️  fffd,0078,0018,fffd
  ['\uFFFDx\u0018\uFFFD',  '👁️'],

  // Comment border  ──  fffd,001d,fffd,fffd,001d,fffd
  ['\uFFFD\u001D\uFFFD\uFFFD\u001D\uFFFD',  '──'],

  // Single replacement char used as partial emoji (catch-all after others)
  // Only replace if left isolated (not part of a good emoji)
];

// ─── Context-aware regex replacements ─────────────────────────────────────
const REGEX = [
  // Level badge spans   (sequence fffd,78,78,fffd before level name)
  [/[\uFFFD]x+[\uFFFD](?=\s*Intermediate)/g,  '🟡'],
  [/[\uFFFD]x+[\uFFFD](?=\s*Beginner)/g,      '🟢'],
  [/[\uFFFD]x+[\uFFFD](?=\s*Advanced)/g,      '🔴'],

  // Filter buttons
  [/(data-filter-level="beginner">)[\uFFFD]x+[\uFFFD]\s*/g, '$1🟢 '],
  [/(data-filter-level="intermediate">)[\uFFFD]x+[\uFFFD]\s*/g, '$1🟡 '],
  [/(data-filter-level="advanced">)[\uFFFD]x+[\uFFFD]\s*/g, '$1🔴 '],

  // Automation icon span  — it had  <span>Xa"️</span>  or  <span>⚙️</span>
  [/(<span>)[\uFFFD]a"(️<\/span> Automation)/g, '$1⚙️$2'],
  [/(<span>)\uFFFDa"(️<\/span>)/g, '$1⚙️$2'],

  // Card count / visit icon in article footer  "🔥" or "👁️"
  [/(<span class="views hot">)[\uFFFD][^\uFFFD<]*/g, '$1🔥 '],
  [/(<span class="views">)[\uFFFD][^\uFFFD<]*/g,     '$1👁️ '],

  // No-results emoji
  [/(<span class="emoji">)[\uFFFD][^<]*(<\/span>)/g, '$1👾$2'],

  // Resources tag  "🔗 Resources"
  [/(<span class="tag">)[\uFFFD][^<]*\s*Resources/g, '$1🔗 Resources'],

  // Date spans: "📅 Apr 2025" (after exact replacement, clean up leftover &)
  [/📅&\s+/g, '📅 '],

  // Fire icon next to views hot (after exact replacement cleanup)
  [/(<span class="views hot">)🔥?\s*[\uFFFD][^<]*/g, '$1🔥 '],

  // Isolated FFFD replacement characters (cleanup)
  [/\uFFFD/g, ''],

  // Remaining control characters that sneak through
  [/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''],
];

// ─── Process files ─────────────────────────────────────────────────────────
let totalFixed = 0;

for (const dir of DIRS) {
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.astro'));

  for (const file of files) {
    const filepath = path.join(dir, file);
    let content    = fs.readFileSync(filepath, 'utf8');
    const original = content;

    // Apply exact string replacements first
    for (const [corrupt, correct] of EXACT) {
      content = content.split(corrupt).join(correct);
    }

    // Apply regex replacements
    for (const [pattern, replacement] of REGEX) {
      content = content.replace(pattern, replacement);
    }

    if (content !== original) {
      fs.writeFileSync(filepath, content, 'utf8');
      totalFixed++;
      console.log(`  ✔ FIXED     ${file}`);
    } else {
      console.log(`  ✓ OK        ${file}`);
    }
  }
}

console.log(`\nDone. Fixed ${totalFixed} file(s).`);
