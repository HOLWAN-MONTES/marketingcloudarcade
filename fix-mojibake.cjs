const fs = require('fs');
const path = require('path');
const dir = 'src/pages';

const files = fs.readdirSync(dir).filter(f => f.endsWith('.astro'));

for (const file of files) {
  const filepath = path.join(dir, file);
  const content = fs.readFileSync(filepath, 'utf8');
  
  if (content.includes('Ã') || content.includes('ðŸ')) {
    console.log('Fixing mojibake in ' + file);
    const buf = Buffer.from(content, 'latin1');
    const recovered = buf.toString('utf8');
    fs.writeFileSync(filepath, recovered, 'utf8');
  } else {
    console.log('No mojibake detected in ' + file);
  }
}
