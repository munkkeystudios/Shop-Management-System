/**
 * Utility function to assign category colors for products
 * Used across all product displays (POS, All Products, etc.)
 * 
 * COLOR SCHEME:
 * - Casual Wear → Deep Charcoal (#334155) - Technical Neutral
 * - Formal Wear → Oxide Amber (#78350F) - Warm Neutral/Hardware
 * - Sportswear → Slate Navy (#1E3A8A) - Foundation/Stock
 */

// Direct category name to color mapping
const CATEGORY_COLOR_MAP = {
  'casual wear': 'category-c',      // Deep Charcoal
  'formal wear': 'category-b',      // Oxide Amber
  'sportswear': 'category-a',       // Slate Navy
};

export const getCategoryColor = (product) => {
  // Safely get category name
  let categoryName = '';
  
  if (product && product.category) {
    // Handle if category is an object with a name property
    if (typeof product.category === 'object' && product.category.name) {
      categoryName = product.category.name.toLowerCase().trim();
    } 
    // Handle if category is a string
    else if (typeof product.category === 'string') {
      categoryName = product.category.toLowerCase().trim();
    }
  }
  
  // If no category, default to category-c (Deep Charcoal)
  if (!categoryName) {
    return 'category-c';
  }
  
  // Check if exact category name match exists
  if (CATEGORY_COLOR_MAP[categoryName]) {
    return CATEGORY_COLOR_MAP[categoryName];
  }
  
  // Fallback: default to category-c (Deep Charcoal)
  return 'category-c';
};

/**
 * Get category color hex value (for displays/badges outside of POS)
 */
export const getCategoryColorHex = (product) => {
  const categoryColor = getCategoryColor(product);
  
  const colorMap = {
    'category-a': '#1E3A8A',  // Slate Navy (Sportswear)
    'category-b': '#78350F',  // Oxide Amber (Formal Wear)
    'category-c': '#334155',  // Deep Charcoal (Casual Wear)
  };
  
  return colorMap[categoryColor] || '#334155';
};

/**
 * Get category color name (for labels)
 */
export const getCategoryColorName = (product) => {
  const categoryColor = getCategoryColor(product);
  
  const colorNameMap = {
    'category-a': 'Slate Navy',
    'category-b': 'Oxide Amber',
    'category-c': 'Deep Charcoal',
  };
  
  return colorNameMap[categoryColor] || 'Deep Charcoal';
};
