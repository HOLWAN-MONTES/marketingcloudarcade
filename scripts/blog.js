// scripts/blog.js

import { getBlogData } from "./data-provider.js";

let currentBlogIndex = 0;

export function renderBlogGrid() {
  const blogData = getBlogData();
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
        <button class="btn btn-sm btn-outline read-btn" aria-label="Read ${post.title}" data-index="${i}" data-slug="${post.slug}">Read Record</button>
      </div>
    `;
    blogGrid.appendChild(article);
  });
}

export function openBlogModal(index) {
  const blogData = getBlogData();
  const modal = document.getElementById("blog-modal");
  const btnNext = document.getElementById("modal-next");
  const btnPrev = document.getElementById("modal-prev");

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

  if (btnPrev) {
    btnPrev.disabled = currentBlogIndex === 0;
    btnPrev.style.opacity = btnPrev.disabled ? "0.3" : "1";
  }
  if (btnNext) {
    btnNext.disabled = currentBlogIndex === blogData.length - 1;
    btnNext.style.opacity = btnNext.disabled ? "0.3" : "1";
  }

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
}

export function closeModal() {
  const modal = document.getElementById("blog-modal");
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

export function initBlogEvents() {
  const blogGrid = document.getElementById("blog-grid");
  const btnNext = document.getElementById("modal-next");
  const btnPrev = document.getElementById("modal-prev");
  const closeBtn = document.querySelector(".close-modal");
  const modal = document.getElementById("blog-modal");

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

  if (btnPrev) {
    btnPrev.addEventListener("click", () => {
      if (currentBlogIndex > 0) openBlogModal(currentBlogIndex - 1);
    });
  }
  if (btnNext) {
    btnNext.addEventListener("click", () => {
      const blogData = getBlogData();
      if (currentBlogIndex < blogData.length - 1)
        openBlogModal(currentBlogIndex + 1);
    });
  }

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  window.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && modal.classList.contains("show")) closeModal();
  });
}
