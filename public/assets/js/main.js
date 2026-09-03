/* ==========================================
   MARKETING CLOUD ARCADE — Main JS
   ========================================== */

/* ── Theme (Dark / Light) ── */
const ThemeManager = (() => {
  const key = 'mca-theme';
  const btn = () => document.getElementById('theme-toggle');
  const icons = { dark: '☀️', light: '🌙' };

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(key, theme);
    const b = btn();
    if (b) b.textContent = icons[theme];
  }

  function toggle() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    apply(current === 'dark' ? 'light' : 'dark');
  }

  function init() {
    const saved = localStorage.getItem(key) || 'dark';
    apply(saved);
    const b = btn();
    if (b) b.addEventListener('click', toggle);
  }

  return { init, toggle, apply };
})();

/* ── Language (EN / ES) ── */
const LangManager = (() => {
  const key = 'mca-lang';

  function apply(lang) {
    localStorage.setItem(key, lang);

    // Update the anti-FOUC style rule first (hide the OTHER language)
    var hide = lang === 'es' ? 'en' : 'es';
    var foucStyle = document.getElementById('lang-fouc');
    if (foucStyle) {
      foucStyle.textContent = '[data-lang="' + hide + '"]{display:none!important}';
    }

    document.querySelectorAll('[data-lang]').forEach(el => {
      el.style.display = el.getAttribute('data-lang') === lang ? '' : 'none';
    });
    const switchEl = document.getElementById('nav-lang-switch');
    if (switchEl) {
      switchEl.checked = (lang === 'en');
    }
    document.documentElement.lang = lang;

    // --- Dynamic Title Translation ---
    if (lang === 'en') {
      document.title = document.title.replace('Catálogo', 'Catalog').replace('Sobre mí', 'About').replace('Inicio', 'Home');
    } else {
      document.title = document.title.replace('Catalog', 'Catálogo').replace('About', 'Sobre mí').replace('Home', 'Inicio');
    }

    // --- Dynamic Placeholder Translation ---
    const catalogSearch = document.getElementById('catalog-search');
    if (catalogSearch) {
      catalogSearch.placeholder = lang === 'es' ? 'Filtrar artículos...' : 'Filter articles...';
    }
    
    const navSearch = document.getElementById('nav-search');
    if (navSearch) {
      navSearch.placeholder = lang === 'es' ? 'Buscar... (Ctrl+K)' : 'Search... (Ctrl+K)';
    }

    const modalSearch = document.getElementById('search-input-modal');
    if (modalSearch) {
      modalSearch.placeholder = lang === 'es' ? 'Buscar artículos...' : 'Search articles...';
    }
  }

  function init() {
    const saved = localStorage.getItem(key) || 'es';
    apply(saved);
    const switchEl = document.getElementById('nav-lang-switch');
    if (switchEl) {
      switchEl.addEventListener('change', (e) => {
        apply(e.target.checked ? 'en' : 'es');
      });
    }
  }

  return { init, apply };
})();

