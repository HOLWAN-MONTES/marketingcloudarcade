// scripts/docs.js

import { getDocsData } from "./data-provider.js";

const STORAGE_KEY = "mca_completed_docs";
let completedDocs = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

export function toggleDocCompletion(levelId) {
  if (completedDocs.includes(levelId)) {
    completedDocs = completedDocs.filter((id) => id !== levelId);
  } else {
    completedDocs.push(levelId);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(completedDocs));
  updateProgressUI();
}

export function updateProgressUI() {
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
    btn.innerText = window.i18nManager.t('markCompleteBtnDone');
    btn.classList.add("completed-state");
  } else {
    btn.innerText = window.i18nManager.t('markCompleteBtn');
    btn.classList.remove("completed-state");
  }
}

export function renderDocsSidebar() {
  const docsData = getDocsData();
  const navContainer = document.getElementById("docs-nav");
  if (!navContainer) return;

  navContainer.innerHTML = "";

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

  order.forEach(cat => categories[cat] = []);

  Object.entries(docsData).forEach(([levelKey, levelObj]) => {
    const mainCategory = levelObj.learningGroup || "Uncategorized";
    if (!categories[mainCategory]) categories[mainCategory] = [];
    categories[mainCategory].push({ levelKey, levelObj });
  });

  Object.entries(categories).forEach(([catName, items]) => {
    if (items.length === 0) return;
    
    const catLi = document.createElement("li");
    catLi.className = "category-group";

    const catHeader = document.createElement("div");
    catHeader.className = "category-header collapsed-header";
    catHeader.innerHTML = `<span>${window.i18nManager.t(catName)}</span> <span class="chevron">▼</span>`;
    
    const nestedUl = document.createElement("ul");
    nestedUl.className = "nested-list collapsed";

    catHeader.addEventListener("click", () => {
      document.querySelectorAll(".nested-list").forEach(list => {
        if (list !== nestedUl) list.classList.add("collapsed");
      });
      document.querySelectorAll(".category-header").forEach(header => {
        if (header !== catHeader) header.classList.add("collapsed-header");
      });
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

  const hash = window.location.hash;
  if (!hash.startsWith("#docs/")) {
      const firstVisible = navContainer.querySelector(".doc-level-item:not(.hidden)");
      if (firstVisible) {
        const levelKey = firstVisible.getAttribute("data-level");
        selectDocCategory(firstVisible, levelKey, false);
      }
  }
}

export function selectDocCategory(item, levelId, pushHistory = true) {
  const docsData = getDocsData();
  const activeLi = document.querySelector("#docs-nav .doc-level-item.active");
  if (activeLi) activeLi.classList.remove("active");

  const ariaSelected = document.querySelector(
    '#docs-nav .doc-level-item[aria-selected="true"]',
  );
  if (ariaSelected) ariaSelected.setAttribute("aria-selected", "false");

  item.classList.add("active");
  item.setAttribute("aria-selected", "true");

  const data = docsData[levelId];
  if (pushHistory && data) {
      const targetHash = `#docs/${data.slug || levelId}`;
      if (window.location.hash !== targetHash) {
          window.history.pushState(null, null, targetHash);
      }
  }
  
  renderDocPane(data, levelId);
}

export function renderDocPane(data, levelId) {
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
        <button id="mark-complete-btn" class="btn-complete" aria-label="Mark level completed">${completedDocs.includes(levelId) ? window.i18nManager.t('markCompleteBtnDone') : window.i18nManager.t('markCompleteBtn')}</button>
      </div>
      <div class="badge-group">
        <span class="badge badge-world">${data.world}</span>
        <span class="badge badge-diff">${data.difficulty}</span>
        <span class="badge badge-time">${data.estTime}</span>
      </div>
      <p class="doc-desc">${data.desc}</p>
      
      ${data.overview ? `<h4>${window.i18nManager.t('overview')}</h4><p class="doc-section-text">${data.overview}</p>` : ''}
      
      ${data.whyItMatters ? `<h4>${window.i18nManager.t('whyItMatters')}</h4><p class="doc-section-text">${data.whyItMatters}</p>` : ''}
      
      ${data.howItWorks ? `<h4>${window.i18nManager.t('howItWorks')}</h4><p class="doc-section-text">${data.howItWorks}</p>` : ''}

      ${data.whenToUse ? `<h4>${window.i18nManager.t('whenToUse')}</h4><p class="doc-section-text">${data.whenToUse}</p>` : ''}

      ${data.code ? `<h4>${window.i18nManager.t('exImpl')}</h4>
      <div class="retro-terminal">
        <div class="terminal-header">
          <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
          <span class="term-title">${data.filename}</span>
          <button class="copy-btn" aria-label="Copy code block">Copy</button>
        </div>
        <pre><code id="current-code-block">${escapedCode}</code></pre>
      </div>` : ''}
      
      ${data.images && data.images.length > 0 ? `
      <h4>${window.i18nManager.t('visRef')}</h4>
      ${data.images.map(img => `
        <figure class="doc-image-figure">
          <img src="${img.src}" alt="${img.alt || 'Documentation visual'}" class="doc-image" />
          ${img.caption ? `<figcaption class="doc-image-caption">${img.caption}</figcaption>` : ''}
        </figure>
      `).join('')}
      ` : ''}
      
      ${bestLists ? `<h4>${window.i18nManager.t('bestPrac')}</h4><ul>${bestLists}</ul>` : ''}
      
      ${mistakeLists ? `<h4>${window.i18nManager.t('commonMistakes')}</h4><ul>${mistakeLists}</ul>` : ''}
      
      ${data.references && data.references.length > 0 ? `
      <h4>${window.i18nManager.t('offDocs')}</h4>
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

export function filterDocs() {
  const docsSearch = document.getElementById("docs-search");
  const docsTags = document.querySelectorAll(".tag-btn");
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

export function initDocsEvents() {
  const docsSearch = document.getElementById("docs-search");
  const docsTags = document.querySelectorAll(".tag-btn");

  if (docsSearch) docsSearch.addEventListener("input", filterDocs);

  docsTags.forEach((btn) => {
    btn.addEventListener("click", () => {
      docsTags.forEach((b) => b.setAttribute("aria-pressed", "false"));
      btn.setAttribute("aria-pressed", "true");
      filterDocs();
    });
  });
}
