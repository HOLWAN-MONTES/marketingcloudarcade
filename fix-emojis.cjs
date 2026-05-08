const fs = require('fs');
const path = require('path');
const dir = 'src/pages';

const replacements = {
  'PETICI N': 'PETICIÓN',
  'AUTENTICACI N': 'AUTENTICACIÓN',
  'MISI N': 'MISIÓN',
  'x  PREREQUISITO': '⚠️ PREREQUISITO',
  'x  PREREQUISITE': '⚠️ PREREQUISITE',
  'a️ IMPORTANTE': '🛑 IMPORTANTE',
  'x a PRO TIP': '💡 PRO TIP',
  'x 9 Copiar': '📋 Copiar',
  'x 9 Copy': '📋 Copy',
  '  Ver solución': '👁️ Ver solución',
  '  View solution': '👁️ View solution',
  'x   EN ESTE ARTÍCULO': '📑 EN ESTE ARTÍCULO',
  'x   IN THIS ARTICLE': '📑 IN THIS ARTICLE',
  'x️ TAGS': '🏷️ TAGS',
  'x a ARTÍCULOS RELACIONADOS': '💡 ARTÍCULOS RELACIONADOS',
  'x a RELATED ARTICLES': '💡 RELATED ARTICLES',
  'S️ Editar en GitHub': '💻 Editar en GitHub',
  'S️ Edit on GitHub': '💻 Edit on GitHub',
  'S️ GITHUB': '💻 GITHUB',
  'x}': '✔️',
  'x ': '🎯 ',
  '  Anterior': '⬅️ Anterior',
  '  Previous': '⬅️ Previous',
  'Siguiente   ': 'Siguiente ➡️',
  'Next   ': 'Next ➡️',
  '܁️ Cloud Pages:': '☁️ Cloud Pages:',
  'x  AMPscript:': '📝 AMPscript:',
  'x & ': '⏳ ',
  'x ️ ': '👁️ ',
  'x  Advanced': '🔴 Advanced',
  'y  Intermediate': '🟡 Intermediate',
  'z  Beginner': '🟢 Beginner'
};

const files = fs.readdirSync(dir).filter(f => f.endsWith('.astro'));

for (let file of files) {
  if (['index.astro', 'about.astro', 'catalog.astro'].includes(file)) continue;
  
  const filepath = path.join(dir, file);
  let content = fs.readFileSync(filepath, 'utf8');
  let original = content;

  for (let [bad, good] of Object.entries(replacements)) {
    content = content.split(bad).join(good);
  }

  // Also catch generic level badges
  content = content.replace(/.  (Advanced|Intermediate|Beginner)/g, (match, p1) => {
     if (p1 === 'Advanced') return '🔴 Advanced';
     if (p1 === 'Intermediate') return '🟡 Intermediate';
     return '🟢 Beginner';
  });

  if (content !== original) {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log('Fixed emojis in ' + file);
  }
}
