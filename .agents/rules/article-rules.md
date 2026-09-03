# Reglas y Estándar de Creación de Artículos

Siempre que el usuario solicite crear o editar un artículo para Marketing Cloud Arcade:

1. **Plantilla Maestra Obligatoria**:
   - Usar como molde base [`src/templates/article-template.astro`](file:///c:/Users/holman.montes/Desktop/Champion/MarketingCloudArcade/src/templates/article-template.astro).
   - Tomar como estándar visual de oro [`src/pages/ssjs-intro.astro`](file:///c:/Users/holman.montes/Desktop/Champion/MarketingCloudArcade/src/pages/ssjs-intro.astro).

2. **Estructura Requerida en cada Artículo**:
   - **Hero:** Badges de metadata, título `h1` bilingüe y descripción bilingüe.
   - **Cuerpo Bilingüe Completo:** Contenido en español (`data-lang="es"`) e inglés (`data-lang="en"`) con la misma profundidad y numeración (`01 · ...`).
   - **Callouts:** `📌 PREREQUISITO`, `💡 PRO TIP`, `⚠️ IMPORTANTE`.
   - **Bloques de Código:** Terminal arcade con botones de copiado y dots de ventana.
   - **Casos de Uso Reales:** Caja interactiva con viñetas `✔️`.
   - **Desafío Arcade:** Misión interactiva `🎮` con `<details><summary>` para la solución.
   - **Sidebar Derecho:**
     1. Índice (TOC) bilingüe y alineado con los títulos del artículo.
     2. Tags cliqueables (`/catalog?tag=...`).
     3. Artículos relacionados curados.
     4. Docs oficiales de Salesforce y Trailhead con sus favicons oficiales y enlaces verificados.

3. **Sincronización:**
   - Registrar siempre el nuevo artículo en `src/config/articles.js`.
   - Registrarlo en `update-articles-sidebar.cjs`.
   - Ejecutar `node update-articles-sidebar.cjs` y verificar con `npm run build`.
