const fs = require('fs');
const content = fs.readFileSync('dist/index.html', 'utf8');
const start = content.indexOf('<section class="hero"');
const end = content.indexOf('</section>', start) + 10;
console.log(content.substring(start, end));
