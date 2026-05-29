import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment, collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAP82AaD-i265zj8vjVubxy0gFxd2g0VA",
  authDomain: "marketing-cloud-arcade.firebaseapp.com",
  projectId: "marketing-cloud-arcade",
  storageBucket: "marketing-cloud-arcade.firebasestorage.app",
  messagingSenderId: "1090520028431",
  appId: "1:1090520028431:web:c8ffa8684017c8bb5b5a7a",
  measurementId: "G-TLZ91QXRZL"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function formatViews(num) {
  return num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num.toString();
}

export async function incrementArticleView(articleId) {
  if (!articleId) return;
  const docRef = doc(db, "views", articleId);
  try {
    // Single atomic write using setDoc with merge: true and increment(1)
    await setDoc(docRef, { count: increment(1) }, { merge: true });
  } catch (e) {
    console.error("Error updating view count: ", e);
  }
}

export async function loadRealViews() {
  try {
    const viewsQuery = query(collection(db, "views"));
    const querySnapshot = await getDocs(viewsQuery);
    const viewData = {};
    querySnapshot.forEach((doc) => {
      viewData[doc.id] = doc.data().count;
    });

    document.querySelectorAll('[data-random-views]').forEach(el => {
      const articleId = el.closest('[data-article-id]')?.getAttribute('data-article-id');
      if (articleId && viewData[articleId] !== undefined) {
        el.textContent = formatViews(viewData[articleId]);
      } else {
        el.textContent = '0';
      }
    });
  } catch (e) {
    console.error("Error fetching views: ", e);
  }
}

export async function renderHighScores() {
  const container = document.getElementById('high-scores-container');
  if (!container) return;
  
  try {
    const viewsQuery = query(collection(db, "views"), orderBy("count", "desc"), limit(6));
    const querySnapshot = await getDocs(viewsQuery);
    
    let html = '';
    let rank = 1;
    const articles = window.MC_ARTICLES || [];
    
    let maxCount = 0;
    querySnapshot.forEach(doc => {
      if (doc.data().count > maxCount) maxCount = doc.data().count;
    });

    querySnapshot.forEach((docSnap) => {
      const articleId = docSnap.id;
      const count = docSnap.data().count;
      const articleData = articles.find(a => (a.id || '').includes(articleId) || (a.url || '').includes(articleId));
      
      const title = articleData ? (document.documentElement.lang === 'es' ? articleData.title_es : articleData.title) : articleId;
      
      let rankClass = '';
      if (rank === 1) rankClass = 'gold';
      else if (rank === 2) rankClass = 'silver';
      else if (rank === 3) rankClass = 'bronze';
      
      const rankStr = rank < 10 ? '0' + rank : rank;
      const width = maxCount > 0 ? Math.max((count / maxCount) * 100, 5) : 0;
      
      const url = articleData ? articleData.url : '/' + articleId;
      
      html += `
        <a href="${url}" class="hiscore-row" style="text-decoration:none; display:flex;">
          <div class="hiscore-rank ${rankClass}">${rankStr}</div>
          <div class="hiscore-title" style="color:var(--text-primary);">${title}</div>
          <div class="hiscore-views" style="color:var(--neon-pink);">${formatViews(count)}</div>
          <div class="hiscore-bar"><div class="hiscore-bar-fill" style="width:${width}%"></div></div>
        </a>
      `;
      rank++;
    });
    
    container.innerHTML = html;
  } catch (e) {
    console.error("Error rendering high scores: ", e);
    container.innerHTML = '<div style="padding:1rem;text-align:center;">Error loading scores.</div>';
  }
}

// Expose functions globally so other scripts (like index.astro) can call them
window.loadRealViews = loadRealViews;
window.renderHighScores = renderHighScores;
window.incrementArticleView = incrementArticleView;

function init() {
  // Check if we are on an individual article page
  const articleHeroSpan = document.querySelector('.article-hero [data-article-id]');
  if (articleHeroSpan) {
    const id = articleHeroSpan.getAttribute('data-article-id');
    if (id) {
      incrementArticleView(id);
    }
  }

  loadRealViews();

  if (document.getElementById('high-scores-container')) {
    renderHighScores();
  }
}

// Robust execution that handles DOMContentLoaded being already fired
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
