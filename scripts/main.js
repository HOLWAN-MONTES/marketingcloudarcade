// scripts/main.js

import { fetchSystemData, getDocsData, getBlogData } from "./data-provider.js";
import { initUI, runEinsteinLoader } from "./ui.js";
import { renderDocsSidebar, selectDocCategory, initDocsEvents } from "./docs.js";
import { renderBlogGrid, openBlogModal, closeModal, initBlogEvents } from "./blog.js";

document.addEventListener("DOMContentLoaded", async () => {
  initUI();
  initDocsEvents();
  initBlogEvents();

  try {
    await fetchSystemData();
    renderDocsSidebar();
    renderBlogGrid();
    checkHashUrlForDeepLink();
  } catch (e) {
    console.warn("Bootstrap safely halted due to missing data records.");
  }

  initGlobalSearch();
});

document.addEventListener('languageChanged', async () => {
  try {
    await fetchSystemData();
    // Clear out existing before re-render
    const docsNav = document.getElementById("docs-nav");
    if (docsNav) docsNav.innerHTML = "";
    
    renderDocsSidebar();
    renderBlogGrid();
    checkHashUrlForDeepLink();
  } catch (e) {
    console.warn("Failed to update content on language change");
  }
});

window.addEventListener("load", () => {
  setTimeout(runEinsteinLoader, 1000);
});

function checkHashUrlForDeepLink() {
  const hash = window.location.hash;
  const blogData = getBlogData();
  const docsData = getDocsData();
  
  if (hash.startsWith("#blog/")) {
    const slug = hash.replace("#blog/", "");
    const index = blogData.findIndex(
      (p) => p.slug === slug || `post-${blogData.indexOf(p)}` === slug,
    );
    if (index !== -1) openBlogModal(index);
  }
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
            const parentCat = docItem.closest('.category-group');
            if (parentCat) {
              document.querySelectorAll(".nested-list").forEach(list => list.classList.add("collapsed"));
              document.querySelectorAll(".category-header").forEach(header => header.classList.add("collapsed-header"));
              
              const nestedList = parentCat.querySelector('.nested-list');
              const header = parentCat.querySelector('.category-header');
              if (nestedList) nestedList.classList.remove('collapsed');
              if (header) header.classList.remove('collapsed-header');
            }
            selectDocCategory(docItem, targetLevelId, false);
            const section = document.getElementById("docs");
            if (section) section.scrollIntoView({ behavior: "smooth" });
        }
    }
  }
}

window.addEventListener("hashchange", () => {
  const modal = document.getElementById("blog-modal");
  if (window.location.hash.startsWith("#blog/") || window.location.hash.startsWith("#docs/")) {
    checkHashUrlForDeepLink();
  } else if (modal && modal.classList.contains("show")) {
    closeModal();
  }
});

function initGlobalSearch() {
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

    document.addEventListener("click", (e) => {
      if (!searchBar.contains(e.target) && e.target !== globalSearchBtn) {
        searchBar.classList.add("hidden");
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        searchBar.classList.add("hidden");
      }
    });

    globalSearchInput.addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase();
      globalSearchResults.innerHTML = "";
      if (term.length < 2) return;

      const docsData = getDocsData();
      const blogData = getBlogData();
      let results = [];

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

      results.slice(0, 5).forEach((res) => { // Limit to 5 results
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
}
