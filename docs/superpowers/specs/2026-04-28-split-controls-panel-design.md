# Split Controls Panel — Design Spec

**Date:** 2026-04-28  
**Status:** Approved

## Problem

The right sidebar stacks all controls vertically in a single 240px flex column. The template switcher (17 templates, 2-column thumbnail grid) dominates the vertical space, pushing color, font size, and download controls well below the fold. Users must scroll the sidebar to reach controls they need constantly.

## Goal

Restructure the controls panel so that all controls are visible and reachable without scrolling. Template selection gets its own scrollable column; color, font size, and download controls are always visible beside it.

## Design

### Layout

The right sidebar becomes a **split panel** with two side-by-side columns inside a single bordered container:

```
┌─────────────────────────────────────────────┐
│  LEFT (160px)        │  RIGHT (flex: 1)      │
│  ─────────────────── │  ─────────────────── │
│  TEMPLATES header    │  [← Edit Resume]      │
│  ┌──────────────────┐│                       │
│  │ thumb  │ thumb   ││  COLOR                │
│  │ thumb  │ thumb   ││  ● ● ● ●              │
│  │ thumb  │ thumb   ││                       │
│  │   ...  │  ...    ││  FONT SIZE            │
│  │ (scroll│s here)  ││  [S] [M] [L]          │
│  └──────────────────┘│                       │
│                      │  (spacer)             │
│                      │  ─────────────────── │
│                      │  [⬇ Download PDF]     │
│                      │  [⬇ Download DOCX]    │
└─────────────────────────────────────────────┘
```

**Outer panel:**
- `width: 320px`, `flexShrink: 0`
- `display: 'flex'` (row, no gap — columns sit directly against each other)
- `border: '1px solid #e2e8f0'`, `borderRadius: '10px'`, `overflow: 'hidden'`
- `height: 'calc(100vh - 120px)'` — matches the preview area's `maxHeight`
- `background: '#fff'`

**Left column:**
- `width: 160px`, `flexShrink: 0`
- `borderRight: '1px solid #e2e8f0'`
- `display: 'flex'`, `flexDirection: 'column'`, `overflow: 'hidden'`
- Header bar: `padding: '10px 12px 8px'`, label `"TEMPLATES"` in uppercase 10px gray (`#94a3b8`), `borderBottom: '1px solid #f1f5f9'`
- Scrollable body: `flex: 1`, `overflowY: 'auto'`, `padding: '10px'`
- Contains `<TemplateSwitcher />` unchanged — its internal 2-col grid naturally fills the column width

**Right column:**
- `flex: 1`, `display: 'flex'`, `flexDirection: 'column'`, `padding: '12px'`, `gap: '0'`, `overflow: 'hidden'`
- **Edit Resume button** at top: same style as the current sidebar button (`#3b82f6` bg, white text, hover `#2563eb`)
- `marginBottom: '16px'` after button
- **Color section**: section label + palette swatches — same markup as current, no card wrapper
- `marginBottom: '16px'` after color section
- **Font size section**: section label + S/M/L buttons — same markup as current, no card wrapper
- **Spacer** (`flex: 1`) pushes download to bottom
- **Divider**: `height: 1px`, `background: '#f1f5f9'`, `margin: '0 -12px 12px'`
- **Download buttons**: `<DownloadButtons />` unchanged

### Section labels

Both Color and Font Size sections use the same label style:  
`fontSize: '11px'`, `fontWeight: 700`, `textTransform: 'uppercase'`, `letterSpacing: '0.5px'`, `color: '#94a3b8'`, `marginBottom: '8px'`

The `"Color"` label also keeps its palette name span on the right (`palettes[paletteIndex]?.label` or `"Monochrome"`) — same as current.

## Changes

### 1. `frontend/src/pages/PreviewPage.jsx`

**Only the right sidebar block changes** (lines 116–200). Everything else — navbar, preview area, page navigation pill, state management — is untouched.

Replace:
```jsx
{/* Right sidebar */}
<div style={{ width: '240px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
  {/* Edit Resume button */}
  {/* Template switcher card */}
  {/* Color palette card */}
  {/* Typography card */}
  {/* Download card */}
</div>
```

With the split panel structure described above.

### 2. `frontend/src/components/preview/TemplateSwitcher.jsx`

**No changes.** The component renders a flex column of categories, each with a 2-col grid. It will scroll naturally inside the left column's scrollable container.

## What stays the same

- All state (templateId, paletteIndex, fontSize) and Zustand store hooks are unchanged
- `TemplateSwitcher`, `DownloadButtons` component APIs are unchanged
- Navbar and `← Back to Edit` button in the navbar are unchanged
- Preview area, scroll ref, page navigation pill are unchanged
- All inline styles on existing color/font/download controls are reused as-is, just without the card wrappers
