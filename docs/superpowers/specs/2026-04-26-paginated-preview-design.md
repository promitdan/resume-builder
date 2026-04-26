# Paginated Resume Preview

**Date:** 2026-04-26  
**Status:** Approved

## Problem

The resume preview renders all pages as one continuous scrollable document with thin gray lines marking page breaks. The pill shows "1 / 2" but the user still sees all content at once. This is confusing — the page indicator implies pagination but the view isn't paginated.

## Goal

Show one page of content at a time. Navigating via the prev/next pill buttons switches to the next page's content. Content never bleeds to the visual edges of the page window.

## Approach

CSS clip with `translateY`. The full template renders once in the DOM. A fixed-height `overflow: hidden` container acts as a viewport window. The inner resume element is translated vertically to bring the correct page slice into view. No re-renders on navigation.

## Constants

```
PAGE_HEIGHT_PX = 10.5 * 96   // 1008px — existing value
PAGE_INSET     = 48           // px of breathing room at top of pages 2+
```

## translateY Formula

```
offset = -(currentPage - 1) * PAGE_HEIGHT_PX + (currentPage > 1 ? PAGE_INSET : 0)
```

| Page | translateY |
|------|-----------|
| 1    | 0 |
| 2    | -(PAGE_HEIGHT_PX - PAGE_INSET) = -960px |
| 3    | -(2 * PAGE_HEIGHT_PX - PAGE_INSET) = -1968px |
| N    | -(N-1) * PAGE_HEIGHT_PX + (N > 1 ? PAGE_INSET : 0) |

Page 1 uses the template's natural top padding. Pages 2+ start 48px below the page boundary so content doesn't begin at the raw clip edge.

## Component Changes

### `ResumePreview`

- Accept `currentPage: number` prop (1-based, default 1)
- Outer wrapper: `height: PAGE_HEIGHT_PX`, `overflow: hidden`
- Inner resume div: `transform: translateY(offset)`, `transition: transform 200ms ease`
- Remove page break line divs
- `onBreaksChange` callback stays — parent needs it to compute `totalPages`

### `PreviewPage`

- Remove: `scrollRef`, `handleScroll`, `CONTAINER_PAD`, scroll-based page detection
- Remove: `el.scrollTo(...)` in `goToPage` — replace with `setCurrentPage(page)`
- Pass `currentPage` prop to `ResumePreview`
- Pill prev/next buttons call `goToPage(currentPage ± 1)` — same as today, just no scroll side-effect

## What Is Removed

| Item | Location | Reason |
|------|----------|--------|
| `scrollRef` | PreviewPage | No scroll container |
| `handleScroll` | PreviewPage | Page no longer detected via scroll |
| `CONTAINER_PAD` | PreviewPage | Padding was for scroll offset math |
| `onScroll` handler | PreviewPage JSX | Replaced by button-only navigation |
| Page break `<div>` lines | ResumePreview | Visual lines no longer needed |
| `el.scrollTo(...)` | PreviewPage `goToPage` | Replaced by `setCurrentPage` |

## Out of Scope

- Animated page-flip transitions (beyond simple CSS transition on translateY)
- Thumbnail strip or dot indicators for page position
- Changes to PDF download logic — that path is unaffected
