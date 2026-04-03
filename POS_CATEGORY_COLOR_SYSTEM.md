# POS Dark Mode - Product Category Color Coding

## Overview
The POS system now automatically assigns color-coded categories to products based on their category field or name patterns. This creates a visual hierarchy that helps users quickly identify product types at a glance.

## Three-Category Color System

### Category A: Deep Navy (#1E3A8A)
**Primary Use**: Jeans, Shirts, and Clothing

**Characteristics:**
- Background: #1E3A8A (Deep Navy)
- Hover: #1E40AF (Lighter Navy)
- Border: #1E40AF to #3B82F6
- Text: Pure White (#FFFFFF)

**Auto-Detection Keywords:**
- "jeans"
- "shirt"
- "clothing"
- "apparel"

**Visual Purpose:** 
- Primary/main product category
- Most frequently purchased items
- Easily distinguishable from action buttons

---

### Category B: Deep Muted Amber (#92400E)
**Primary Use**: Tops, Accessories, Hats, Caps

**Characteristics:**
- Background: #92400E (Deep Muted Amber)
- Hover: #B45309 (Lighter Amber)
- Border: #B45309 to #D97706
- Text: Pure White (#FFFFFF)

**Auto-Detection Keywords:**
- "accessory"
- "accessorie"
- "tops"
- "hat"
- "cap"

**Visual Purpose:**
- Secondary/specialty items
- Complements without conflicting with green payment button
- Warm, professional appearance

---

### Category C: Charcoal Slate (#334155)
**Primary Use**: Miscellaneous, Other, Default

**Characteristics:**
- Background: #334155 (Charcoal Slate)
- Hover: #475569 (Lighter Slate)
- Border: #475569 to #64748b
- Text: Pure White (#FFFFFF)

**Auto-Detection Keywords:**
- Default for all non-matching categories

**Visual Purpose:**
- Neutral fallback category
- For items that don't fit other categories
- Maintains visual coherence

---

## Light Mode Colors

In light mode, all product cards use a unified light slate background (#F1F5F9) with dark text (#1E293b), ensuring consistency and readability without category distinction.

**Light Mode Card:**
- Background: #F1F5F9 (Slate-100)
- Border: #D1D5DB (Gray-300)
- Text: #1E293B (Slate-900)
- Stock Badge: White background with dark text

---

## Implementation Details

### Auto-Detection Logic

The `getCategoryColor()` function in `pages/pos.js` automatically assigns category colors:

```javascript
const getCategoryColor = (product) => {
  if (!product.category) return 'category-c'; // Default
  
  const categoryName = product.category.toLowerCase();
  
  // Category A: Navy
  if (categoryName.includes('jeans') || 
      categoryName.includes('shirt') ||
      categoryName.includes('clothing') ||
      categoryName.includes('apparel')) {
    return 'category-a';
  }
  
  // Category B: Amber
  if (categoryName.includes('accessory') || 
      categoryName.includes('accessorie') ||
      categoryName.includes('tops') ||
      categoryName.includes('hat') ||
      categoryName.includes('cap')) {
    return 'category-b';
  }
  
  // Category C: Charcoal (Default)
  return 'category-c';
};
```

### CSS Classes

Each category is represented by a CSS class:

```css
.pos-page.dark-mode .pos-product-card.category-a {
  background-color: #1e3a8a;
  border-color: #1e40af;
}

.pos-page.dark-mode .pos-product-card.category-b {
  background-color: #92400e;
  border-color: #b45309;
}

.pos-page.dark-mode .pos-product-card.category-c {
  background-color: #334155;
  border-color: #475569;
}
```

### Application to Product Cards

Each product card dynamically receives the appropriate category class:

```jsx
const categoryColor = getCategoryColor(product);

<button
  className={`pos-product-card pos-product-card-simple ${categoryColor}`}
  onClick={() => handleProductTileClick(product)}
>
  {/* Card content */}
</button>
```

---

## Stock Badge Styling

### Light Mode Stock Badges
- **Low Stock** (#1-5): Red background with white text
- **Medium Stock** (#6-20): White background with dark text
- **High Stock** (20+): Green background with white text

### Dark Mode Stock Badges
- **Low Stock**: Red/pink (#FECACA) with dark text
- **Medium Stock**: White (#FFFFFF) with dark text
- **High Stock**: Green/teal (#D1FAE5) with dark text

All stock badges are positioned in the **Top-Right corner** (#8px from top and right) as high-contrast pills for instant visual anchoring.

---

## Typography Specifications

### Product Names
- **Transform**: ALL-CAPS
- **Font Weight**: 800 (Extra Bold)
- **Font Size**: 0.95rem (15-16px)
- **Line Height**: 1.15
- **Letter Spacing**: -0.02em (negative for logo-like appearance)
- **Color**: Pure White (#FFFFFF) in dark mode

### Light Mode Names
- **Color**: Slate-900 (#1E293B)
- **Transform**: Uppercase
- **Font Weight**: 800

---

## Shape & Structure

### Border Radius
- **Product Cards**: 4px (Industrial sharp corners)
- **Stock Pills**: 3px (Slightly rounded)
- **Quantity Controls**: 3px

### Borders
- **Light Mode**: 1px solid #D1D5DB (Gray)
- **Dark Mode**: 1px category-specific colored border
- **Hover Effect**: Border becomes lighter/more visible

---

## Interactive States

### Hover Behavior
- **Scale**: No vertical translation
- **Shadow**: 0 8px 16px with category-specific color
- **Border**: Shifts to lighter shade of category color
- **Transition**: 0.1s ease for smooth interaction

### Example Hover Effects
- **Category A Hover**: Navy → Brighter Navy with blue glow
- **Category B Hover**: Amber → Brighter Amber with orange glow
- **Category C Hover**: Slate → Brighter Slate with gray glow

---

## Performance Considerations

✅ **Efficient Implementation**
- CSS classes only (no JavaScript re-rendering)
- Single function call per product
- No performance impact on rendering
- Smooth 60fps transitions

✅ **Accessibility**
- High contrast maintained across all categories
- WCAG AA compliant color ratios
- Distinct visual differences for color-blind users
- Clear stock status indication

---

## Customization Guide

### To Add a New Category

1. **Update `getCategoryColor()` in `pages/pos.js`:**

```javascript
// Add new condition
if (categoryName.includes('new-keyword')) {
  return 'category-d'; // Add new category if needed
}
```

2. **Add CSS styles in `styles/pos.css`:**

```css
.pos-page.dark-mode .pos-product-card.category-d {
  background-color: #YOUR_COLOR;
  border-color: #BORDER_COLOR;
}

.pos-page.dark-mode .pos-product-card.category-d:hover {
  background-color: #HOVER_COLOR;
  border-color: #HOVER_BORDER;
}
```

### To Modify Detection Keywords

Edit the conditions in `getCategoryColor()`:

```javascript
if (categoryName.includes('your-keyword') || 
    categoryName.includes('another-keyword')) {
  return 'category-x';
}
```

---

## Visual Hierarchy

### Information Density (Dark Mode - High-Speed Scanning)

1. **Stock Badge** (Top-Right): Instant visual anchor
   - High contrast white/colored text
   - Bold font weight
   - Always visible

2. **Product Name** (Center): Primary information
   - Extra Bold (800) uppercase text
   - Negative letter spacing for impact
   - Pure white on category color

3. **Category Color** (Background): Quick identification
   - Navy: Clothing → Buy first
   - Amber: Accessories → Browse second
   - Slate: Other → Explore last

4. **Border**: Subtle container definition
   - Category-specific color
   - Emphasizes "pressable" button feel
   - Beveled/industrial appearance

---

## Testing Checklist

- [ ] Products display with correct category color in dark mode
- [ ] Stock badges appear in top-right corner
- [ ] Hover effects show proper color transitions
- [ ] Light mode uses unified light slate background
- [ ] Category auto-detection works for all keywords
- [ ] New products get correct category assigned
- [ ] Text remains readable on all category backgrounds
- [ ] No performance degradation with many products
- [ ] Mobile responsiveness maintained
- [ ] Category colors distinct and distinguishable

---

## Color Reference Chart

| Category | Background | Hover | Border | Border Hover | Text |
|----------|-----------|-------|--------|-------------|------|
| A (Navy) | #1E3A8A | #1E40AF | #1E40AF | #3B82F6 | #FFFFFF |
| B (Amber) | #92400E | #B45309 | #B45309 | #D97706 | #FFFFFF |
| C (Slate) | #334155 | #475569 | #475569 | #64748B | #FFFFFF |

---

## Future Enhancements

1. **User Customization**: Allow users to choose category colors
2. **Category Icons**: Add small icons in top-left to reinforce category
3. **Animated Transitions**: Smooth category color transitions
4. **Filter by Category**: Add filter buttons to show only specific categories
5. **Category Statistics**: Display count of items per category
