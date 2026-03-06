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
  document.querySelectorAll("#docs-nav li").forEach((li) => {
    const id = li.getAttribute("data-level");
    if (completedDocs.includes(id)) li.classList.add("completed");
    else li.classList.remove("completed");
  });

  const total = document.querySelectorAll("#docs-nav li").length;
  const completed = completedDocs.length;
  let percentage = 0;
  if (total > 0) percentage = Math.round((completed / total) * 100);

  const progressBar = document.getElementById("progress-bar");
  const progressText = document.getElementById("progress-text");

  if (progressBar && progressText) {
    progressBar.style.width = percentage + "%";
    progressText.innerText = "Progress: " + percentage + "%";
  }

  const currentActiveLevel = document
    .querySelector("#docs-nav li.active")
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

  Object.entries(docsData).forEach(([levelKey, levelObj]) => {
    const li = document.createElement("li");
    li.setAttribute("data-level", levelKey);
    li.setAttribute("data-tags", (levelObj.tags || []).join(","));
    li.setAttribute("role", "tab");
    li.tabIndex = 0;

    // Check filter on render to avoid flash of content
    const tags = levelObj.tags || [];
    const matchesTag = activeTag === "all" || tags.includes(activeTag);
    if (!matchesTag) li.classList.add("hidden");

    li.innerHTML = `<span class="status-dot"></span> ${levelObj.tabTitle}`;

    li.addEventListener("click", () => selectDocCategory(li, levelKey));
    li.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectDocCategory(li, levelKey);
      }
    });

    navContainer.appendChild(li);
  });

  updateProgressUI();

  // Select default category
  const firstVisible = navContainer.querySelector("li:not(.hidden)");
  if (firstVisible) {
    const levelKey = firstVisible.getAttribute("data-level");
    selectDocCategory(firstVisible, levelKey);
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
function selectDocCategory(item, levelId) {
  const activeLi = document.querySelector("#docs-nav li.active");
  if (activeLi) activeLi.classList.remove("active");

  const ariaSelected = document.querySelector(
    '#docs-nav li[aria-selected="true"]',
  );
  if (ariaSelected) ariaSelected.setAttribute("aria-selected", "false");

  item.classList.add("active");
  item.setAttribute("aria-selected", "true");

  const data = docsData[levelId];
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
      <div class="retro-terminal">
        <div class="terminal-header">
          <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
          <span class="term-title">${data.filename}</span>
          <button class="copy-btn" aria-label="Copy code block">Copy</button>
        </div>
        <pre><code id="current-code-block">${escapedCode}</code></pre>
      </div>
      <h4>When to use this approach</h4>
      <p class="doc-when-to-use" style="color: var(--text-muted); margin-bottom: 2rem;">
        ${whenToUse}
      </p>
      <h4>Best Practices</h4><ul>
        ${bestLists}
      </ul>
      <h4>Common Mistakes</h4><ul>
        ${mistakeLists}
      </ul>
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

  const docsNavItems = document.querySelectorAll("#docs-nav li");
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

    const docsNavItems = document.querySelectorAll("#docs-nav li");
    docsNavItems.forEach((li) => {
      const text = li.innerText.toLowerCase();
      const tags = li.getAttribute("data-tags") || "";

      const matchesSearch = text.includes(searchTerm);
      const matchesTag = activeTag === "all" || tags.includes(activeTag);

      if (matchesSearch && matchesTag) li.classList.remove("hidden");
      else li.classList.add("hidden");
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
    if (window.location.hash.startsWith("#blog/")) {
      const slug = window.location.hash.replace("#blog/", "");
      const index = blogData.findIndex(
        (p) => p.slug === slug || `post-${blogData.indexOf(p)}` === slug,
      );
      if (index !== -1) openBlogModal(index);
    }
  };

  // Listen for browser back/forward buttons
  window.addEventListener("hashchange", () => {
    if (window.location.hash.startsWith("#blog/")) {
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

  // Global Search Overlay Logic
  const globalSearchBtn = document.getElementById("global-search-btn");
  const globalSearchOverlay = document.getElementById("global-search-overlay");
  const globalSearchInput = document.getElementById("global-search-input");
  const globalSearchResults = document.getElementById("global-search-results");
  const closeSearchBtn = document.getElementById("close-search-btn");

  if (globalSearchBtn && globalSearchOverlay) {
    globalSearchBtn.addEventListener("click", () => {
      globalSearchOverlay.classList.remove("hidden");
      globalSearchInput.focus();
    });

    closeSearchBtn.addEventListener("click", () =>
      globalSearchOverlay.classList.add("hidden"),
    );

    // Close on click outside
    globalSearchOverlay.addEventListener("click", (e) => {
      if (e.target === globalSearchOverlay)
        globalSearchOverlay.classList.add("hidden");
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
          "<li><p>No records found in database...</p></li>";
        return;
      }

      results.forEach((res) => {
        const li = document.createElement("li");
        li.innerHTML = `<h4>[${res.type}] ${res.title}</h4><p>${res.desc.substring(0, 60)}...</p>`;
        li.addEventListener("click", () => {
          globalSearchOverlay.classList.add("hidden");
          if (res.type === "DOC") {
            const navLink = document.querySelector('a[href="#docs"]');
            if (navLink) navLink.click();
            const docsNavLI = document.querySelector(
              `#docs-nav li[data-level="${res.id}"]`,
            );
            if (docsNavLI) selectDocCategory(docsNavLI, res.id);
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