/* ── Search ── */
const SearchManager = (() => {
  const categoryIcons = {
    ssjs: '⚡',
    ampscript: '<img src="/assets/img/icons/ampscript.png" alt="AMPscript" style="width:16px;height:16px;vertical-align:middle;">',
    sql: '<img src="/assets/img/icons/sql.png" alt="SQL" style="width:16px;height:16px;vertical-align:middle;">',
    innovations: '<img src="/assets/img/icons/innovations.jpg" alt="Innovations" style="width:16px;height:16px;vertical-align:middle;">',
    automation: '⚙️',
    journey: '🗺️',
    cloudpages: '☁️',
    resources: '🔗',
    changelog: '📋'
  };

  function getIcon(cat) {
    return categoryIcons[cat] || '🕹️';
  }

  const articles = [
    { title: 'What is Marketing Cloud Engagement? Complete Guide', title_es: '¿Qué es Marketing Cloud Engagement? Guía Completa', category: 'resources', level: 'beginner', url: '/sfmc-overview', id: 'sfmc-overview' },
    { title: 'Introduction to AMPscript: Complete Fundamentals Guide', title_es: 'Introducción a AMPscript: Guía Completa de Fundamentos', category: 'ampscript', level: 'beginner', url: '/amp-intro', id: 'amp-intro' },
    { title: 'SSJS: HTTP GET & POST Requests', title_es: 'SSJS: Peticiones HTTP GET y POST', category: 'ssjs', level: 'intermediate', url: '/ssjs-http', id: 'ssjs-http' },
    { title: 'SQL: Query Data Views Like a Pro', title_es: 'SQL: Consulta Data Views como un Pro', category: 'sql', level: 'intermediate', url: '/sql-dataviews', id: 'sql-dataviews' },
    { title: 'SSJS: Upsert Contacts via REST API', title_es: 'SSJS: Upsert de Contactos via REST API', category: 'ssjs', level: 'advanced', url: '/ssjs-upsert', id: 'ssjs-upsert' },
    { title: 'SSJS: Introduction to SSJS in SFMC', title_es: 'Introducción a SSJS en SFMC', category: 'ssjs', level: 'beginner', url: '/ssjs-intro', id: 'ssjs-intro' },
    { title: 'SSJS: Advanced Logging & Debugging', title_es: 'SSJS: Logging y Debugging avanzado', category: 'ssjs', level: 'intermediate', url: '/ssjs-debug', id: 'ssjs-debug' },
    { title: 'Journey Builder: API Entry Event', title_es: 'Journey Builder: API Entry Event', category: 'journey', level: 'advanced', url: '/jb-api-entry', id: 'jb-api-entry' },
    { title: 'Automation Studio: File Drop Pattern', title_es: 'Automation Studio: Patrón File Drop', category: 'automation', level: 'intermediate', url: '/auto-filedrop', id: 'auto-filedrop' },
    { title: 'Cloud Pages: Login & Token Auth', title_es: 'Cloud Pages: Login y Autenticación Token', category: 'cloudpages', level: 'advanced', url: '/cp-auth', id: 'cp-auth' },
    { title: 'SQL: Subscriber Engagement Score', title_es: 'SQL: Score de Engagement de Suscriptores', category: 'sql', level: 'intermediate', url: '/sql-engagement', id: 'sql-engagement' },
    { title: 'SQL: Advanced JOINs in Query Activities', title_es: 'SQL: JOINs avanzados en Query Activities', category: 'sql', level: 'advanced', url: '/sql-joins', id: 'sql-joins' },
    { title: 'Innovation: AI-Personalization with GPT', title_es: 'Innovación: Personalización con IA y GPT', category: 'innovations', level: 'advanced', url: '/inno-ai', id: 'inno-ai' },
    { title: 'Essential SFMC Resources', title_es: 'Recursos esenciales de SFMC', category: 'resources', level: 'beginner', url: '/resources-links', id: 'resources-links' },
    { title: 'Data Cloud: Real-Time Segmentation & Activation', title_es: 'Data Cloud: Segmentación en Tiempo Real y Activación', category: 'mc-next', level: 'intermediate', url: '/next-datacloud-segments', id: 'next-datacloud-segments' },
    { title: 'Agentforce for Marketing: Autonomous Campaigns & Prompt Studio', title_es: 'Agentforce for Marketing: Campañas Autónomas y Prompt Studio', category: 'mc-next', level: 'advanced', url: '/next-agentforce-campaigns', id: 'next-agentforce-campaigns' },
  ];

  // Expose to global scope for Firebase leaderboard
  window.MC_ARTICLES = articles;

  let overlay, input, results;
  let currentCatFilter = '';

  function render(query) {
    const lang = localStorage.getItem('mca-lang') || 'es';
    const q = (query || '').toLowerCase().trim();
    
    let filtered = articles;
    
    if (currentCatFilter) {
      filtered = filtered.filter(a => a.category === currentCatFilter);
    }
    
    if (q.length >= 2) {
      filtered = filtered.filter(a => {
        const t = lang === 'es' ? a.title_es : a.title;
        return t.toLowerCase().includes(q) || a.category.toLowerCase().includes(q);
      });
    } else if (!currentCatFilter) {
      filtered = filtered.slice(0, 6);
    }

    if (!results) return;

    if (filtered.length === 0) {
      results.innerHTML = `<div class="search-empty">${lang === 'es' ? '😅 Sin resultados' : '😅 No results'} ${q ? (lang === 'es' ? 'para' : 'for') + ' "' + query + '"' : ''}</div>`;
      return;
    }

    results.innerHTML = filtered.map(a => {
      const title = lang === 'es' ? a.title_es : a.title;
      const icon = getIcon(a.category);
      return `<a class="search-result-item" href="${a.url}">
        <span class="search-result-icon">${icon}</span>
        <div class="search-result-info">
          <div class="search-result-title">${title}</div>
          <div class="search-result-meta">${a.category} · ${a.level}</div>
        </div>
      </a>`;
    }).join('');
  }

  function open() {
    if (!overlay) return;
    overlay.classList.add('open');
    if (input) {
      input.value = '';
      input.focus();
    }
    currentCatFilter = '';
    document.querySelectorAll('.search-cat-btn').forEach(b => b.classList.remove('active'));
    render('');
  }

  function close() {
    if (!overlay) return;
    overlay.classList.remove('open');
  }

  function init() {
    overlay = document.getElementById('search-overlay');
    input = document.getElementById('search-input-modal');
    results = document.getElementById('search-results');

    // Open triggers
    document.querySelectorAll('[data-open-search]').forEach(el => {
      el.addEventListener('click', (e) => { e.preventDefault(); open(); });
    });

    // Navbar search bar
    const navSearch = document.getElementById('nav-search');
    if (navSearch) {
      navSearch.addEventListener('focus', open);
      navSearch.addEventListener('keydown', e => { if (e.key === 'Enter') open(); });
    }

    // Close on backdrop
    if (overlay) {
      overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    }

    // Input handler
    if (input) {
      input.addEventListener('input', () => render(input.value));
    }

    // Category filters
    document.querySelectorAll('.search-cat-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cat = e.currentTarget.getAttribute('data-cat');
        if (currentCatFilter === cat) {
          currentCatFilter = '';
          e.currentTarget.classList.remove('active');
        } else {
          currentCatFilter = cat;
          document.querySelectorAll('.search-cat-btn').forEach(b => b.classList.remove('active'));
          e.currentTarget.classList.add('active');
        }
        if (input) render(input.value);
        if (input) input.focus();
      });
    });

    // Keyboard shortcut Ctrl+K / Cmd+K
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); open(); }
      if (e.key === 'Escape') close();
    });
  }

  return { init, open, close };
})();

