# POS Product Categories - Quick Reference

## 🎨 Three-Category Color System

### Category A: Deep Navy (#1E3A8A)
```
Keyword Triggers: "jeans", "shirt", "clothing", "apparel"

┌─────────────────────────────┐
│                             │
│    PRODUCT NAME (WHITE)     │ ← Stock: 15
│                             │
│     [Navy Background]       │
│                             │
└─────────────────────────────┘

Color Palette:
  Base:        #1E3A8A
  Hover:       #1E40AF
  Border:      #1E40AF → #3B82F6
  Text:        #FFFFFF (Pure White)
  Stock Badge: White with Dark Text
```

---

### Category B: Deep Muted Amber (#92400E)
```
Keyword Triggers: "accessory", "accessorie", "tops", "hat", "cap"

┌─────────────────────────────┐
│                             │
│    PRODUCT NAME (WHITE)     │ ← Stock: 8
│                             │
│     [Amber Background]      │
│                             │
└─────────────────────────────┘

Color Palette:
  Base:        #92400E
  Hover:       #B45309
  Border:      #B45309 → #D97706
  Text:        #FFFFFF (Pure White)
  Stock Badge: White with Dark Text
```

---

### Category C: Charcoal Slate (#334155)
```
Keyword Triggers: All other products (default)

┌─────────────────────────────┐
│                             │
│    PRODUCT NAME (WHITE)     │ ← Stock: 25
│                             │
│    [Slate Background]       │
│                             │
└─────────────────────────────┘

Color Palette:
  Base:        #334155
  Hover:       #475569
  Border:      #475569 → #64748B
  Text:        #FFFFFF (Pure White)
  Stock Badge: White with Dark Text
```

---

## 📊 Stock Badge Reference

### Light Stock (1-5 Items)
```
┌────────┐
│ 3 │ Red │ 🔴
└────────┘
Background: #FECACA (Light Red)
Text: #991B1B (Dark Red)
Border: #FCA5A5
```

### Medium Stock (6-20 Items)
```
┌────────┐
│15│White│ ⚪
└────────┘
Background: #FFFFFF (White)
Text: #1E293B (Dark Slate)
Border: #D1D5DB (Gray)
```

### High Stock (20+ Items)
```
┌────────┐
│35│Green│ 🟢
└────────┘
Background: #D1FAE5 (Light Teal)
Text: #065F46 (Dark Green)
Border: #A7F3D0
```

---

## 🔄 Hover Effects

### Visual Feedback Chain
```
Normal State
    ↓ (on hover)
Color Shift (category color brightens)
    ↓ (simultaneous)
Shadow Expansion (0 8px 16px)
    ↓ (simultaneous)
Border Highlight (becomes lighter)
    ↓ (on click)
Scale (0.95)
```

### Example: Category A Hover
```
Navy Tile Hover Animation:
┌─────────────────────────────┐
│        PRODUCT NAME         │ ← Shifts to brighter blue
│                             │ ← Shadow expands
│   [Navy → Brighter Navy]    │ ← Border becomes more visible
│                             │
│    Duration: 0.1s (smooth)  │
└─────────────────────────────┘
```

---

## 📱 Layout & Positioning

### Stock Badge Position
```
┌─────────────────────────────┐
│  [Badge] ↗                  │
│  Top: 8px                   │
│  Right: 8px                 │
│                             │
│    PRODUCT NAME             │
│    (Centered)               │
│                             │
└─────────────────────────────┘
```

### Typography Specs
```
Font: Inter / Geist
Weight: 800 (Extra Bold)
Transform: UPPERCASE
Size: 0.95rem (≈15-16px)
Line Height: 1.15
Letter Spacing: -0.02em
```

---

## 🎯 Auto-Detection Examples

### Will Get Category A (Navy)
```
✅ "Black Jeans"           → Contains "jeans"
✅ "White Shirt"           → Contains "shirt"
✅ "Men's Clothing"        → Contains "clothing"
✅ "Casual Apparel"        → Contains "apparel"
```

### Will Get Category B (Amber)
```
✅ "Gold Accessories"      → Contains "accessory"
✅ "Baseball Cap"          → Contains "cap"
✅ "Winter Hat"            → Contains "hat"
✅ "Tops Collection"       → Contains "tops"
```

### Will Get Category C (Slate) - Default
```
✅ "Random Product"        → No keywords matched
✅ "Electronics"           → No keywords matched
✅ "Home Goods"            → No keywords matched
```

---

## 🌓 Light Mode vs Dark Mode

### Light Mode
```
All Products: Unified Light Slate
Background: #F1F5F9 (Slate-100)
Border: #D1D5DB (Gray-300)
Text: #1E293B (Slate-900)
Stock Badge: White bg, Dark text

No category distinction in light mode.
All cards look identical for consistency.
```

### Dark Mode
```
Category A: Navy   #1E3A8A
Category B: Amber  #92400E
Category C: Slate  #334155

Each category has:
- Unique background color
- Category-specific hover effect
- Corresponding border color
- High-contrast white text
- Color-coded stock badge
```

---

## 🔧 Customization Quick Start

### To Add New Category Keywords

Edit `/frontend/src/pages/pos.js`:

```javascript
// Find getCategoryColor function and add:

// Category B Extensions
if (categoryName.includes('accessories') || 
    categoryName.includes('hats') ||
    categoryName.includes('your-new-keyword')) {  // ← Add here
  return 'category-b';
}
```

### To Change a Category Color

Edit `/frontend/src/styles/pos.css`:

```css
/* Find the category and update */
.pos-page.dark-mode .pos-product-card.category-a {
  background-color: #NEW_COLOR;    /* ← Change here */
  border-color: #NEW_BORDER;       /* ← And here */
}

.pos-page.dark-mode .pos-product-card.category-a:hover {
  background-color: #NEW_HOVER;    /* ← And here */
  border-color: #NEW_HOVER_BORDER; /* ← And here */
}
```

---

## 💡 Design Philosophy

### Three-Category System Benefits

1. **Visual Scanning**
   - Quick product identification
   - Reduced cognitive load
   - Professional industrial feel

2. **Color Psychology**
   - Navy: Trust, Stability (Primary items)
   - Amber: Warmth, Value (Accessories)
   - Slate: Neutral, Professional (Others)

3. **Accessibility**
   - WCAG AA compliant contrast
   - Distinct colors for different eyesight
   - Not reliant on color alone

4. **Scalability**
   - Easy to add new categories
   - Simple keyword-based detection
   - No backend changes required

---

## 📋 Verification Checklist

Light Mode:
- [ ] All products show same light slate color (#F1F5F9)
- [ ] Text is dark and readable (#1E293B)
- [ ] Stock badges are white with dark text
- [ ] Hover effect is subtle

Dark Mode:
- [ ] Category A products are Navy (#1E3A8A)
- [ ] Category B products are Amber (#92400E)
- [ ] Category C products are Slate (#334155)
- [ ] Stock badges have high contrast
- [ ] Hover effects show color shift and shadow
- [ ] Text is pure white on all tiles
- [ ] Border colors match category scheme
- [ ] Transitions are smooth (0.1s)

General:
- [ ] No text truncation issues
- [ ] Stock numbers visible in top-right
- [ ] Product names centered and visible
- [ ] Mobile responsive
- [ ] No performance issues with many products
