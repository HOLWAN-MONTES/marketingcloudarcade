const fs = require('fs');
const path = require('path');

const articlesMeta = {
  'ssjs-http': {
    tags: ['#ssjs', '#http', '#rest-api', '#oauth2', '#cloudpages'],
    related: [
      { url: '/ssjs-upsert', icon: '⚡', es: 'SSJS: Upsert Contactos via REST API', en: 'SSJS: Upsert Contacts via REST API' },
      { url: '/ssjs-debug', icon: '⚡', es: 'SSJS: Logging y Debugging avanzado', en: 'SSJS: Advanced Logging & Debugging' },
      { url: '/cp-auth', icon: '☁️', es: 'Cloud Pages: Auth con tokens', en: 'Cloud Pages: Token auth' }
    ]
  },
  'ssjs-upsert': {
    tags: ['#ssjs', '#rest-api', '#upsert', '#contacts', '#dataextension'],
    related: [
      { url: '/ssjs-http', icon: '⚡', es: 'SSJS: Peticiones HTTP GET y POST', en: 'SSJS: HTTP GET & POST Requests' },
      { url: '/ssjs-debug', icon: '⚡', es: 'SSJS: Logging y Debugging avanzado', en: 'SSJS: Advanced Logging & Debugging' },
      { url: '/jb-api-entry', icon: '🗺️', es: 'Journey Builder: API Entry Event', en: 'Journey Builder: API Entry Event' }
    ]
  },
  'ssjs-intro': {
    tags: ['#ssjs', '#basics', '#cloudpages', '#automation', '#tips'],
    related: [
      { url: '/ssjs-http', icon: '⚡', es: 'SSJS: Peticiones HTTP GET y POST', en: 'SSJS: HTTP GET & POST Requests' },
      { url: '/ssjs-debug', icon: '⚡', es: 'SSJS: Logging y Debugging avanzado', en: 'SSJS: Advanced Logging & Debugging' },
      { url: '/amp-lookup', icon: '📄', es: 'AMPscript: LookupRows y datos dinámicos', en: 'AMPscript: LookupRows & Dynamic Data' }
    ]
  },
  'ssjs-debug': {
    tags: ['#ssjs', '#debugging', '#dataextension', '#troubleshooting', '#tips'],
    related: [
      { url: '/ssjs-http', icon: '⚡', es: 'SSJS: Peticiones HTTP GET y POST', en: 'SSJS: HTTP GET & POST Requests' },
      { url: '/ssjs-upsert', icon: '⚡', es: 'SSJS: Upsert Contactos via REST API', en: 'SSJS: Upsert Contacts via REST API' },
      { url: '/sql-dataviews', icon: '🗃️', es: 'SQL: Introducción a Data Views', en: 'SQL: Intro to SFMC Data Views' }
    ]
  },
  'amp-lookup': {
    tags: ['#ampscript', '#lookup', '#personalization', '#dataextension'],
    related: [
      { url: '/amp-dynamic', icon: '📄', es: 'Bloques de Contenido Dinámico con AMPscript', en: 'Dynamic Content Blocks with AMPscript' },
      { url: '/amp-formatdate', icon: '📄', es: 'AMPscript: FormatDate y manejo de fechas', en: 'AMPscript: FormatDate & Date Handling' },
      { url: '/inno-ai', icon: '🤖', es: 'Personalización con IA: GPT + AMPscript', en: 'AI Personalization: GPT + AMPscript' }
    ]
  },
  'amp-formatdate': {
    tags: ['#ampscript', '#dates', '#formatdate', '#personalization'],
    related: [
      { url: '/amp-lookup', icon: '📄', es: 'AMPscript: LookupRows y datos dinámicos', en: 'AMPscript: LookupRows & Dynamic Data' },
      { url: '/amp-dynamic', icon: '📄', es: 'Bloques de Contenido Dinámico con AMPscript', en: 'Dynamic Content Blocks with AMPscript' },
      { url: '/sql-engagement', icon: '🗃️', es: 'SQL: Score de Engagement de Suscriptores', en: 'SQL: Subscriber Engagement Score' }
    ]
  },
  'amp-dynamic': {
    tags: ['#ampscript', '#personalization', '#dynamic-content', '#email'],
    related: [
      { url: '/amp-lookup', icon: '📄', es: 'AMPscript: LookupRows y datos dinámicos', en: 'AMPscript: LookupRows & Dynamic Data' },
      { url: '/inno-ai', icon: '🤖', es: 'Personalización con IA: GPT + AMPscript', en: 'AI Personalization: GPT + AMPscript' },
      { url: '/next-agentforce-campaigns', icon: '🔮', es: 'Agentforce: Campañas Autónomas y Prompt Studio', en: 'Agentforce: Autonomous Campaigns & Prompt Studio' }
    ]
  },
  'sql-dataviews': {
    tags: ['#sql', '#dataviews', '#system-tables', '#sent', '#open', '#click'],
    related: [
      { url: '/sql-engagement', icon: '🗃️', es: 'SQL: Score de Engagement de Suscriptores', en: 'SQL: Subscriber Engagement Score' },
      { url: '/sql-joins', icon: '🗃️', es: 'SQL: JOINs avanzados en Query Activities', en: 'SQL: Advanced JOINs in Query Activities' },
      { url: '/auto-filedrop', icon: '⚙️', es: 'Automation Studio: Patrón File Drop', en: 'Automation Studio: File Drop Pattern' }
    ]
  },
  'sql-engagement': {
    tags: ['#sql', '#engagement', '#dataviews', '#scoring', '#analytics'],
    related: [
      { url: '/sql-dataviews', icon: '🗃️', es: 'SQL: Introducción a Data Views', en: 'SQL: Intro to SFMC Data Views' },
      { url: '/sql-joins', icon: '🗃️', es: 'SQL: JOINs avanzados en Query Activities', en: 'SQL: Advanced JOINs in Query Activities' },
      { url: '/next-datacloud-segments', icon: '🔮', es: 'Data Cloud: Segmentación en Tiempo Real', en: 'Data Cloud: Real-Time Segmentation' }
    ]
  },
  'sql-joins': {
    tags: ['#sql', '#joins', '#subqueries', '#dataextension', '#automation'],
    related: [
      { url: '/sql-dataviews', icon: '🗃️', es: 'SQL: Introducción a Data Views', en: 'SQL: Intro to SFMC Data Views' },
      { url: '/sql-engagement', icon: '🗃️', es: 'SQL: Score de Engagement de Suscriptores', en: 'SQL: Subscriber Engagement Score' },
      { url: '/next-datacloud-segments', icon: '🔮', es: 'Data Cloud: Segmentación en Tiempo Real', en: 'Data Cloud: Real-Time Segmentation' }
    ]
  },
  'auto-filedrop': {
    tags: ['#automation', '#filedrop', '#ftp', '#triggered-automation'],
    related: [
      { url: '/jb-api-entry', icon: '🗺️', es: 'Journey Builder: API Entry Event', en: 'Journey Builder: API Entry Event' },
      { url: '/ssjs-upsert', icon: '⚡', es: 'SSJS: Upsert Contactos via REST API', en: 'SSJS: Upsert Contacts via REST API' },
      { url: '/sql-joins', icon: '🗃️', es: 'SQL: JOINs avanzados en Query Activities', en: 'SQL: Advanced JOINs in Query Activities' }
    ]
  },
  'jb-api-entry': {
    tags: ['#journey', '#api-entry', '#event-definition', '#realtime', '#rest-api'],
    related: [
      { url: '/auto-filedrop', icon: '⚙️', es: 'Automation Studio: Patrón File Drop', en: 'Automation Studio: File Drop Pattern' },
      { url: '/ssjs-http', icon: '⚡', es: 'SSJS: Peticiones HTTP GET y POST', en: 'SSJS: HTTP GET & POST Requests' },
      { url: '/next-agentforce-campaigns', icon: '🔮', es: 'Agentforce: Campañas Autónomas', en: 'Agentforce: Autonomous Campaigns' }
    ]
  },
  'cp-auth': {
    tags: ['#cloudpages', '#auth', '#tokens', '#security', '#dataextension'],
    related: [
      { url: '/ssjs-http', icon: '⚡', es: 'SSJS: Peticiones HTTP GET y POST', en: 'SSJS: HTTP GET & POST Requests' },
      { url: '/ssjs-debug', icon: '⚡', es: 'SSJS: Logging y Debugging avanzado', en: 'SSJS: Advanced Logging & Debugging' },
      { url: '/amp-lookup', icon: '📄', es: 'AMPscript: LookupRows y datos dinámicos', en: 'AMPscript: LookupRows & Dynamic Data' }
    ]
  },
  'inno-ai': {
    tags: ['#innovations', '#ai', '#gpt', '#ampscript', '#personalization'],
    related: [
      { url: '/next-agentforce-campaigns', icon: '🔮', es: 'Agentforce: Campañas Autónomas y Prompt Studio', en: 'Agentforce: Autonomous Campaigns & Prompt Studio' },
      { url: '/amp-dynamic', icon: '📄', es: 'Bloques de Contenido Dinámico con AMPscript', en: 'Dynamic Content Blocks with AMPscript' },
      { url: '/next-datacloud-segments', icon: '🔮', es: 'Data Cloud: Segmentación en Tiempo Real', en: 'Data Cloud: Real-Time Segmentation' }
    ]
  },
  'resources-links': {
    tags: ['#resources', '#documentation', '#tools', '#community', '#cheatsheet'],
    related: [
      { url: '/ssjs-intro', icon: '⚡', es: 'Introducción a SSJS en SFMC', en: 'Introduction to SSJS in SFMC' },
      { url: '/sql-dataviews', icon: '🗃️', es: 'SQL: Introducción a Data Views', en: 'SQL: Intro to SFMC Data Views' },
      { url: '/next-datacloud-segments', icon: '🔮', es: 'Data Cloud: Segmentación en Tiempo Real', en: 'Data Cloud: Real-Time Segmentation' }
    ]
  }
};