/* ── Reading Progress ── */
const ProgressBar = (() => {
  function init() {
    const bar = document.getElementById('reading-progress');
    if (!bar) return;

    function update() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = Math.min(100, pct) + '%';
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  return { init };
})();

/* ── Copy Code Buttons ── */
const CodeCopy = (() => {
  function init() {
    document.querySelectorAll('.code-copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const pre = btn.closest('.code-block').querySelector('pre');
        const text = pre ? pre.innerText : '';
        navigator.clipboard.writeText(text).then(() => {
          const originalHTML = btn.innerHTML;
          btn.innerHTML = '✅ Copied!';
          btn.classList.add('copied');
          setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.classList.remove('copied');
          }, 2000);
        }).catch(() => {
          // fallback
          const ta = document.createElement('textarea');
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        });
      });
    });
  }

  return { init };
})();

/* ── Konami Code Easter Egg ── */
const KonamiEgg = (() => {
  const CODE = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let idx = 0;

  function trigger() {
    const toast = document.getElementById('konami-toast');
    if (!toast) return;
    toast.classList.add('show');
    // pixel rain effect
    document.body.style.animation = 'none';
    setTimeout(() => { toast.classList.remove('show'); }, 4000);
    // Easter egg: extra lives
    const score = document.getElementById('player-score');
    if (score) {
      const v = parseInt(score.textContent.replace(/,/g,'')) || 0;
      score.textContent = (v + 9999).toLocaleString();
    }
  }

  function init() {
    document.addEventListener('keydown', e => {
      if (e.key === CODE[idx]) {
        idx++;
        if (idx === CODE.length) { trigger(); idx = 0; }
      } else {
        idx = 0;
      }
    });
  }

  return { init };
})();

