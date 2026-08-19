// Category icon configuration - single source of truth
// Change image paths here to update all icons across the site
// Only add entries for images that actually exist in /public/assets/img/icons/

export const categoryIconConfig = {
  ampscript: {
    path: '/assets/img/icons/ampscript.png',
    alt: 'AMPscript'
  },
  sql: {
    path: '/assets/img/icons/sql.png',
    alt: 'SQL'
  },
  innovations: {
    path: '/assets/img/icons/innovations.jpg',
    alt: 'Innovations'
  }
};

// Emoji fallbacks for categories without images
const categoryEmojis = {
  ssjs: '⚡',
  automation: '⚙️',
  journey: '🗺️',
  cloudpages: '☁️',
  resources: '🔗',
  changelog: '📋',
  'mc-next': '🔮'
};

// Helper function to generate icon HTML
export function getCategoryIcon(category, size = 16) {
  const icon = categoryIconConfig[category];
  if (icon) {
    return `<img src="${icon.path}" alt="${icon.alt}" style="width:${size}px;height:${size}px;vertical-align:middle;">`;
  }
  // Fallback to emoji
  return categoryEmojis[category] || '🕹️';
}