const pagesDir = path.join(__dirname, 'src', 'pages');

Object.keys(articlesMeta).forEach(slug => {
  const filePath = path.join(pagesDir, slug + '.astro');
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');
  const meta = articlesMeta[slug];

  const tagHtml = meta.tags.map(t => {
    let cls = '';
    if (t.includes('datacloud') || t.includes('agentforce') || t.includes('einstein') || t.includes('segmentation') || t.includes('dmo')) cls = ' purple';
    else if (t.includes('ssjs') || t.includes('http') || t.includes('cloudpages') || t.includes('innovations')) cls = ' pink';
    else if (t.includes('sql') || t.includes('dataviews') || t.includes('calculated-insights') || t.includes('oauth2') || t.includes('scoring') || t.includes('analytics')) cls = ' yellow';
    else if (t.includes('automation') || t.includes('filedrop') || t.includes('journey') || t.includes('api-entry')) cls = ' orange';
    else if (t.includes('personalization') || t.includes('ai') || t.includes('gpt')) cls = ' green';
    return `<span class="tag${cls}">${t}</span>`;
  }).join('\n        ');

  const relatedHtml = meta.related.map(r => {
    return `        <a href="${r.url}" style="font-size:0.8rem;font-weight:600;color:var(--text-primary);display:block;" data-lang="es">${r.icon} ${r.es}</a>
        <a href="${r.url}" style="font-size:0.8rem;font-weight:600;color:var(--text-primary);display:block;" data-lang="en">${r.icon} ${r.en}</a>`;
  }).join('\n');

  // Replace Tags sidebar card
  const tagsCardRegex = /<div class="sidebar-card">\s*<div class="sidebar-card-title">🏷️ TAGS<\/div>[\s\S]*?<\/div>\s*<\/div>/;
  const newTagsCard = `<div class="sidebar-card">
      <div class="sidebar-card-title">🏷️ TAGS</div>
      <div style="display:flex;flex-wrap:wrap;gap:0.4rem;margin-top:0.5rem;">
        ${tagHtml}
      </div>
    </div>`;
  
  if (tagsCardRegex.test(content)) {
    content = content.replace(tagsCardRegex, newTagsCard);
  }

  // Replace Related articles card
  const relatedCardRegex = /<div class="sidebar-card">\s*<div class="sidebar-card-title" data-lang="es">🔗 ARTÍCULOS RELACIONADOS<\/div>[\s\S]*?<\/div>\s*<\/div>/;
  const newRelatedCard = `<div class="sidebar-card">
      <div class="sidebar-card-title" data-lang="es">🔗 ARTÍCULOS RELACIONADOS</div>
      <div class="sidebar-card-title" data-lang="en">🔗 RELATED ARTICLES</div>
      <div style="display:flex;flex-direction:column;gap:0.75rem;margin-top:0.75rem;">
${relatedHtml}
      </div>
    </div>`;

  if (relatedCardRegex.test(content)) {
    content = content.replace(relatedCardRegex, newRelatedCard);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated tags & related articles for:', slug);
});
