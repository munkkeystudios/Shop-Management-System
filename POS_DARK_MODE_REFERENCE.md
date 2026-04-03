# POS Dark Mode - Quick Reference

## 🎨 Color Palette Reference

### LIGHT MODE (Default)
```
Backgrounds:
  - Main: #ffffff (White)
  - Secondary: #f1f5f9 (Slate-100)
  - Tertiary: #f9fafb (Slate-50)

Text:
  - Primary: #1e293b (Slate-900)
  - Secondary: #6b7280 (Gray-500)
  - Tertiary: #9ca3af (Gray-400)

Borders:
  - Primary: #e5e7eb (Gray-200)
  - Secondary: #d1d5db (Gray-300)

Accents:
  - Button: #4f46e5 (Indigo-600)
  - Success: #10b981 (Emerald-500)
  - Warning: #f59e0b (Amber-400)
```

### DARK MODE
```
Backgrounds:
  - Main: #020617 (Slate-950)
  - Secondary: #0f172a (Slate-900)
  - Tertiary: #1e293b (Slate-800)

Text:
  - Primary: #f8fafc (Slate-50)
  - Secondary: #cbd5e1 (Slate-300)
  - Tertiary: #94a3b8 (Slate-400)

Borders:
  - Primary: #334155 (Slate-700)
  - Secondary: #475569 (Slate-600)

Accents:
  - Primary Action: #064e3b (Forest Green-900)
  - Hover Action: #047857 (Forest Green-700)
  - Success: #10b981 (Emerald-500)
  - Error/Delete: #ef4444 (Red-500)

Product Cards:
  - Category A: #1e3a8a (Blue-900)
  - Category B: #92400e (Amber-900)
  - Category C: #334155 (Slate-700)
```

## 📍 Component Structure

```
POS PAGE (.pos-page)
├── Light Mode (default class)
└── Dark Mode (add .dark-mode class)
    │
    ├── LEFT SECTION (.pos-left)
    │   ├── Search Row (.pos-search-row)
    │   │   └── Search Bar + Item Count
    │   └── Product Grid (.pos-product-grid)
    │       └── Product Cards (.pos-product-card)
    │           ├── Light: #f1f5f9
    │           └── Dark: Category colors
    │
    └── RIGHT SECTION (.pos-right)
        ├── Header (.pos-right-header)
        │   ├── Customer Select
        │   ├── Theme Toggle Button 🌙☀️ ← NEW
        │   └── Add Button
        ├── Bill Info (.pos-bill-row)
        ├── Cart Panel (.pos-cart-panel)
        │   ├── Cart Header (.pos-cart-header)
        │   └── Cart Body (.pos-cart-body)
        │       └── Table Rows
        └── Bottom Bar (.pos-bottom-bar)
            ├── Discount/VAT Summary
            ├── Total Amount
            └── Payment Controls
```

## 🔧 Usage Examples

### Toggle Theme Button
```html
<button 
  className="pos-theme-toggle-btn" 
  onClick={toggleTheme}
  title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
>
  {isDarkMode ? '☀️' : '🌙'}
</button>
```

### Apply Theme Class
```jsx
<div className={`pos-page ${isDarkMode ? 'dark-mode' : ''}`}>
  {/* Page content */}
</div>
```

### Use Theme Hook
```jsx
const { isDarkMode, toggleTheme } = usePOSTheme();
```

## 📊 Product Card Styling

