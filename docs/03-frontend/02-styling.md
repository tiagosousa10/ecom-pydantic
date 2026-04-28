# Styling (style.css)

## Purpose

Contains all CSS styles for the frontend application. Provides a modern, clean design for the e-commerce store.

## Structure

The CSS file is organized by sections:

### Base Styles
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background-color: #f3f4f6;
  color: #1f2937;
}
```

### Major Sections

| Section | Description |
|---------|-------------|
| Header | Navigation bar with logo, menu, user controls |
| Hero | Featured banner with call-to-action |
| Products | Product grid and cards |
| Auth Pages | Login and register forms |
| Product Detail | Single product view |
| Admin Dashboard | Product management interface |
| Chatbot | AI assistant floating widget |

## Key Components

### Buttons
```css
.btn-primary { background-color: #111827; color: white; }
.btn-outline { background-color: white; color: #111827; border: 1px solid #d1d5db; }
.btn-danger { background-color: #ef4444; color: white; }
```

### Product Card
```css
.product-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

### Responsive Design

The CSS uses media queries for different screen sizes:

| Breakpoint | Width | Columns |
|------------|-------|---------|
| Default | < 640px | 1 |
| sm | >= 640px | 2 |
| md | >= 768px | 3 |
| lg | >= 1024px | 4 |

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Dark | #111827 | Primary buttons, text |
| White | #ffffff | Backgrounds |
| Gray 100 | #f3f4f6 | Page background |
| Gray 300 | #d1d5db | Borders |
| Gray 500 | #6b7280 | Secondary text |
| Red | #ef4444 | Error, delete buttons |
| Green | #22c55e | Success states |
| Blue | #3b82f6 | Edit buttons |

## Layout Features

- **Container**: Max-width 1280px, centered
- **Sticky Header**: Stays at top while scrolling
- **Grid System**: Flexible product layout
- **Responsive**: Adapts to mobile/tablet/desktop

## Animation & Transitions

```css
transition: all 0.2s;
transition: box-shadow 0.3s;
```

- Button hover effects
- Card shadow on hover
- Smooth page transitions
