---
name: article-authoring
description: Standard workflow and blueprint for authoring, updating, and translating articles in Marketing Cloud Arcade. Always trigger this skill whenever asked to create a new article or edit an existing article.
---

# Marketing Cloud Arcade — Article Authoring Standard

Whenever you are asked to create, write, or modify an article for **Marketing Cloud Arcade**, you **MUST** follow this exact standard based on the golden reference [`src/pages/ssjs-intro.astro`](file:///c:/Users/holman.montes/Desktop/Champion/MarketingCloudArcade/src/pages/ssjs-intro.astro) and [`src/templates/article-template.astro`](file:///c:/Users/holman.montes/Desktop/Champion/MarketingCloudArcade/src/templates/article-template.astro).

---

## 🏛️ Anatomy of an Arcade Article

Every single article in `src/pages/[slug].astro` MUST contain all of the following 8 components:

### 1. Hero Banner
- Meta badges: Category tag (`.tag [pink|yellow|green|orange|purple]`), Level (`🟢 Beginner` / `🟡 Intermediate` / `🔴 Advanced`), Duration (`⏱️ X min`), Date (`📅 Mes Año`), and Real Views (`<span data-random-views>-</span>`).
- `<h1>` Title in both Spanish and English with `data-lang="es"` and `data-lang="en"`.
- Concise summary `<p class="article-hero-desc">` in both languages.

### 2. Main Layout Container
- `<div class="article-layout">`
- `<article class="article-content" is:raw>`

### 3. Full Bilingual Body Content
- `<div data-lang="es">` and `<div data-lang="en">`
- Must contain all sections in BOTH languages with identical structure and numbering.
- Headings: `<h2>01 · TÍTULO EN MAYÚSCULAS</h2>` with `id="sec-name"` in ES and `id="sec-name-en"` in EN.
- Code blocks: `<div class="code-block">` with dot controls, language tag, and copy button (`📋 Copiar` / `📋 Copy`).
- Callouts:
  - `📌 PREREQUISITO` (`<div class="callout">`)
  - `💡 PRO TIP` (`<div class="callout tip">`)
  - `⚠️ IMPORTANTE` (`<div class="callout warning">`)

### 4. Real Use Cases (`.usecase-box`)
- At least 2 practical business use cases with checkmark icon `✔️` and problem/solution description.

### 5. Interactive Arcade Challenge (`.challenge-box`)
- `🎮 MISIÓN: [Nombre de Misión]` / `🎮 MISSION: [Mission Name]`
- Clear problem prompt.
- Interactive `<details><summary>Ver solución</summary>...</details>` with commented solution code.

### 6. Bottom Navigation (`.article-nav`)
- Cards for Previous (`◀ Anterior` / `◀ Previous`) and Next (`Siguiente ▶` / `Next ▶`) article.

### 7. Sticky Sidebar (`<aside class="article-sidebar">`)
Must include 4 distinct cards:
1. **`📖 EN ESTE ARTÍCULO` / `📖 IN THIS ARTICLE`**:
   - `<ul class="toc-list">` with matching numbered titles in ES and EN pointing to heading IDs.
2. **`🏷️ TAGS`**:
   - Clickable links: `<a href="/catalog?tag=[tag]" class="tag [color]">#[tag]</a>`
3. **`🔗 ARTÍCULOS RELACIONADOS` / `🔗 RELATED ARTICLES`**:
   - 3 curated articles (`.related-article-link`) with icon, hover `translateX(6px)` and neon cyan glow.
4. **`📚 DOCS OFICIALES` / `📚 OFFICIAL DOCS`**:
   - Official Salesforce docs (`/assets/img/icons/salesforce.svg`) and Trailhead modules (`/assets/img/icons/trailhead.png`) with external icon `↗` and `target="_blank" rel="noopener noreferrer"`.

---

## 🔄 Mandatory Post-Creation Workflow

Whenever an article is created or updated:
1. **Register in `src/config/articles.js`**:
   - Add full metadata (id, category, level, title_es, title_en, desc_es, desc_en, duration, date, viewsMin, viewsMax, hot, tags).
2. **Register in `update-articles-sidebar.cjs`**:
   - Add entry to `articlesMeta` with tags, related articles, and official docs with accurate Spanish & English titles.
3. **Run sync script**:
   ```bash
   node update-articles-sidebar.cjs
   ```
4. **Verify build**:
   ```bash
   npm run build
   ```
