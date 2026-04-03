// Theme management utilities
export const THEME_LIGHT = 'light';
export const THEME_DARK = 'dark';

export const getTheme = () => {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('pos-theme') || THEME_DARK;
  }
  return THEME_DARK;
};

export const setTheme = (theme) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('pos-theme', theme);
  }
};

export const toggleTheme = (currentTheme) => {
  const newTheme = currentTheme === THEME_LIGHT ? THEME_DARK : THEME_LIGHT;
  setTheme(newTheme);
  return newTheme;
};

// Category color mapping
export const CATEGORY_COLORS = {
  default: {
    light: { bg: '#f1f5f9', text: '#1e293b', border: '#e2e8f0' },
    dark: { bg: '#1e293b', text: '#e2e8f0', border: '#334155' }
  },
  // Common category colors - you can customize these based on your categories
  shirts: {
    light: { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
    dark: { bg: '#1e3a8a', text: '#e0f2fe', border: '#1e40af' }
  },
  jeans: {
    light: { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' },
    dark: { bg: '#1f2937', text: '#f3f4f6', border: '#4b5563' }
  },
  shoes: {
    light: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
    dark: { bg: '#78350f', text: '#fef3c7', border: '#b45309' }
  },
  accessories: {
    light: { bg: '#fce7f3', text: '#831843', border: '#fbcfe8' },
    dark: { bg: '#831843', text: '#fce7f3', border: '#be185d' }
  },
  electronics: {
    light: { bg: '#e0e7ff', text: '#312e81', border: '#c7d2fe' },
    dark: { bg: '#3730a3', text: '#e0e7ff', border: '#4f46e5' }
  },
  clothing: {
    light: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
    dark: { bg: '#1e40af', text: '#dbeafe', border: '#3b82f6' }
  },
  outerwear: {
    light: { bg: '#fed7aa', text: '#9a3412', border: '#fdba74' },
    dark: { bg: '#7c2d12', text: '#fed7aa', border: '#ea580c' }
  },
  casual: {
    light: { bg: '#f0f9ff', text: '#0c4a6e', border: '#7dd3fc' },
    dark: { bg: '#082f49', text: '#f0f9ff', border: '#0284c7' }
  }
};

// Function to get color for category based on name
export const getCategoryColor = (categoryName, theme = THEME_DARK) => {
  if (!categoryName) {
    return CATEGORY_COLORS.default[theme];
  }

  const normalizedName = categoryName.toLowerCase().replace(/\s+/g, '');
  
  // Try exact match first
  for (const [key, colors] of Object.entries(CATEGORY_COLORS)) {
    if (key !== 'default' && normalizedName.includes(key)) {
      return colors[theme];
    }
  }

  // Return default if no match found
  return CATEGORY_COLORS.default[theme];
};

// Hash function to generate consistent colors for any category
export const generateCategoryColor = (categoryName, theme = THEME_DARK) => {
  const colorPalette = {
    light: [
      { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
      { bg: '#f0fdf4', text: '#15803d', border: '#86efac' },
      { bg: '#fff7ed', text: '#92400e', border: '#fed7aa' },
      { bg: '#fce7f3', text: '#831843', border: '#fbcfe8' },
      { bg: '#e0e7ff', text: '#312e81', border: '#c7d2fe' },
      { bg: '#f0f9ff', text: '#0c4a6e', border: '#7dd3fc' },
    ],
    dark: [
      { bg: '#1e3a8a', text: '#e0f2fe', border: '#1e40af' },
      { bg: '#1b4332', text: '#d1fae5', border: '#34d399' },
      { bg: '#78350f', text: '#fef3c7', border: '#b45309' },
      { bg: '#831843', text: '#fce7f3', border: '#be185d' },
      { bg: '#3730a3', text: '#e0e7ff', border: '#4f46e5' },
      { bg: '#082f49', text: '#f0f9ff', border: '#0284c7' },
    ]
  };

  // Simple hash of category name to get consistent color index
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    hash = ((hash << 5) - hash) + categoryName.charCodeAt(i);
    hash = hash & hash;
  }

  const index = Math.abs(hash) % colorPalette[theme].length;
  return colorPalette[theme][index];
};
