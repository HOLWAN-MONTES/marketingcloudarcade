const fs = require('fs');
const path = require('path');

const articlesMeta = {
  'sfmc-overview': {
    tags: ['#sfmc-overview', '#basics', '#architecture', '#studios-builders', '#implementation', '#emailstudio', '#journeybuilder'],
    related: [
      { url: '/ssjs-intro', icon: '⚡', es: 'Introducción a SSJS en SFMC', en: 'Introduction to SSJS in SFMC' },
      { url: '/amp-intro', icon: '⚡', es: 'Introducción a AMPscript', en: 'Introduction to AMPscript' },
      { url: '/sql-dataviews', icon: '📊', es: 'SQL: Introducción a Data Views', en: 'SQL: Intro to SFMC Data Views' }
    ],
    docs: [
      { url: 'https://help.salesforce.com/s/articleView?id=sf.mc_overview.htm&type=5', icon: '☁️', es: 'Salesforce Help: Introducción a MC Engagement', en: 'Salesforce Help: MC Engagement Overview' },
      { url: 'https://trailhead.salesforce.com/content/learn/modules/mrkt_cloud_basics', icon: '🧭', es: 'Trailhead: Conceptos Básicos de Marketing Cloud', en: 'Trailhead: Marketing Cloud Basics' }
    ]
  },
  'ssjs-intro': {
    tags: ['#ssjs', '#basics', '#cloudpages', '#automation', '#tips'],
    related: [
      { url: '/ssjs-http', icon: '⚡', es: 'SSJS: Peticiones HTTP GET y POST', en: 'SSJS: HTTP GET & POST Requests' },
      { url: '/ssjs-debug', icon: '⚡', es: 'SSJS: Logging y Debugging avanzado', en: 'SSJS: Advanced Logging & Debugging' },
      { url: '/amp-intro', icon: '⚡', es: 'Introducción a AMPscript', en: 'Introduction to AMPscript' }
    ],
    docs: [
      { url: 'https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/ssjs_serverSideJavaScript.html', icon: '☁️', es: 'Salesforce Docs: Guía Oficial de SSJS', en: 'Salesforce Docs: SSJS Overview' },
      { url: 'https://trailhead.salesforce.com/content/learn/modules/marketing-cloud-programmatic-languages/learn-about-server-side-javascript', icon: '🧭', es: 'Trailhead: Lenguajes Programáticos y SSJS', en: 'Trailhead: Programmatic Languages & SSJS' }
    ]
  },
  'ssjs-http': {
    tags: ['#ssjs', '#http', '#rest-api', '#oauth2', '#cloudpages'],
    related: [
      { url: '/ssjs-upsert', icon: '⚡', es: 'SSJS: Upsert Contactos via REST API', en: 'SSJS: Upsert Contacts via REST API' },
      { url: '/ssjs-debug', icon: '⚡', es: 'SSJS: Logging y Debugging avanzado', en: 'SSJS: Advanced Logging & Debugging' },
      { url: '/cp-auth', icon: '☁️', es: 'Cloud Pages: Auth con tokens', en: 'Cloud Pages: Token auth' }
    ],
    docs: [
      { url: 'https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/ssjs_httpFunctions.html', icon: '☁️', es: 'Salesforce Docs: Funciones HTTP en SSJS', en: 'Salesforce Docs: HTTP Functions in SSJS' },
      { url: 'https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/routes.html', icon: '📘', es: 'Salesforce Docs: Referencia de REST API', en: 'Salesforce Docs: REST API Reference' }
    ]
  },
  'ssjs-upsert': {
    tags: ['#ssjs', '#rest-api', '#upsert', '#contacts', '#dataextension'],
    related: [
      { url: '/ssjs-http', icon: '⚡', es: 'SSJS: Peticiones HTTP GET y POST', en: 'SSJS: HTTP GET & POST Requests' },
      { url: '/ssjs-debug', icon: '⚡', es: 'SSJS: Logging y Debugging avanzado', en: 'SSJS: Advanced Logging & Debugging' },
      { url: '/jb-api-entry', icon: '🗺️', es: 'Journey Builder: API Entry Event', en: 'Journey Builder: API Entry Event' }
    ],
    docs: [
      { url: 'https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/ssjs_platformDataExtensionFunctions.html', icon: '☁️', es: 'Salesforce Docs: Funciones de Data Extension en SSJS', en: 'Salesforce Docs: Data Extension SSJS Functions' },
      { url: 'https://trailhead.salesforce.com/content/learn/modules/marketing-cloud-contact-management', icon: '🧭', es: 'Trailhead: Gestión de Contactos y DEs', en: 'Trailhead: Contact & DE Management' }
    ]
  },
  'ssjs-debug': {
    tags: ['#ssjs', '#debugging', '#dataextension', '#troubleshooting', '#tips'],
    related: [
      { url: '/ssjs-http', icon: '⚡', es: 'SSJS: Peticiones HTTP GET y POST', en: 'SSJS: HTTP GET & POST Requests' },
      { url: '/ssjs-upsert', icon: '⚡', es: 'SSJS: Upsert Contactos via REST API', en: 'SSJS: Upsert Contacts via REST API' },
      { url: '/sql-dataviews', icon: '📊', es: 'SQL: Introducción a Data Views', en: 'SQL: Intro to SFMC Data Views' }
    ],
    docs: [
      { url: 'https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/ssjs_platformFunctions.html', icon: '☁️', es: 'Salesforce Docs: Funciones Platform en SSJS', en: 'Salesforce Docs: SSJS Platform Functions' },
      { url: 'https://help.salesforce.com/s/articleView?id=sf.mc_as_troubleshoot_scripts.htm&type=5', icon: '📘', es: 'Salesforce Help: Depuración de Scripts', en: 'Salesforce Help: Script Troubleshooting' }
    ]
  },
  'amp-intro': {
    tags: ['#ampscript', '#basics', '#emailstudio', '#cloudpages', '#personalization'],
    related: [
      { url: '/sfmc-overview', icon: '🚀', es: '¿Qué es Marketing Cloud Engagement?', en: 'What is Marketing Cloud Engagement?' },
      { url: '/ssjs-intro', icon: '⚡', es: 'Introducción a SSJS en SFMC', en: 'Introduction to SSJS in SFMC' },
      { url: '/sql-dataviews', icon: '📊', es: 'SQL: Introducción a Data Views', en: 'SQL: Intro to SFMC Data Views' }
    ],
    docs: [
      { url: 'https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/ampscript.html', icon: '☁️', es: 'Salesforce Docs: Sintaxis y Guía de AMPscript', en: 'Salesforce Docs: AMPscript Syntax Guide' },
      { url: 'https://trailhead.salesforce.com/content/learn/modules/ampscript-for-nondevelopers', icon: '🧭', es: 'Trailhead: Introducción a AMPscript', en: 'Trailhead: Intro to AMPscript' }
    ]
  },
  'sql-dataviews': {
    tags: ['#sql', '#dataviews', '#system-tables', '#sent', '#open', '#click'],
    related: [
      { url: '/sql-engagement', icon: '📊', es: 'SQL: Score de Engagement de Suscriptores', en: 'SQL: Subscriber Engagement Score' },
      { url: '/sql-joins', icon: '📊', es: 'SQL: JOINs avanzados en Query Activities', en: 'SQL: Advanced JOINs in Query Activities' },
      { url: '/auto-filedrop', icon: '⚙️', es: 'Automation Studio: Patrón File Drop', en: 'Automation Studio: File Drop Pattern' }
    ],
    docs: [
      { url: 'https://help.salesforce.com/s/articleView?id=sf.mc_as_data_views.htm&type=5', icon: '☁️', es: 'Salesforce Help: Referencia de Data Views', en: 'Salesforce Help: Data Views Reference' },
      { url: 'https://trailhead.salesforce.com/content/learn/modules/marketing-cloud-contact-management', icon: '🧭', es: 'Trailhead: Gestión de Datos y DEs', en: 'Trailhead: Data Management & DEs' }
    ]
  },
  'sql-engagement': {
    tags: ['#sql', '#engagement', '#dataviews', '#scoring', '#analytics'],
    related: [
      { url: '/sql-dataviews', icon: '📊', es: 'SQL: Introducción a Data Views', en: 'SQL: Intro to SFMC Data Views' },
      { url: '/sql-joins', icon: '📊', es: 'SQL: JOINs avanzados en Query Activities', en: 'SQL: Advanced JOINs in Query Activities' },
      { url: '/next-datacloud-segments', icon: '🔮', es: 'Data Cloud: Segmentación en Tiempo Real', en: 'Data Cloud: Real-Time Segmentation' }
    ],
    docs: [
      { url: 'https://help.salesforce.com/s/articleView?id=sf.mc_as_data_view_open.htm&type=5', icon: '☁️', es: 'Salesforce Help: Data View _Open', en: 'Salesforce Help: Data View _Open' },
      { url: 'https://help.salesforce.com/s/articleView?id=sf.mc_as_data_view_click.htm&type=5', icon: '📘', es: 'Salesforce Help: Data View _Click', en: 'Salesforce Help: Data View _Click' }
    ]
  },
  'sql-joins': {
    tags: ['#sql', '#joins', '#subqueries', '#dataextension', '#automation'],
    related: [
      { url: '/sql-dataviews', icon: '📊', es: 'SQL: Introducción a Data Views', en: 'SQL: Intro to SFMC Data Views' },
      { url: '/sql-engagement', icon: '📊', es: 'SQL: Score de Engagement de Suscriptores', en: 'SQL: Subscriber Engagement Score' },
      { url: '/next-datacloud-segments', icon: '🔮', es: 'Data Cloud: Segmentación en Tiempo Real', en: 'Data Cloud: Real-Time Segmentation' }
    ],
    docs: [
      { url: 'https://help.salesforce.com/s/articleView?id=sf.mc_as_sql_query_activity.htm&type=5', icon: '☁️', es: 'Salesforce Help: Actividades de Consulta SQL', en: 'Salesforce Help: SQL Query Activities' },
      { url: 'https://trailhead.salesforce.com/content/learn/modules/automation-studio-activities', icon: '🧭', es: 'Trailhead: Consultas SQL en Automation Studio', en: 'Trailhead: SQL Queries in Studio' }
    ]
  },
  'auto-filedrop': {
    tags: ['#automation', '#filedrop', '#ftp', '#triggered-automation'],
    related: [
      { url: '/jb-api-entry', icon: '🗺️', es: 'Journey Builder: API Entry Event', en: 'Journey Builder: API Entry Event' },
      { url: '/ssjs-upsert', icon: '⚡', es: 'SSJS: Upsert Contactos via REST API', en: 'SSJS: Upsert Contacts via REST API' },
      { url: '/sql-joins', icon: '📊', es: 'SQL: JOINs avanzados en Query Activities', en: 'SQL: Advanced JOINs in Query Activities' }
    ],
    docs: [
      { url: 'https://help.salesforce.com/s/articleView?id=sf.mc_as_triggered_automations.htm&type=5', icon: '☁️', es: 'Salesforce Help: Automatizaciones Activadas', en: 'Salesforce Help: Triggered Automations' },
      { url: 'https://trailhead.salesforce.com/content/learn/modules/automation-studio-activities', icon: '🧭', es: 'Trailhead: Actividades de Automation Studio', en: 'Trailhead: Automation Studio Activities' }
    ]
  },
  'jb-api-entry': {
    tags: ['#journey', '#api-entry', '#event-definition', '#realtime', '#rest-api'],
    related: [
      { url: '/auto-filedrop', icon: '⚙️', es: 'Automation Studio: Patrón File Drop', en: 'Automation Studio: File Drop Pattern' },
      { url: '/ssjs-http', icon: '⚡', es: 'SSJS: Peticiones HTTP GET y POST', en: 'SSJS: HTTP GET & POST Requests' },
      { url: '/next-agentforce-campaigns', icon: '🔮', es: 'Agentforce: Campañas Autónomas', en: 'Agentforce: Autonomous Campaigns' }
    ],
    docs: [
      { url: 'https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/routes.html', icon: '☁️', es: 'Salesforce Docs: Eventos y Rutas REST', en: 'Salesforce Docs: REST Routes & Events' },
      { url: 'https://trailhead.salesforce.com/content/learn/modules/journey-builder-basics', icon: '🧭', es: 'Trailhead: Fundamentos de Journey Builder', en: 'Trailhead: Journey Builder Basics' }
    ]
  },
  'cp-auth': {
    tags: ['#cloudpages', '#auth', '#tokens', '#security', '#dataextension'],
    related: [
      { url: '/ssjs-http', icon: '⚡', es: 'SSJS: Peticiones HTTP GET y POST', en: 'SSJS: HTTP GET & POST Requests' },
      { url: '/ssjs-debug', icon: '⚡', es: 'SSJS: Logging y Debugging avanzado', en: 'SSJS: Advanced Logging & Debugging' },
      { url: '/amp-intro', icon: '⚡', es: 'Introducción a AMPscript', en: 'Introduction to AMPscript' }
    ],
    docs: [
      { url: 'https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/your-subdomain-tenant-specific-endpoints.html', icon: '☁️', es: 'Salesforce Docs: Endpoints TSE y Auth', en: 'Salesforce Docs: TSE Endpoints & Auth' },
      { url: 'https://trailhead.salesforce.com/content/learn/modules/marketing-cloud-apis', icon: '🧭', es: 'Trailhead: APIs de Marketing Cloud', en: 'Trailhead: Marketing Cloud APIs' }
    ]
  },
  'inno-ai': {
    tags: ['#innovations', '#ai', '#gpt', '#ampscript', '#personalization'],
    related: [
      { url: '/next-agentforce-campaigns', icon: '🔮', es: 'Agentforce: Campañas Autónomas y Prompt Studio', en: 'Agentforce: Autonomous Campaigns & Prompt Studio' },
      { url: '/amp-intro', icon: '⚡', es: 'Introducción a AMPscript', en: 'Introduction to AMPscript' },
      { url: '/next-datacloud-segments', icon: '🔮', es: 'Data Cloud: Segmentación en Tiempo Real', en: 'Data Cloud: Real-Time Segmentation' }
    ],
    docs: [
      { url: 'https://help.salesforce.com/s/articleView?id=sf.mc_overview_einstein.htm&type=5', icon: '☁️', es: 'Salesforce Help: Einstein en Marketing Cloud', en: 'Salesforce Help: Einstein for MC' },
      { url: 'https://trailhead.salesforce.com/content/learn/trails/develop-for-marketing-cloud', icon: '🧭', es: 'Trailhead: Desarrollo para Marketing Cloud', en: 'Trailhead: Develop for Marketing Cloud' }
    ]
  },
  'next-datacloud-segments': {
    tags: ['#datacloud', '#segmentation', '#dmo', '#calculated-insights', '#realtime'],
    related: [
      { url: '/next-agentforce-campaigns', icon: '🔮', es: 'Agentforce: Campañas Autónomas y Prompt Studio', en: 'Agentforce: Autonomous Campaigns & Prompt Studio' },
      { url: '/sql-dataviews', icon: '📊', es: 'SQL: Introducción a Data Views', en: 'SQL: Intro to SFMC Data Views' },
      { url: '/sfmc-overview', icon: '🚀', es: '¿Qué es Marketing Cloud Engagement?', en: 'What is Marketing Cloud Engagement?' }
    ],
    docs: [
      { url: 'https://help.salesforce.com/s/articleView?id=sf.c360_a_data_cloud.htm&type=5', icon: '☁️', es: 'Salesforce Help: Data Cloud Overview', en: 'Salesforce Help: Data Cloud Overview' },
      { url: 'https://trailhead.salesforce.com/en/search?keywords=data+cloud', icon: '🧭', es: 'Trailhead: Módulos de Data Cloud', en: 'Trailhead: Data Cloud Modules' }
    ]
  },
  'next-agentforce-campaigns': {
    tags: ['#agentforce', '#ai', '#autonomous-campaigns', '#einstein', '#prompt-studio'],
    related: [
      { url: '/next-datacloud-segments', icon: '🔮', es: 'Data Cloud: Segmentación en Tiempo Real', en: 'Data Cloud: Real-Time Segmentation' },
      { url: '/inno-ai', icon: '💡', es: 'Innovaciones: IA Generativa en SFMC', en: 'Innovations: Generative AI in SFMC' },
      { url: '/sfmc-overview', icon: '🚀', es: '¿Qué es Marketing Cloud Engagement?', en: 'What is Marketing Cloud Engagement?' }
    ],
    docs: [
      { url: 'https://www.salesforce.com/agentforce/', icon: '☁️', es: 'Salesforce: Plataforma Agentforce', en: 'Salesforce: Agentforce Platform' },
      { url: 'https://trailhead.salesforce.com/en/search?keywords=agentforce', icon: '🧭', es: 'Trailhead: Módulos de Agentforce', en: 'Trailhead: Agentforce Modules' }
    ]
  },
  'resources-links': {
    tags: ['#resources', '#documentation', '#tools', '#community', '#cheatsheet'],
    related: [
      { url: '/sfmc-overview', icon: '🚀', es: '¿Qué es Marketing Cloud Engagement?', en: 'What is Marketing Cloud Engagement?' },
      { url: '/ssjs-intro', icon: '⚡', es: 'Introducción a SSJS en SFMC', en: 'Introduction to SSJS in SFMC' },
      { url: '/amp-intro', icon: '⚡', es: 'Introducción a AMPscript', en: 'Introduction to AMPscript' }
    ],
    docs: [
      { url: 'https://developer.salesforce.com/docs/marketing/marketing-cloud/overview', icon: '☁️', es: 'Salesforce Developers: Portal de Marketing Cloud', en: 'Salesforce Developers: Marketing Cloud Portal' },
      { url: 'https://trailhead.salesforce.com/content/learn/trails/develop-for-marketing-cloud', icon: '🧭', es: 'Trailhead: Ruta de Desarrollador SFMC', en: 'Trailhead: Develop for SFMC Trail' }
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
    const tagClean = t.replace(/^#/, '');
    return `<a href="/catalog?tag=${encodeURIComponent(tagClean)}" class="tag${cls}">${t}</a>`;
  }).join('\n        ');

  const relatedHtml = meta.related.map(r => {
    return `        <a href="${r.url}" class="related-article-link" data-lang="es">
          <span class="related-article-icon">${r.icon}</span>
          <span class="related-article-text">${r.es}</span>
        </a>
        <a href="${r.url}" class="related-article-link" data-lang="en">
          <span class="related-article-icon">${r.icon}</span>
          <span class="related-article-text">${r.en}</span>
        </a>`;
  }).join('\n');

  const docsHtml = (meta.docs || []).map(d => {
    let iconImg = d.icon;
    if (d.url.includes('trailhead.salesforce.com')) {
      iconImg = '<img src="/assets/img/icons/trailhead.png" alt="Trailhead" />';
    } else if (d.url.includes('salesforce.com')) {
      iconImg = '<img src="/assets/img/icons/salesforce.svg" alt="Salesforce" />';
    }
    return `        <a href="${d.url}" target="_blank" rel="noopener noreferrer" class="related-article-link" data-lang="es">
          <span class="related-article-icon">${iconImg}</span>
          <span class="related-article-text">${d.es} <span class="external-icon">↗</span></span>
        </a>
        <a href="${d.url}" target="_blank" rel="noopener noreferrer" class="related-article-link" data-lang="en">
          <span class="related-article-icon">${iconImg}</span>
          <span class="related-article-text">${d.en} <span class="external-icon">↗</span></span>
        </a>`;
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

  // Replace everything from RELATED ARTICLES all the way to the end of the sidebar
  // This cleans up any duplicated or malformed cards completely.
  const sidebarSuffixRegex = /(?:<!--\s*3\.\s*RELATED ARTICLES[^>]*-->\s*)?<div class="sidebar-card">\s*<div class="sidebar-card-title"[^>]*>🔗 (?:ARTÍCULOS RELACIONADOS|RELATED ARTICLES)[\s\S]*?(?=<\/aside>)/;
  
  const newCards = `<!-- 3. RELATED ARTICLES -->
    <div class="sidebar-card">
      <div class="sidebar-card-title" data-lang="es">🔗 ARTÍCULOS RELACIONADOS</div>
      <div class="sidebar-card-title" data-lang="en">🔗 RELATED ARTICLES</div>
      <div class="related-articles-list">
${relatedHtml}
      </div>
    </div>

    <!-- 4. OFFICIAL DOCS -->
    <div class="sidebar-card">
      <div class="sidebar-card-title" data-lang="es">📚 DOCS OFICIALES</div>
      <div class="sidebar-card-title" data-lang="en">📚 OFFICIAL DOCS</div>
      <div class="related-articles-list">
${docsHtml}
      </div>
    </div>\n\n  `;

  if (sidebarSuffixRegex.test(content)) {
    content = content.replace(sidebarSuffixRegex, newCards);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated sidebar (tags, related, docs) for:', slug);
});
