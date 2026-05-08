(function() {
  const isSubpage = window.location.pathname.toLowerCase().includes('/pages/');
  const basePath = isSubpage ? '../' : './';

  const navbarHtml = `
<nav class="navbar">
  <a class="navbar-logo" href="${basePath}index.html">
    <div class="navbar-logo-icon">🕹️</div>
    <div class="navbar-logo-text">MARKETING CLOUD<span>ARCADE</span></div>
  </a>
  <div class="navbar-search">
    <span class="navbar-search-icon">🔍</span>
    <input id="nav-search" type="text" placeholder="Search... (Ctrl+K)" readonly data-open-search />
  </div>
  <div class="navbar-spacer"></div>
  <ul class="navbar-links">
    <li><a href="${basePath}index.html" data-lang="es">Inicio</a><a href="${basePath}index.html" data-lang="en">Home</a></li>
    <li><a href="${basePath}pages/catalog.html" data-lang="es">Catálogo</a><a href="${basePath}pages/catalog.html" data-lang="en">Catalog</a></li>
    <li><a href="${basePath}pages/catalog.html?cat=ssjs">SSJS</a></li>
    <li><a href="${basePath}pages/catalog.html?cat=ampscript">AMPscript</a></li>
    <li><a href="${basePath}pages/catalog.html?cat=sql">SQL</a></li>
    <li><a href="${basePath}pages/catalog.html?cat=innovations" data-lang="es">Innovaciones</a><a href="${basePath}pages/catalog.html?cat=innovations" data-lang="en">Innovations</a></li>
    <li><a href="${basePath}pages/about.html" data-lang="es">Sobre mí</a><a href="${basePath}pages/about.html" data-lang="en">About</a></li>
  </ul>
  <div class="navbar-actions">
    <div class="nav-arcade-toggle">
      <input type="checkbox" id="nav-lang-switch">
      <label for="nav-lang-switch" class="arcade-track">
        <div class="arcade-slider"></div>
        <span class="lang-text text-es">ES</span>
        <span class="lang-text text-en">EN</span>
      </label>
    </div>
    <button class="btn-icon" id="theme-toggle" title="Toggle theme">🌙</button>
    <a class="btn-icon" href="https://github.com/" title="GitHub" target="_blank" rel="noopener">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
    </a>
  </div>
</nav>
  `;

  const footerHtml = `
<footer class="footer">
  <div class="footer-inner">
    <div>
      <div class="footer-brand-name">🕹️ MARKETING CLOUD ARCADE</div>
      <p class="footer-brand-desc" data-lang="es">
        Base de conocimiento comunitaria para profesionales de Salesforce Marketing Cloud.
        Aprende, comparte y contribuye.
      </p>
      <p class="footer-brand-desc" data-lang="en">
        Community knowledge base for Salesforce Marketing Cloud professionals.
        Learn, share and contribute.
      </p>
    </div>
    <div class="footer-links-grid">
      <div>
        <div class="footer-links-title" data-lang="es">Contenido</div>
        <div class="footer-links-title" data-lang="en">Content</div>
        <ul class="footer-links-list">
          <li><a href="${basePath}pages/catalog.html?cat=ssjs">SSJS</a></li>
          <li><a href="${basePath}pages/catalog.html?cat=ampscript">AMPscript</a></li>
          <li><a href="${basePath}pages/catalog.html?cat=sql">SQL Data Views</a></li>
          <li><a href="${basePath}pages/catalog.html?cat=automation">Automation Studio</a></li>
          <li><a href="${basePath}pages/catalog.html?cat=journey">Journey Builder</a></li>
        </ul>
      </div>
      <div>
        <div class="footer-links-title" data-lang="es">Más</div>
        <div class="footer-links-title" data-lang="en">More</div>
        <ul class="footer-links-list">
          <li><a href="${basePath}pages/catalog.html?cat=cloudpages">Cloud Pages</a></li>
          <li><a href="${basePath}pages/catalog.html?cat=innovations" data-lang="es">Innovaciones</a><a href="${basePath}pages/catalog.html?cat=innovations" data-lang="en">Innovations</a></li>
          <li><a href="${basePath}pages/catalog.html?cat=resources" data-lang="es">Recursos</a><a href="${basePath}pages/catalog.html?cat=resources" data-lang="en">Resources</a></li>
          <li><a href="${basePath}pages/catalog.html?cat=changelog">Changelog</a></li>
        </ul>
      </div>
      <div>
        <div class="footer-links-title" data-lang="es">Proyecto</div>
        <div class="footer-links-title" data-lang="en">Project</div>
        <ul class="footer-links-list">
          <li><a href="https://github.com/" target="_blank">GitHub</a></li>
          <li><a href="${basePath}pages/article.html" data-lang="es">Cómo contribuir</a><a href="${basePath}pages/article.html" data-lang="en">How to contribute</a></li>
          <li><a href="${basePath}pages/article.html" data-lang="es">Guía de estilo</a><a href="${basePath}pages/article.html" data-lang="en">Style guide</a></li>
        </ul>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <a href="${basePath}index.html" style="display:flex;align-items:center;gap:0.5rem;color:var(--text-muted);font-family:var(--font-arcade);font-size:0.45rem;">🕹️ MARKETING CLOUD ARCADE</a>
    <span data-lang="es">© 2025 Holwan David Montes · Hecho para la comunidad SFMC</span>
    <span data-lang="en">© 2025 Holwan David Montes · Made for the SFMC community</span>
  </div>
</footer>
  `;

  const overlaysHtml = `
<div id="search-overlay" class="search-overlay">
  <div class="search-modal">
    <div class="search-modal-input-wrap">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <input id="search-input-modal" class="search-modal-input" type="text" placeholder="Buscar... / Search..." />
      <span style="font-family:var(--font-mono);font-size:0.7rem;color:var(--text-muted);">ESC</span>
    </div>
    <div id="search-results" class="search-results"></div>
  </div>
</div>
<div id="konami-toast">🕹️ ¡CÓDIGO KONAMI! +9999 XP</div>
  `;

  // Inject into DOM
  const navContainer = document.getElementById('dynamic-navbar');
  if (navContainer) {
    navContainer.outerHTML = navbarHtml;
  }

  const footerContainer = document.getElementById('dynamic-footer');
  if (footerContainer) {
    footerContainer.outerHTML = footerHtml;
  }

  const overlaysContainer = document.getElementById('dynamic-overlays');
  if (overlaysContainer) {
    overlaysContainer.outerHTML = overlaysHtml;
  }
})();