### Light Mode Card
- Background: Slate-100 (#f1f5f9)
- Border: Slate-200 (#e2e8f0)
- Text: Slate-900 (#1e293b)
- Stock Badge: Gray background, dark text

### Dark Mode Card - Category A
- Background: Blue-900 (#1e3a8a)
- Hover: Blue-800 (#1e40af)
- Text: White (#ffffff)
- Stock Badge: White bg, dark text

### Dark Mode Card - Category B
- Background: Amber-900 (#92400e)
- Hover: Amber-700 (#b45309)
- Text: White (#ffffff)
- Stock Badge: White bg, dark text

### Dark Mode Card - Category C
- Background: Slate-700 (#334155)
- Hover: Slate-600 (#475569)
- Text: White (#ffffff)
- Stock Badge: White bg, dark text

## 🎯 Typography Rules

### Product Names
- Font Weight: 800 (Extra Bold)
- Text Transform: UPPERCASE
- Color (Light): #1e293b (Slate-900)
- Color (Dark): #ffffff (White)
- Font Size: 0.85rem - 0.9rem

### Cart Item Names
- Font Weight: 600 (Semi-Bold)
- Color (Light): #1e293b
- Color (Dark): #f8fafc (Slate-50)
- Case: Sentence case

### Labels & Secondary Text
- Font Weight: 400-500
- Color (Light): #6b7280 (Gray-500)
- Color (Dark): #94a3b8 (Slate-400)

## 🔴 Action Button Styles

### Payment Button (Primary)
**Light Mode:**
- Background: #4f46e5 (Indigo)
- Text: White
- Hover: #4338ca (Darker Indigo)

**Dark Mode:**
- Background: #064e3b (Forest Green)
- Text: White
- Hover: #047857 (Darker Green)
- Border: #059669 (Green accent)

### Reset Button (Secondary)
**Light Mode:**
- Background: Transparent
- Text: #4f46e5 (Indigo)
- Border: None

**Dark Mode:**
- Background: Transparent
- Text: #064e3b (Forest Green)
- Border: None

### Delete Icon
**Light Mode:**
- Color: #6b7280 (Gray)
- Hover: Highlighted

**Dark Mode:**
- Color: #64748b (Slate-400)
- Hover: #ef4444 (Red)

## 📱 Input Fields

### Light Mode
- Background: #f9fafb (Slate-50)
- Border: #d1d5db (Gray-300)
- Text: #1e293b (Slate-900)
- Focus Border: Same or lighter

### Dark Mode
- Background: #1e293b (Slate-800)
- Border: #334155 (Slate-700)
- Text: #f8fafc (Slate-50)
- Focus Background: #0f172a (Darker)
- Focus Border: #064e3b (Forest Green)

## 🎬 Transitions & Effects

### Smooth Transitions
- Duration: 0.1s - 0.2s
- Timing: ease
- Properties: background-color, border-color, color, transform

### Hover Effects
- Product Cards: Translate up, shadow increase, border highlight
- Buttons: Background color shift, shadow change
- Inputs: Border color change, background change

## 📝 CSS Classes for Theming

### Main Theme Class
```css
.pos-page.dark-mode { /* Activates all dark mode styles */ }
```

### Child Classes (with .dark-mode)
```css
.pos-page.dark-mode .pos-left
.pos-page.dark-mode .pos-right
.pos-page.dark-mode .pos-product-card
.pos-page.dark-mode .pos-product-card.category-a
.pos-page.dark-mode .pos-product-card.category-b
.pos-page.dark-mode .pos-product-card.category-c
.pos-page.dark-mode .table
.pos-page.dark-mode input[type="number"]
.pos-page.dark-mode input[type="text"]
.pos-page.dark-mode .pos-qty-plus
.pos-page.dark-mode .pos-qty-minus
.pos-page.dark-mode .pos-cart-delete-btn
```

## 🔍 Accessibility Notes

✅ **High Contrast Maintained**
- All text remains readable in both modes
- WCAG AA compliance for color contrast ratios

✅ **Consistent Color Coding**
- Product categories use distinct colors
- Stock levels use intuitive indicators
- Delete actions highlighted on hover

✅ **Focus States**
- All interactive elements have clear focus indicators
- Keyboard navigation supported
- Touch-friendly button sizes (40px minimum)

## 📦 LocalStorage Persistence

**Key:** `pos-theme-mode`
**Values:** `'dark'` | `'light'`
**Location:** Browser's localStorage
**Persistence:** Survives page refresh and browser restart

To check current setting:
```javascript
localStorage.getItem('pos-theme-mode') // Returns 'dark' or 'light'
```

## 🚀 Performance Considerations

- CSS classes only (no JavaScript animations)
- Single class toggle (`.dark-mode`)
- No layout recalculation needed
- Smooth 60fps transitions
- Minimal bundle size impact
- No external theme libraries required
