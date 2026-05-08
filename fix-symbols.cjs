/**
 * fix-symbols.cjs
 *
 * Replaces ALL corrupted symbol/emoji patterns in .astro files
 * with their correct UTF-8 equivalents.
 *
 * Run with:  node fix-symbols.cjs
 */

const fs   = require('fs');
const path = require('path');

const DIRS = ['src/pages', 'src/components', 'src/layouts'];

// ─── Replacement map ───────────────────────────────────────────────────────
// Order matters: longer / more specific patterns FIRST
const REPLACEMENTS = [

  // ── Mojibake emojis (from catalog.astro / about.astro) ──
  // These appear when UTF-8 emoji bytes were stored as Latin-1 characters.
  // The replacement map below handles those sequences.

  // 🗂️  (card index dividers) - F0 9F 97 82 EF B8 8F
  [/ðŸ—‚ï¸/g,  '🗂️'],
  [/ðŸ—‚/g,    '🗂️'],
  // 📂 (open folder)
  [/ðŸ"‚/g,    '📂'],
  // 📋 (clipboard / AMPscript)
  [/ðŸ"/g,     '📋'],
  // 🗃️ (card file box / SQL)
  [/ðŸ—ƒï¸/g,  '🗃️'],
  [/ðŸ—ƒ/g,    '🗃️'],
  // ⚙️ (gear / Automation)
  [/âš™ï¸/g,   '⚙️'],
  // 🗺️ (map / Journey Builder)
  [/ðŸ—ºï¸/g,  '🗺️'],
  // ☁️ (cloud / Cloud Pages)
  [/â˜ï¸/g,   '☁️'],
  // 🤖 (robot / Innovations)
  [/ðŸ¤–/g,    '🤖'],
  // 🔗 (link / Resources)
  [/ðŸ"—/g,    '🔗'],
  // 🔍 (magnifying glass / search)
  [/ðŸ"/g,     '🔍'],
  // 🟢 Beginner
  [/ðŸŸ¢/g,    '🟢'],
  // 🟡 Intermediate
  [/ðŸŸ¡/g,    '🟡'],
  // 🔴 Advanced
  [/ðŸ"´/g,    '🔴'],
  // 📅 calendar
  [/ðŸ"…/g,    '📅'],
  // 🔥 fire/hot
  [/ðŸ"¥/g,    '🔥'],
  // 👁️ eye/views
  [/ðŸ'ï¸/g,   '👁️'],
  // 👾 ghost/no results
  [/ðŸ'¾/g,    '👾'],
  // ─── box-drawing mojibake (â"€) → ─
  [/â"€/g,     '─'],

  // ─────────────────────────────────────────────────────────────────────────
  // ── Stripped control-char artifacts (from the cleanup earlier) ──
  // After the control-char removal, many emojis became bare "x" or
  // partial sequences like "xa", "x9", "xN", etc.
  // We use context to restore the correct emoji.

  // Level badges: "xx Intermediate", "xx Beginner", "xx Advanced"
  // After stripping, the 🟡/🟢/🔴 emoji before the level text was lost.
  [/\bxx\b(?=\s*Intermediate)/g,  '🟡'],
  [/\bxx\b(?=\s*Beginner)/g,      '🟢'],
  [/\bxx\b(?=\s*Advanced)/g,      '🔴'],

  // level-badge spans with lost emojis
  [/(<span class="level-badge intermediate">)xx /g,  '$1🟡 '],
  [/(<span class="level-badge beginner">)xx /g,      '$1🟢 '],
  [/(<span class="level-badge advanced">)xx /g,      '$1🔴 '],

  // filter buttons  "xx Beginner" / "xx Intermediate" / "xx Advanced"
  [/\bxx\b(?= Beginner)/g,    '🟢'],
  [/\bxx\b(?= Intermediate)/g,'🟡'],
  [/\bxx\b(?= Advanced)/g,    '🔴'],

  // Article meta: date icon "x& Updated" / "x& Apr 2025" etc.
  [/\bx&(?=\s)/g,   '📅'],

  // Views icon  "x️ N views" / "x️ <span" 
  [/\bx️(?=\s*<span)/g,  '👁️'],
  [/\bx️(?=\s+\d)/g,     '👁️'],

  // GitHub edit links "S️ Editar" / "S️ Edit"
  [/\bS️(?=\s+(Edit|Editar))/g,  '📝'],

  // Callout labels
  [/\bx(?=\s+PREREQUISITO)/g,     '📌'],
  [/\bx(?=\s+PREREQUISITE)/g,     '📌'],
  [/\ba️(?=\s+IMPORTANTE)/g,      '⚠️'],
  [/\bxa(?=\s+PRO TIP)/g,         '💡'],
  [/\bx(?=\s+PREREQUISITO)/g,     '📌'],

  // Code copy buttons
  [/\bx9(?=\s+Copiar)/g,  '📋'],
  [/\bx9(?=\s+Copy)/g,    '📋'],

  // Challenge box icons
  [/(<span class="challenge-box-icon">)x /g,  '$1🎮 '],

  // Sidebar card titles
  [/\bx(?=\s+EN ESTE ARTÍCULO)/g,      '📖'],
  [/\bx(?=\s+IN THIS ARTICLE)/g,       '📖'],
  [/\bxa(?=\s+ARTÍCULOS RELACIONADOS)/g, '🔗'],
  [/\bxa(?=\s+RELATED ARTICLES)/g,      '🔗'],
  [/\bx️(?=\s+TAGS)/g,                  '🏷️'],

  // GitHub sidebar card title "S️ GITHUB"
  [/\bS️(?=\s+GITHUB)/g,  '🐙'],

  // Catalog hero "x& CATÁLOGO COMPLETO" / "x& FULL CATALOG"  (was📂)
  [/(<h1[^>]*>)\s*[^\S\n]*x\S*\s+(?=(CATÁLOGO|FULL CATALOG))/g, '$1📂 '],

  // Sidebar "All" category  "x️️" before Todos / All
  [/(<span>)[^\S\n]*\S*x\S*️?(<\/span>)\s*(<span data-lang="es">Todos)/g, 
   '$1🗂️$2 $3'],

  // Category icons in sidebar nav items
  [/(<span>)x\S*(<\/span>) AMPscript/g,  '$1📋$2 AMPscript'],
  [/(<span>)x\S*(<\/span>) SQL/g,        '$1🗃️$2 SQL'],
  [/(<span>)x\S*(<\/span>) Automation/g, '$1⚙️$2 Automation'],
  [/(<span>)x\S*(<\/span>) Journey/g,    '$1🗺️$2 Journey'],
  [/(<span>)x\S*(<\/span>) Cloud/g,      '$1☁️$2 Cloud'],
  [/(<span>)x\S*(<\/span>)\s*(<span data-lang="es">Innovaciones)/g, 
   '$1🤖$2 $3'],
  [/(<span>)x\S*(<\/span>)\s*(<span data-lang="es">Recursos)/g,
   '$1🔗$2 $3'],

  // Search bar icon "x️" before <input
  [/(<span class="icon">)x\S*(<\/span>)/g, '$1🔍$2'],

  // Article footer: "x& Apr 2025" date
  [/<span>x&\s+(\w+ \d{4})<\/span>/g, '<span>📅 $1</span>'],

  // Article footer views hot  "x& <span"  → 🔥
  [/(<span class="views hot">)x\S*/g, '$1🔥'],
  // Article footer views normal "x️ <span" → 👁️
  [/(<span class="views">)x\S*/g, '$1👁️'],

  // No-results emoji "x"
  [/(<span class="emoji">)x\S*(<\/span>)/g, '$1👾$2'],

  // resources tag  "x Resources"
  [/(<span class="tag">)x\S*\s+Resources/g, '$1🔗 Resources'],

  // MISIÓN/MISSION heading remnant
  [/\bMISIN:/g, 'MISIÓN:'],
  [/\bPETICIN\b/g, 'PETICIÓN'],
  [/\bAUTENTICACIN\b/g, 'AUTENTICACIÓN'],
  [/\bSiguiente\s{2}/g, 'Siguiente ▶ '],
  [/\bNext\s{2}/g,      'Next ▶ '],
  [/\s{2}Anterior/g, '◀ Anterior'],
  [/\s{2}Previous/g, '◀ Previous'],

  // Dynamic Category Counts comment border
  [/─{2,}/g, '──'],
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

    for (const [pattern, replacement] of REPLACEMENTS) {
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
