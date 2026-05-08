const fs=require('fs'), path=require('path');
const dirs=['src/pages','src/components','src/layouts'];
let found=false;
for(const dir of dirs){
  if(!fs.existsSync(dir)) continue;
  for(const f of fs.readdirSync(dir)){
    if(!f.endsWith('.astro')) continue;
    const c=fs.readFileSync(path.join(dir,f),'utf8');
    const dotHtml = c.includes('.html') && !c.includes('code-block') ; // .html in HTML context, not code samples
    const pagesPrefix = c.includes("href=\"pages/") || c.includes("href='pages/");
    if(dotHtml || pagesPrefix){
      console.log('CHECK: '+f);
      const lines = c.split('\n').filter(l => (l.includes('.html') || l.includes('pages/')) && !l.includes('//'));
      lines.slice(0,5).forEach(l => console.log('  ' + l.trim().slice(0,120)));
    } else {
      console.log('CLEAN: '+f);
    }
  }
}
