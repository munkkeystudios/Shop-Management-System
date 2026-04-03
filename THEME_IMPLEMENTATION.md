# POS Page Dark/Light Theme & Category-Based Colored Tiles Implementation

## Overview
This implementation adds:
1. **Light/Dark Mode Toggle** for the POS page with persistent theme preference
2. **Category-Based Colored Product Tiles** that automatically generate colors based on product categories
3. **Theme-Aware Styling** for all UI elements in the POS page

## Files Created

### 1. `frontend/src/utils/themeUtils.js`
Utility functions for theme management and category color mapping:
- `getTheme()` - Retrieves saved theme preference from localStorage
- `setTheme(theme)` - Saves theme preference to localStorage
- `toggleTheme(currentTheme)` - Toggles between light and dark themes
- `CATEGORY_COLORS` - Predefined color mappings for common product categories
- `getCategoryColor(categoryName, theme)` - Gets colors for a specific category
- `generateCategoryColor(categoryName, theme)` - Generates consistent colors for any category using hash function

### 2. `frontend/src/context/ThemeContext.js`
React Context for global theme state management:
- `ThemeProvider` - Wraps application to provide theme context
- `useTheme()` - Hook to access theme state and toggle function
- Persists theme choice in localStorage

## Files Modified

### 1. `frontend/src/pages/pos.js`
- Added import for `useTheme` hook
- Added import for `generateCategoryColor` utility
- Added theme state via `useTheme()`
- Added theme toggle button (☀️/🌙)
- Updated product card rendering to include category-based colors
- Product tiles now use dynamic backgroundColor, color, and borderColor based on category

### 2. `frontend/src/App.js`
- Added import for `ThemeProvider`
- Wrapped application with `<ThemeProvider>` to enable theme context globally

### 3. `frontend/src/styles/pos.css`
- Added `data-theme` attribute support for all POS page elements
- Added comprehensive light theme CSS with theme selector `[data-theme="light"]`
- Added `.pos-theme-toggle` button styling (fixed position, 48px circle button with indigo background)
- Added light theme overrides for:
  - Text colors
  - Background colors
  - Border colors
  - Table styling
  - Form elements
  - Product cards
  - Bottom bar
  - All interactive elements

## Features

### Theme Toggle Button
- Fixed position (top-right corner)
- Shows ☀️ in dark mode (to switch to light)
- Shows 🌙 in light mode (to switch to dark)
- Smooth hover and click animations
- Persistent across sessions

### Category-Based Product Colors
The system generates colors for product tiles based on:
1. **Named Categories** - If product category matches known categories (shirts, jeans, shoes, etc.), uses predefined colors
2. **Hash-Based Colors** - For unknown categories, generates consistent colors using category name hash
3. **Theme-Aware** - Colors automatically adjust based on selected theme (light/dark)

**Color Palette Examples:**
- Shirts: Blue tones
- Jeans: Gray tones  
- Shoes: Amber/Orange tones
- Accessories: Pink tones
- Electronics: Indigo tones
- Clothing: Sky blue tones
- Outerwear: Orange tones
- Casual: Light blue tones

### Light Theme Colors
- **Background**: #ffffff (main), #f8fafc (right panel), #f1f5f9 (cart)
- **Text**: #1e293b (primary), #6b7280 (secondary)
- **Borders**: #e2e8f0, #d1d5db

### Dark Theme Colors (Default)
- **Background**: #1e293b (main), #0f172a (right panel)
- **Text**: #e2e8f0 (primary), #94a3b8 (secondary)
- **Borders**: #334155

## Usage

### For Users
1. Click the theme toggle button (☀️/🌙) in top-right corner
2. Theme preference is automatically saved
3. Same theme will load on next visit
4. Product tiles automatically display in appropriate colors based on category

### For Developers
1. Access current theme: `const { theme } = useTheme()`
2. Toggle theme: `const { toggleTheme } = useTheme()`
3. Get category colors: `const colors = generateCategoryColor('category-name', theme)`
4. Add more predefined categories to `CATEGORY_COLORS` in `themeUtils.js`

## Color Customization

To add or modify category colors, edit `CATEGORY_COLORS` in `frontend/src/utils/themeUtils.js`:

```javascript
categoryName: {
  light: { bg: '#background', text: '#textColor', border: '#borderColor' },
  dark: { bg: '#background', text: '#textColor', border: '#borderColor' }
}
```

## Browser Support
- Works in all modern browsers with localStorage support
- Theme preference persists using localStorage
- Automatic fallback to dark theme if no preference stored

## Responsive Design
- All theme changes are responsive
- Works on desktop, tablet, and mobile layouts
- Theme toggle remains accessible on all screen sizes
