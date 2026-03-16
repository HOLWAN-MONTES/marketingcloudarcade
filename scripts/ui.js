// scripts/ui.js

export function initUI() {
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
  const PIXEL_SIZE = 30;

  if (themeToggleBtn && grid) {
    themeToggleBtn.addEventListener('click', () => {
        if (isAnimatingTheme) return;
        isAnimatingTheme = true;

        const isLightMode = document.body.classList.contains('light-mode');
        const currentColor = isLightMode ? '#f0f0f5' : '#0f0f1b';
        grid.style.setProperty('--pixel-color', currentColor);

        const cols = Math.ceil(window.innerWidth / PIXEL_SIZE);
        const rows = Math.ceil(window.innerHeight / PIXEL_SIZE);
        const totalPixels = cols * rows;

        grid.innerHTML = '';
        const pixels = [];
        for (let i = 0; i < totalPixels; i++) {
            const p = document.createElement('div');
            p.classList.add('pixel');
            p.style.width = `${PIXEL_SIZE}px`;
            p.style.height = `${PIXEL_SIZE}px`;
            grid.appendChild(p);
            pixels.push(p);
        }

        if (isLightMode) {
            document.body.classList.remove('light-mode');
            themeToggleBtn.innerText = '☀️';
        } else {
            document.body.classList.add('light-mode');
            themeToggleBtn.innerText = '🌙';
        }

        setTimeout(() => {
            pixels.forEach((pixel, index) => {
                const currentRow = Math.floor(index / cols);
                const baseDelay = (currentRow / rows) * 400; 
                const randomDelay = Math.random() * 500; 
                const totalDelay = baseDelay + randomDelay;

                setTimeout(() => {
                    pixel.classList.add('hidden');
                }, totalDelay);
            });
        }, 50);

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
      const isExpanded = mobileMenuToggle.getAttribute("aria-expanded") === "true";
      mobileMenuToggle.setAttribute("aria-expanded", !isExpanded);
      navLinksContainer.classList.toggle("open");
    });
  }

  document.querySelectorAll(".nav-link, .cta-group a").forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href.startsWith("#")) {
        e.preventDefault();
        const targetSec = document.getElementById(href.substring(1));
        if (targetSec) {
          targetSec.scrollIntoView({ behavior: "smooth" });
          if (window.location.hash !== href) {
             window.history.pushState(null, null, href);
          }
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
          const activeNav = document.querySelector('.nav-links a[href="#' + id + '"]');
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
}

export function runEinsteinLoader() {
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
