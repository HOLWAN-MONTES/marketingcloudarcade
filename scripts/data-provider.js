// scripts/data-provider.js

let docsData = {};
let blogData = [];

// Simple HTML Sanitizer to strip dangerous tags (e.g. scripts)
export function sanitizeHTML(str) {
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
    // Placeholder for Wix Velo
    console.warn("Wix DataProvider not yet implemented.");
    return { docsData: {}, blogData: [] };
  },
};

export async function fetchSystemData() {
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
        images: d[k].images || null,
        slug: d[k].slug || null
      };
    });
    blogData = b
      .filter((p) => p.id && p.title)
      .map((p) => ({
        ...p,
        content: sanitizeHTML(p.content),
      }));
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
    throw e; // rethrow for main.js to catch if needed
  }
}

export function getDocsData() {
    return docsData;
}

export function getBlogData() {
    return blogData;
}
