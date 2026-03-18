const STORAGE_KEY = "mca_completed_docs";
let completedDocs = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

function toggleDocCompletion(levelId) {
  if (completedDocs.includes(levelId)) {
    completedDocs = completedDocs.filter((id) => id !== levelId);
  } else {
    completedDocs.push(levelId);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(completedDocs));
  updateProgressUI();
}

function updateProgressUI() {
  const docItems = document.querySelectorAll("#docs-nav li.doc-level-item");
  let validCompletedCount = 0;

  docItems.forEach((li) => {
    const id = li.getAttribute("data-level");
    if (completedDocs.includes(id)) {
      li.classList.add("completed");
      validCompletedCount++;
    } else {
      li.classList.remove("completed");
    }
  });

  const total = docItems.length;
  let percentage = 0;
  if (total > 0) percentage = Math.round((validCompletedCount / total) * 100);

  const progressBar = document.getElementById("progress-bar");
  const progressText = document.getElementById("progress-text");

  if (progressBar && progressText) {
    progressBar.style.width = percentage + "%";
    progressText.innerText = "Progress: " + percentage + "%";
  }

  const currentActiveLevel = document
    .querySelector("#docs-nav .doc-level-item.active")
    ?.getAttribute("data-level");
  updateDocPaneButtonState(currentActiveLevel);
}

function updateDocPaneButtonState(levelId) {
  const btn = document.getElementById("mark-complete-btn");
  if (!btn || !levelId) return;

  if (completedDocs.includes(levelId)) {
    btn.innerText = "✓ COMPLETED";
    btn.classList.add("completed-state");
  } else {
    btn.innerText = "MARK AS COMPLETED";
    btn.classList.remove("completed-state");
  }
}

let docsData = {};
let blogData = [];

// Simple HTML Sanitizer to strip dangerous tags (e.g. scripts)
function sanitizeHTML(str) {
  if (!str) return "";
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "");
}

// DataProvider Pattern for Wix-readiness
const DataProvider = {
  async local() {
    const [dRes, bRes] = await Promise.all([
      fetch("./data/docs.json"),
      fetch("./data/blog.json"),
    ]);
    if (!dRes.ok || !bRes.ok) throw new Error("File not found");
    const dJson = await dRes.json();
    const bJson = await bRes.json();
    return {
      docsData: dJson.docsData || dJson,
      blogData: bJson.blogData || bJson,
    };
  },
  async wix() {
    // Placeholder for Wix Velo:
    // const dFiles = await wixData.query("Docs").find();
    // return { docsData: dFiles.items, ... }
    console.warn("Wix DataProvider not yet implemented.");
    return { docsData: {}, blogData: [] };
  },
};

async function fetchSystemData() {
  try {
    const { docsData: d, blogData: b } = await DataProvider.local(); // Switch to .wix() later
    // Basic validation & default falbacks
    Object.keys(d).forEach((k) => {
      docsData[k] = {
        title: d[k].title || "Unknown Record",
        desc: d[k].desc || "",
        tags: d[k].tags || [],
        tabTitle: d[k].tabTitle || k,
        code: d[k].code || "",
        best: d[k].best || [],
        mistakes: d[k].mistakes || [],
        filename: d[k].filename || "sys.exe",
        difficulty: d[k].difficulty || "Lv1",
        estTime: d[k].estTime || "-- mins",
        world: d[k].world || "World ?",
        officialAlignment: d[k].officialAlignment || "",
        learningGroup: d[k].learningGroup || "Uncategorized",
        overview: d[k].overview || null,
        whyItMatters: d[k].whyItMatters || null,
        howItWorks: d[k].howItWorks || null,
        whenToUse: d[k].whenToUse || null,
        references: d[k].references || null,
        images: d[k].images || null
      };
    });
    blogData = b
      .filter((p) => p.id && p.title)
      .map((p) => ({
        ...p,
        content: sanitizeHTML(p.content),
      }));

    renderDocsSidebar();
    renderBlogGrid();
    checkHashUrlForDeepLink(); // Trigger deep-link after data loads
  } catch (e) {
    console.error("Transmission Error:", e);
    const docsNav = document.getElementById("docs-nav");
    if (docsNav) {
      docsNav.innerHTML = `<li class="corrupt-data">[ ERR 404: MODULE CORRUPTED ]</li>`;
    }
    const blogGrid = document.getElementById("blog-grid");
    if (blogGrid) {
      blogGrid.innerHTML = `<p class="corrupt-data" style="grid-column: 1 / -1; text-align: center;">Transmission failed. Retry sequence initiated...</p>`;
    }
  }
}

