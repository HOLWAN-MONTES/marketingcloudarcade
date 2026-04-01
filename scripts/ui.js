// scripts/ui.js

export function initUI() {
  const tvToggleBtn = document.getElementById("tv-toggle-btn");
  const tvWrapper = document.getElementById("my-retro-tv");
  const scanlines = document.getElementById("scanlines");

  if (tvToggleBtn && tvWrapper && scanlines) {
    tvToggleBtn.addEventListener("click", () => {
      if (tvWrapper.classList.contains("is-on")) {
        tvWrapper.classList.remove("is-on");
        tvWrapper.classList.add("is-off");
        scanlines.classList.remove("active");
      } else {
        tvWrapper.classList.remove("is-off");
        tvWrapper.classList.add("is-on");
        scanlines.classList.add("active");
      }
    });
  }

  // --- LÓGICA DE DARK / LIGHT MODE (Canvas Dithering Rápido) ---
  const themeToggleInput = document.getElementById("theme-toggle");
  const canvas = document.getElementById("pixel-canvas");
  let isAnimatingTheme = false;
  const PIXEL_SIZE = 8;

  if (themeToggleInput && canvas) {
    const ctx = canvas.getContext("2d");

    const savedTheme = localStorage.getItem("arcade-theme");
    if (savedTheme === "light") {
      document.body.classList.add("light-mode");
    } else if (savedTheme === "dark") {
      document.body.classList.remove("light-mode");
    }

    // Sync initial state: checked == light mode
    themeToggleInput.checked = document.body.classList.contains("light-mode");

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }

    themeToggleInput.addEventListener("click", (e) => {
      if (isAnimatingTheme) {
        e.preventDefault();
        return;
      }
      isAnimatingTheme = true;

      const isLightMode = document.body.classList.contains("light-mode");
      const oldColor = isLightMode ? "#f0f0f5" : "#0f0f1b";

      ctx.fillStyle = oldColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (isLightMode) {
        document.body.classList.remove("light-mode");
        localStorage.setItem("arcade-theme", "dark");
      } else {
        document.body.classList.add("light-mode");
        localStorage.setItem("arcade-theme", "light");
      }

      const cols = Math.ceil(canvas.width / PIXEL_SIZE);
      const rows = Math.ceil(canvas.height / PIXEL_SIZE);
      const blocks = [];

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          blocks.push({ x: x * PIXEL_SIZE, y: y * PIXEL_SIZE });
        }
      }

      shuffleArray(blocks);

      const duration = 500;
      const totalBlocks = blocks.length;
      let currentIndex = 0;
      let startTime = null;

      function animate(timestamp) {
        if (!startTime) startTime = timestamp;

        const progress = Math.min((timestamp - startTime) / duration, 1);
        const targetIndex = Math.floor(progress * totalBlocks);

        while (currentIndex < targetIndex && currentIndex < totalBlocks) {
          const b = blocks[currentIndex];
          ctx.clearRect(b.x, b.y, PIXEL_SIZE, PIXEL_SIZE);
          currentIndex++;
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          isAnimatingTheme = false;
        }
      }

      requestAnimationFrame(animate);
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
    backToTopBtn.addEventListener("click", () => {
      const bloque = document.getElementById('mario-block');
      if (bloque) {
        bloque.classList.remove('is-active');
        void bloque.offsetWidth; 
        bloque.classList.add('is-active');
      }
      const startPosition = window.pageYOffset;
      const startTime = performance.now();
      const duration = 1500; // Un poco más lento para que la animación fluya con el salto de Mario

      function scrollAnimation(currentTime) {
          const timeElapsed = currentTime - startTime;
          const progress = Math.min(timeElapsed / duration, 1);
          
          const ease = 1 - Math.pow(1 - progress, 3);
          
          window.scrollTo(0, startPosition * (1 - ease));

          if (timeElapsed < duration) {
              requestAnimationFrame(scrollAnimation);
          }
      }

      requestAnimationFrame(scrollAnimation);
    });
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