/* ── Animated Counters ── */
const Counters = (() => {
  function animateCount(el) {
    const target = parseInt(el.getAttribute('data-target') || el.textContent.replace(/[^0-9]/g,''));
    const duration = 1500;
    const start = performance.now();
    el.setAttribute('data-target', target);

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  function init() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-counter]').forEach(el => observer.observe(el));
  }

  return { init };
})();

/* ── Fake Views Randomizer (Removed, using Real Firebase data) ── */

/* ── Table of Contents Active State ── */
function initTOC() {
  const tocLinks = document.querySelectorAll('.toc-list a');
  if (!tocLinks.length) return;

  function updateActive() {
    const headings = Array.from(document.querySelectorAll('.article-content h2, .article-content h3'))
      .filter(h => h.offsetParent !== null && h.id);
    if (!headings.length) return;

    let currentId = '';
    for (let i = 0; i < headings.length; i++) {
      const top = headings[i].getBoundingClientRect().top;
      if (top <= 140) {
        currentId = headings[i].id;
      } else {
        break;
      }
    }

    if (!currentId && headings.length > 0) {
      currentId = headings[0].id;
    }

    if (currentId) {
      tocLinks.forEach(a => {
        const href = a.getAttribute('href');
        const isActive = href === '#' + currentId;
        a.classList.toggle('active', isActive);
      });
    }
  }

  tocLinks.forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
          history.pushState(null, null, href);
          tocLinks.forEach(link => link.classList.remove('active'));
          a.classList.add('active');
        }
      }
    });
  });

  window.addEventListener('scroll', updateActive, { passive: true });
  window.addEventListener('resize', updateActive, { passive: true });
  updateActive();
}
window.initTOC = initTOC;

/* ── Navbar Active State ── */
function initNavbarActive() {
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  const params = new URLSearchParams(window.location.search);
  const currentCat = params.get('cat');
  
  document.querySelectorAll('.navbar-links a').forEach(link => {
    link.classList.remove('active');
    
    const linkHref = link.getAttribute('href');
    if (!linkHref) return;
    const [linkPath, linkSearch] = linkHref.split('?');
    const normalizedLinkPath = linkPath.replace(/\/$/, '') || '/';
    const linkParams = new URLSearchParams(linkSearch || '');
    const linkCat = linkParams.get('cat');
    
    if (linkCat) {
      // Match specific category link (e.g. /catalog?cat=ssjs)
      if (currentPath === normalizedLinkPath && currentCat === linkCat) {
        link.classList.add('active');
      }
    } else {
      // Match base path link (e.g. /catalog or / or /about)
      if (currentPath === normalizedLinkPath) {
        if (currentPath === '/catalog') {
          // On catalog: active if no category is specified or cat=all
          if (!currentCat || currentCat === 'all') {
            link.classList.add('active');
          }
        } else {
          link.classList.add('active');
        }
      }
    }
  });
}
window.initNavbarActive = initNavbarActive;

/* ── Boot ── */
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  LangManager.init();
  SearchManager.init();
  ProgressBar.init();
  CodeCopy.init();
  KonamiEgg.init();
  Counters.init();
  initTOC();
  initNavbarActive();

  // Seamless client-side navbar category switching when already on /catalog
  document.addEventListener('click', (e) => {
    const navLink = e.target.closest('.navbar-links a');
    if (!navLink) return;
    const href = navLink.getAttribute('href');
    if (!href) return;

    const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
    const [linkPath, linkSearch] = href.split('?');
    const normalizedLinkPath = linkPath.replace(/\/$/, '') || '/';

    if (currentPath === '/catalog' && normalizedLinkPath === '/catalog' && typeof window.filterCat === 'function') {
      e.preventDefault();
      const linkParams = new URLSearchParams(linkSearch || '');
      const cat = linkParams.get('cat') || 'all';
      window.filterCat(null, cat);
    }
  });

  // Inject Global Favicon
  if (!document.querySelector('link[rel="icon"]')) {
    const isSubpage = window.location.pathname.toLowerCase().includes('/pages/');
    const basePath = isSubpage ? '../' : './';
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/png';
    favicon.href = basePath + 'assets/img/logo-favicon/favicon.png';
    document.head.appendChild(favicon);
  }
});