function renderDocsSidebar() {
  const navContainer = document.getElementById("docs-nav");
  if (!navContainer) return;

  navContainer.innerHTML = ""; // Clear loader

  // Re-select UI elements since they are recreated
  const docsTags = document.querySelectorAll(".tag-btn");
  let activeTag = "all";
  docsTags.forEach((bt) => {
    if (bt.getAttribute("aria-pressed") === "true")
      activeTag = bt.getAttribute("data-tag");
  });

  const categories = {};
  const order = [
    "Foundations", "Data & SQL", "Content & Personalization", 
    "Development", "Automation & Journeys", "Integrations / API", 
    "Deliverability", "Security & Governance", "Troubleshooting"
  ];

  // Initialize ordered categories to keep the render order exact
  order.forEach(cat => categories[cat] = []);

  Object.entries(docsData).forEach(([levelKey, levelObj]) => {
    const mainCategory = levelObj.learningGroup || "Uncategorized";
    if (!categories[mainCategory]) categories[mainCategory] = [];
    categories[mainCategory].push({ levelKey, levelObj });
  });

  Object.entries(categories).forEach(([catName, items]) => {
    if (items.length === 0) return; // Skip empty groups
    
    const catLi = document.createElement("li");
    catLi.className = "category-group";

    const catHeader = document.createElement("div");
    catHeader.className = "category-header collapsed-header";
    catHeader.innerHTML = `<span>${catName}</span> <span class="chevron">▼</span>`;
    
    const nestedUl = document.createElement("ul");
    nestedUl.className = "nested-list collapsed";

    catHeader.addEventListener("click", () => {
      // Accordion logic: close all others first
      document.querySelectorAll(".nested-list").forEach(list => {
        if (list !== nestedUl) list.classList.add("collapsed");
      });
      document.querySelectorAll(".category-header").forEach(header => {
        if (header !== catHeader) header.classList.add("collapsed-header");
      });
      
      // Then toggle the clicked one
      nestedUl.classList.toggle("collapsed");
      catHeader.classList.toggle("collapsed-header");
    });
    
    catLi.appendChild(catHeader);

    let hasVisibleItems = false;

    items.forEach(({ levelKey, levelObj }) => {
      const li = document.createElement("li");
      li.className = "doc-level-item";
      li.setAttribute("data-level", levelKey);
      li.setAttribute("data-tags", (levelObj.tags || []).join(","));
      li.setAttribute("data-group", (levelObj.learningGroup || "Uncategorized").toLowerCase());
      li.setAttribute("role", "tab");
      li.tabIndex = 0;

      // Check filter on render to avoid flash of content
      const tags = levelObj.tags || [];
      const group = (levelObj.learningGroup || "Uncategorized").toLowerCase();
      const matchesTag = activeTag === "all" || 
                         tags.some(t => t.toLowerCase() === activeTag.toLowerCase()) ||
                         group.includes(activeTag.toLowerCase());
                         
      if (!matchesTag) li.classList.add("hidden");
      else hasVisibleItems = true;

      li.innerHTML = `<span class="status-dot"></span> ${levelObj.tabTitle}`;

      li.addEventListener("click", (e) => { e.stopPropagation(); selectDocCategory(li, levelKey); });
      li.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectDocCategory(li, levelKey);
        }
      });

      nestedUl.appendChild(li);
    });

    if (!hasVisibleItems) catLi.classList.add("hidden");

    catLi.appendChild(nestedUl);
    navContainer.appendChild(catLi);
  });

  updateProgressUI();

  // Select default category only if not directly deeper linking to docs
  const hash = window.location.hash;
  if (!hash.startsWith("#docs/")) {
      const firstVisible = navContainer.querySelector(".doc-level-item:not(.hidden)");
      if (firstVisible) {
        const levelKey = firstVisible.getAttribute("data-level");
        selectDocCategory(firstVisible, levelKey, false);
      }
  }
}

function renderBlogGrid() {
  const blogGrid = document.getElementById("blog-grid");
  if (!blogGrid) return;
  blogGrid.innerHTML = "";

  blogData.forEach((post, i) => {
    const article = document.createElement("article");
    article.className = "blog-card";
    article.tabIndex = 0;

    // Construct Badges
    const badgeDiff = post.difficulty
      ? `<span class="badge badge-diff">${post.difficulty}</span>`
      : "";
    const badgeTime = post.estTime
      ? `<span class="badge badge-time">${post.estTime}m</span>`
      : "";
    const badgeWorld = post.series
      ? `<span class="badge badge-world">${post.series}</span>`
      : "";

    article.innerHTML = `
      <div class="card-meta">${post.date}</div>
      <h3>${post.title}</h3>
      <div class="badge-group" style="margin-top:0.5rem">
        ${badgeWorld} ${badgeDiff} ${badgeTime}
      </div>
      <p>${post.summary}</p>
      <div style="text-align: left">
        <!-- store raw index and stable slug for modal trigger and deep link -->
        <button class="btn btn-sm btn-outline read-btn" aria-label="Read ${post.title}" data-index="${i}" data-slug="${post.slug}">Read Record</button>
      </div>
    `;
    blogGrid.appendChild(article);
  });
}

// Move variables to global scope for module access
function selectDocCategory(item, levelId, pushHistory = true) {
  const activeLi = document.querySelector("#docs-nav .doc-level-item.active");
  if (activeLi) activeLi.classList.remove("active");

  const ariaSelected = document.querySelector(
    '#docs-nav .doc-level-item[aria-selected="true"]',
  );
  if (ariaSelected) ariaSelected.setAttribute("aria-selected", "false");

  item.classList.add("active");
  item.setAttribute("aria-selected", "true");

  const data = docsData[levelId];
  if (pushHistory && data && data.slug) {
      const targetHash = `#docs/${data.slug}`;
      if (window.location.hash !== targetHash) {
          window.history.pushState(null, null, targetHash);
      }
  }
  
  renderDocPane(data, levelId);
}

function renderDocPane(data, levelId) {
  if (!data) return;
  const docsContentArea = document.getElementById("docs-content-area");
  if (!docsContentArea) return;

  const bestLists = data.best.map((b) => `<li>${b}</li>`).join("");
  const mistakeLists = data.mistakes.map((m) => `<li>${m}</li>`).join("");
  const escapedCode = data.code.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const whenToUse = data.whenToUse || "Read the description for context.";

  const html = `
    <div class="doc-pane active">
      <div class="doc-header">
        <h3>${data.title}</h3>
        <button id="mark-complete-btn" class="btn-complete" aria-label="Mark level completed">MARK AS COMPLETED</button>
      </div>
      <div class="badge-group">
        <span class="badge badge-world">${data.world}</span>
        <span class="badge badge-diff">${data.difficulty}</span>
        <span class="badge badge-time">${data.estTime}</span>
      </div>
      <p class="doc-desc">${data.desc}</p>
      
      ${data.overview ? `<h4>Overview</h4><p class="doc-section-text">${data.overview}</p>` : ''}
      
      ${data.whyItMatters ? `<h4>Why it matters in SFMC</h4><p class="doc-section-text">${data.whyItMatters}</p>` : ''}
      
      ${data.howItWorks ? `<h4>How it works</h4><p class="doc-section-text">${data.howItWorks}</p>` : ''}

      ${data.whenToUse ? `<h4>When to use this approach</h4><p class="doc-section-text">${data.whenToUse}</p>` : ''}

      ${data.code ? `<h4>Example Implementation</h4>
      <div class="retro-terminal">
        <div class="terminal-header">
          <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
          <span class="term-title">${data.filename}</span>
          <button class="copy-btn" aria-label="Copy code block">Copy</button>
        </div>
        <pre><code id="current-code-block">${escapedCode}</code></pre>
      </div>` : ''}
      
      ${data.images && data.images.length > 0 ? `
      <h4>Visual Reference</h4>
      ${data.images.map(img => `
        <figure class="doc-image-figure">
          <img src="${img.src}" alt="${img.alt || 'Documentation visual'}" class="doc-image" />
          ${img.caption ? `<figcaption class="doc-image-caption">${img.caption}</figcaption>` : ''}
        </figure>
      `).join('')}
      ` : ''}
      
      ${bestLists ? `<h4>Best Practices</h4><ul>${bestLists}</ul>` : ''}
      
      ${mistakeLists ? `<h4>Common Mistakes</h4><ul>${mistakeLists}</ul>` : ''}
      
      ${data.references && data.references.length > 0 ? `
      <h4>Official Documentation & References</h4>
      <ul class="doc-references">
        ${data.references.map(ref => `<li><a href="${ref.url}" target="_blank" rel="noopener noreferrer" class="retro-link">${ref.label} ↗</a></li>`).join('')}
      </ul>
      ` : ''}
    </div>
  `;

  docsContentArea.innerHTML = html;
  updateDocPaneButtonState(levelId);

  const markCompleteBtn = document.getElementById("mark-complete-btn");
  if (markCompleteBtn) {
    markCompleteBtn.addEventListener("click", () =>
      toggleDocCompletion(levelId),
    );
  }

  const copyBtn = document.querySelector(".copy-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(
          escapedCode.replace(/&lt;/g, "<").replace(/&gt;/g, ">"),
        );
        copyBtn.innerText = "Copied!";
        copyBtn.classList.add("copied");
        setTimeout(() => {
          copyBtn.innerText = "Copy";
          copyBtn.classList.remove("copied");
        }, 2000);
      } catch (e) {
        copyBtn.innerText = "Error";
      }
    });
  }
}

let currentBlogIndex = 0;

document.addEventListener("DOMContentLoaded", () => {
  const crtToggle = document.getElementById("crt-toggle");
  const scanlines = document.getElementById("scanlines");

  if (crtToggle && scanlines) {
    crtToggle.addEventListener("change", (e) => {
      if (e.target.checked) scanlines.classList.add("active");
      else scanlines.classList.remove("active");
    });
  }


  // --- LÓGICA DE DARK / LIGHT MODE (Píxeles Orgánicos) ---
  const themeToggleBtn = document.getElementById("theme-toggle");
  const grid = document.getElementById("pixel-grid");
  let isAnimatingTheme = false;

  // Tamaño de cada "píxel" en pantalla.
  // 30px es un buen balance entre el look retro y rendimiento.
  const PIXEL_SIZE = 8;

  if (themeToggleBtn && grid) {
    themeToggleBtn.addEventListener('click', () => {
        if (isAnimatingTheme) return;
        isAnimatingTheme = true;

        const isLightMode = document.body.classList.contains('light-mode');
        
        // 1. Saber de qué color es el fondo actual antes de cambiarlo
        const currentColor = isLightMode ? '#f0f0f5' : '#0f0f1b';
        
        // Le decimos a la cuadrícula que use ese color
        grid.style.setProperty('--pixel-color', currentColor);

        // 2. Calcular cuántos píxeles caben en la pantalla
        const cols = Math.ceil(window.innerWidth / PIXEL_SIZE);
        const rows = Math.ceil(window.innerHeight / PIXEL_SIZE);
        const totalPixels = cols * rows;

        // Limpiamos la cuadrícula por si acaso
        grid.innerHTML = '';

        // 3. Crear los bloques (píxeles)
        const pixels = [];
        for (let i = 0; i < totalPixels; i++) {
            const p = document.createElement('div');
            p.classList.add('pixel');
            p.style.width = `${PIXEL_SIZE}px`;
            p.style.height = `${PIXEL_SIZE}px`;
            grid.appendChild(p);
            pixels.push(p);
        }

        // 4. Cambiamos el tema real por debajo ¡INSTANTÁNEAMENTE!
        // (El usuario no lo verá porque la pantalla está cubierta de píxeles del color anterior)
        if (isLightMode) {
            document.body.classList.remove('light-mode');
            themeToggleBtn.innerText = '☀️';
        } else {
            document.body.classList.add('light-mode');
            themeToggleBtn.innerText = '🌙';
        }

        // 5. La magia: Hacer desaparecer los píxeles con retrasos aleatorios
        // Para dar el efecto de "cascada degradada", sumamos la fila actual + un número aleatorio
        
        // Timeout para asegurar que el navegador renderice la cuadrícula antes de ocultarla
        setTimeout(() => {
            pixels.forEach((pixel, index) => {
                const currentRow = Math.floor(index / cols);
                
                // baseDelay: Hace que los de arriba empiecen a desaparecer antes que los de abajo
                const baseDelay = (currentRow / rows) * 400; // 400ms de cascada
                
                // randomDelay: Le da ese aspecto caótico de la imagen que me pasaste
                const randomDelay = Math.random() * 500; // 500ms de caos puro
                
                const totalDelay = baseDelay + randomDelay;

                setTimeout(() => {
                    pixel.classList.add('hidden');
                }, totalDelay);
            });
        }, 50); // Mínimo reflow delay

        // 6. Limpiar el DOM después de que termine la animación
        // 400 (base) + 500 (random) + 300 (transición css) + 50 (reflow) = 1250ms aprox.
        setTimeout(() => {
            grid.innerHTML = '';
            isAnimatingTheme = false;
        }, 1300);
    });
  }

  const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
  const navLinksContainer = document.getElementById("nav-links");

  if (mobileMenuToggle && navLinksContainer) {
    mobileMenuToggle.addEventListener("click", () => {
      const isExpanded =
        mobileMenuToggle.getAttribute("aria-expanded") === "true";
      mobileMenuToggle.setAttribute("aria-expanded", !isExpanded);
      navLinksContainer.classList.toggle("open");
    });
  }

  // Re-declare variables used by the modal since they were moved inside DOMContentLoaded listener early but needed globally inside modal functions
  const modal = document.getElementById("blog-modal");
  const btnNext = document.getElementById("modal-next");
  const btnPrev = document.getElementById("modal-prev");
  const closeBtn = document.querySelector(".close-modal");

  document.querySelectorAll(".nav-link, .cta-group a").forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href.startsWith("#")) {
        e.preventDefault();
        const targetSec = document.getElementById(href.substring(1));
        if (targetSec) {
          targetSec.scrollIntoView({ behavior: "smooth" });
          if (
            navLinksContainer &&
            navLinksContainer.classList.contains("open")
          ) {
            navLinksContainer.classList.remove("open");
            mobileMenuToggle.setAttribute("aria-expanded", "false");
          }
        }
      }
    });
  });

  const sections = document.querySelectorAll(".section");
  const navItems = document.querySelectorAll(".nav-link");
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          navItems.forEach((nav) => nav.classList.remove("active"));
          const activeNav = document.querySelector(
            '.nav-links a[href="#' + id + '"]',
          );
          if (activeNav) activeNav.classList.add("active");
        }
      });
    },
    { rootMargin: "-50% 0px -50% 0px", threshold: 0 },
  );
  sections.forEach((sec) => sectionObserver.observe(sec));

  const backToTopBtn = document.getElementById("back-to-top");
  if (backToTopBtn) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) {
        backToTopBtn.classList.add("visible");
        backToTopBtn.removeAttribute("hidden");
      } else {
        backToTopBtn.classList.remove("visible");
        backToTopBtn.setAttribute("hidden", "true");
      }
    });
    backToTopBtn.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" }),
    );
  }

  const docsNavItems = document.querySelectorAll("#docs-nav .doc-level-item");
  const docsContentArea = document.getElementById("docs-content-area");
  const docsSearch = document.getElementById("docs-search");
  const docsTags = document.querySelectorAll(".tag-btn");

  updateProgressUI();

  function filterDocs() {
    if (!docsSearch) return;
    const searchTerm = docsSearch.value.toLowerCase();
    let activeTag = "all";
    docsTags.forEach((bt) => {
      if (bt.getAttribute("aria-pressed") === "true")
        activeTag = bt.getAttribute("data-tag");
    });

    const categories = document.querySelectorAll(".category-group");
    categories.forEach(cat => {
      let hasVisibleChild = false;
      const items = cat.querySelectorAll(".doc-level-item");
      
      items.forEach((li) => {
        const text = li.innerText.toLowerCase();
        const tagsStr = li.getAttribute("data-tags") || "";
        const tags = tagsStr.toLowerCase().split(",");
        const group = li.getAttribute("data-group") || "";

        const matchesSearch = text.includes(searchTerm);
        const matchesTag = activeTag === "all" || 
                           tags.some(t => t === activeTag.toLowerCase()) ||
                           group.includes(activeTag.toLowerCase());

        if (matchesSearch && matchesTag) {
          li.classList.remove("hidden");
          hasVisibleChild = true;
        } else {
          li.classList.add("hidden");
        }
      });

      if (hasVisibleChild) {
        cat.classList.remove("hidden");
        if (searchTerm.length > 0) {
            const nestedList = cat.querySelector(".nested-list");
            const header = cat.querySelector(".category-header");
            if (nestedList) nestedList.classList.remove("collapsed");
            if (header) header.classList.remove("collapsed-header");
        }
      } else {
        cat.classList.add("hidden");
      }
    });
  }

  if (docsSearch) docsSearch.addEventListener("input", filterDocs);

  docsTags.forEach((btn) => {
    btn.addEventListener("click", () => {
      docsTags.forEach((b) => b.setAttribute("aria-pressed", "false"));
      btn.setAttribute("aria-pressed", "true");
      filterDocs();
    });
  });

  // Function moved to global scope
  // Function moved to global scope

  // Let's attach exactly one event listener via event delegation to the grid
  const blogGrid = document.getElementById("blog-grid");
  if (blogGrid) {
    blogGrid.addEventListener("click", (e) => {
      if (e.target && e.target.classList.contains("read-btn")) {
        const index = e.target.getAttribute("data-index");
        if (index !== null) {
          openBlogModal(parseInt(index, 10));
        }
      }
    });

    // Also handle keyboard events bubbling up from the cards
    blogGrid.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const focusedEl = document.activeElement;
        // If they enter on a blog card directly
        if (focusedEl && focusedEl.classList.contains("blog-card")) {
          const btn = focusedEl.querySelector(".read-btn");
          if (btn) {
            const index = btn.getAttribute("data-index");
            if (index !== null) openBlogModal(parseInt(index, 10));
          }
        }
      }
    });
  }

  function openBlogModal(index) {
    if (!modal || !blogData[index]) return;
    currentBlogIndex = index;

    // Push the state to URL
    const slug = blogData[index].slug || `post-${index}`;
    if (window.location.hash !== `#blog/${slug}`) {
      window.history.pushState(null, null, `#blog/${slug}`);
    }

    document.getElementById("modal-title").innerText = blogData[index].title;
    document.getElementById("modal-meta").innerText = blogData[index].date;
    document.getElementById("modal-body").innerHTML = blogData[index].content;

    btnPrev.disabled = currentBlogIndex === 0;
    btnNext.disabled = currentBlogIndex === blogData.length - 1;

    btnPrev.style.opacity = btnPrev.disabled ? "0.3" : "1";
    btnNext.style.opacity = btnNext.disabled ? "0.3" : "1";

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
  }

  // Deep linking helper
  window.checkHashUrlForDeepLink = function () {
    const hash = window.location.hash;
    
    // Blog routing
    if (hash.startsWith("#blog/")) {
      const slug = hash.replace("#blog/", "");
      const index = blogData.findIndex(
        (p) => p.slug === slug || `post-${blogData.indexOf(p)}` === slug,
      );
      if (index !== -1) openBlogModal(index);
    }
    
    // Docs routing
    else if (hash.startsWith("#docs/")) {
      const slug = hash.replace("#docs/", "");
      let targetLevelId = null;
      for (const [key, doc] of Object.entries(docsData)) {
        if (doc.slug === slug || key === slug) {
            targetLevelId = key;
            break;
        }
      }
      
      if (targetLevelId) {
          const docItem = document.querySelector(`#docs-nav .doc-level-item[data-level="${targetLevelId}"]`);
          if (docItem) {
              // Expand its parent category securely
              const parentCat = docItem.closest('.category-group');
              if (parentCat) {
                // Mimic the manual accordion closing
                document.querySelectorAll(".nested-list").forEach(list => list.classList.add("collapsed"));
                document.querySelectorAll(".category-header").forEach(header => header.classList.add("collapsed-header"));
                
                const nestedList = parentCat.querySelector('.nested-list');
                const header = parentCat.querySelector('.category-header');
                if (nestedList) nestedList.classList.remove('collapsed');
                if (header) header.classList.remove('collapsed-header');
              }
              
              // Select the document visually without re-pushing history
              selectDocCategory(docItem, targetLevelId, false);
              
              // Direct the page focus to the docs section container cleanly
              const section = document.getElementById("docs");
              if (section) section.scrollIntoView({ behavior: "smooth" });
          }
      }
    }
  };

  // Listen for browser back/forward buttons
  window.addEventListener("hashchange", () => {
    if (window.location.hash.startsWith("#blog/") || window.location.hash.startsWith("#docs/")) {
      checkHashUrlForDeepLink();
    } else if (modal && modal.classList.contains("show")) {
      closeModal();
    }
  });

  if (btnPrev)
    btnPrev.addEventListener("click", () => {
      if (currentBlogIndex > 0) openBlogModal(currentBlogIndex - 1);
    });
  if (btnNext)
    btnNext.addEventListener("click", () => {
      if (currentBlogIndex < blogData.length - 1)
        openBlogModal(currentBlogIndex + 1);
    });

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    if (window.location.hash.startsWith("#blog/")) {
      window.history.pushState(
        null,
        null,
        window.location.pathname + window.location.search,
      );
    }
  }

  // Integrated Global Search Logic
  const globalSearchBtn = document.getElementById("global-search-btn");
  const searchBar = document.getElementById("search-bar");
  const globalSearchInput = document.getElementById("global-search-input");
  const globalSearchResults = document.getElementById("global-search-results");

  if (globalSearchBtn && searchBar) {
    globalSearchBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isHidden = searchBar.classList.contains("hidden");
      if (isHidden) {
        searchBar.classList.remove("hidden");
        globalSearchInput.focus();
      } else {
        searchBar.classList.add("hidden");
      }
    });

    // Close on click outside
    document.addEventListener("click", (e) => {
      if (!searchBar.contains(e.target) && e.target !== globalSearchBtn) {
        searchBar.classList.add("hidden");
      }
    });

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        searchBar.classList.add("hidden");
      }
    });

    // Global filter logic
    globalSearchInput.addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase();
      globalSearchResults.innerHTML = "";
      if (term.length < 2) return;

      let results = [];
      // Search Docs
      Object.entries(docsData).forEach(([key, doc]) => {
        if (
          doc.title.toLowerCase().includes(term) ||
          doc.desc.toLowerCase().includes(term)
        ) {
          results.push({
            type: "DOC",
            title: doc.title,
            desc: doc.desc,
            id: key,
          });
        }
      });
      // Search Blog
      blogData.forEach((post, index) => {
        if (
          post.title.toLowerCase().includes(term) ||
          post.summary.toLowerCase().includes(term)
        ) {
          results.push({
            type: "BLOG",
            title: post.title,
            desc: post.summary,
            id: index,
          });
        }
      });

      if (results.length === 0) {
        globalSearchResults.innerHTML =
          '<li><p style="color: var(--text-muted); text-align: center;">No records found...</p></li>';
        return;
      }

      results.slice(0, 5).forEach((res) => { // Limit to 5 results for cleaner UI
        const li = document.createElement("li");
        li.innerHTML = `<h4>[${res.type}] ${res.title}</h4><p>${res.desc.substring(0, 50)}...</p>`;
        li.addEventListener("click", () => {
          searchBar.classList.add("hidden");
          if (res.type === "DOC") {
            const navLink = document.querySelector('a[href="#docs"]');
            if (navLink) navLink.click();
            const docsNavLI = document.querySelector(
              `#docs-nav .doc-level-item[data-level="${res.id}"]`,
            );
            if (docsNavLI) {
              const parentCat = docsNavLI.closest('.category-group');
              if (parentCat) {
                const nestedList = parentCat.querySelector('.nested-list');
                const header = parentCat.querySelector('.category-header');
                if (nestedList) nestedList.classList.remove('collapsed');
                if (header) header.classList.remove('collapsed-header');
              }
              selectDocCategory(docsNavLI, res.id);
            }
          } else {
            const navLink = document.querySelector('a[href="#blog"]');
            if (navLink) navLink.click();
            openBlogModal(res.id);
          }
        });
        globalSearchResults.appendChild(li);
      });
    });
  }

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  window.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("show")) closeModal();
  });

  fetchSystemData();
});

function runEinsteinLoader() {
  const loader = document.getElementById("arcade-loader");
  if (!loader) return;

  loader.style.display = "block";
  loader.classList.remove("loader-active");
  void loader.offsetWidth;
  loader.classList.add("loader-active");

  loader.addEventListener(
    "animationend",
    () => {
      loader.style.display = "none";
      loader.classList.remove("loader-active");
    },
    { once: true },
  );
}

window.addEventListener("load", () => {
  setTimeout(runEinsteinLoader, 1000);
});
