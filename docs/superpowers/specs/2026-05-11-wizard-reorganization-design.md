# Wizard Reorganization Design

**Date:** 2026-05-11  
**Status:** Approved

## Problem

The current wizard starts by prefilling a form immediately, with template selection buried as step 6 of 7. Users have no sense of what the final output will look like until the very end, and the form feels disconnected from the resume being built.

## Goal

Improve the user journey by:
1. Starting with template selection so users have visual intent before typing
2. Showing a live resume preview at all times during form-filling, so every field change is immediately visible in context

## Flow

```
Landing Page → [Phase 1] Template Gallery → [Phase 2] Step Editor → /preview
```

Both phases live at `/build`. No new routes.

## Phase 1: Template Gallery

Full-screen gallery occupying the entire viewport.

**Layout:**
- Header: ResumeForge logo + "Choose a template to get started" headline
- 5 large family cards in a horizontal row: Classic, Modern, Minimal, Executive, Creative
  - Each card shows a representative thumbnail and the family name
  - Clicking a card selects that family and expands a variant row below it
  - The previously expanded family collapses (accordion — one open at a time)
- Variant row: 2–3 thumbnail cards for the variants within the selected family
  - Selected variant gets a blue ring
- "Start building →" button: appears once a variant is selected, positioned below the variant row
  - Default: whichever template is currently in the store (`classic-traditional` on fresh start)
  - Clicking transitions to Phase 2 and sets the selected template in the store

**Interaction:**
- No "Next" or progress concept — this is a single-screen picker
- User can return to Phase 1 from Phase 2 via the template thumbnail in the top bar (see below)

## Phase 2: Step Editor

Two-panel layout with a slim top bar.

### Top Bar (~52px tall)

Left to right:
- **Template thumbnail** (small, ~28×36px): shows the currently selected template. Clicking returns the user to Phase 1 (sets phase back to `'gallery'`). Tooltip: "Change template"
- **Step progress** (center): breadcrumb-style — `Personal → Experience → Education → Skills → Optional Sections`. Active step is highlighted (blue). Completed steps show a ✓ and are clickable to jump back. Future steps are muted.
- **Progress bar fill** (right of steps): thin bar showing overall completion percentage
- **"Finish →" button** (far right): always enabled, navigates to `/preview`

### Left Panel (~55% width, scrollable)

The current step's form component. Content is identical to the existing step components — no changes to form logic or fields.

### Right Panel (~45% width, fixed height)

Live `ResumePreview` component:
- Scaled to fit the panel height using CSS `transform: scale()`. Scale factor = `panelHeight / CONTENT_HEIGHT` so the full first page is always visible without scrolling.
- Uses the current `templateId`, `paletteIndex`, `fontSize`, and `content` from the store
- Updates in real time as the user types in the left panel
- Read-only (no inline editing in this view)

### Steps (in order)

1. Personal Info (`PersonalInfoStep`)
2. Work Experience (`ExperienceStep`)
3. Education (`EducationStep`)
4. Skills (`SkillsStep`)
5. Optional Sections (`OptionalSectionsStep`)

## Component Changes

| Component | Change |
|---|---|
| `BuildPage.jsx` | Add `phase` state (`'gallery' \| 'editor'`). Render `TemplateGallery` or the new editor shell based on phase. |
| `WizardLayout.jsx` | Replace entirely with new two-panel editor shell (top bar + left form + right live preview). |
| `TemplateGallery.jsx` | **New component.** Implements Phase 1: family cards + variant accordion + "Start building →" CTA. |
| `TemplatePickerStep.jsx` | **Retired.** Functionality replaced by `TemplateGallery`. |
| `PreviewStep.jsx` | **Retired.** Preview is always visible in the right panel of Phase 2. |
| `PersonalInfoStep.jsx` | No change. |
| `ExperienceStep.jsx` | No change. |
| `EducationStep.jsx` | No change. |
| `SkillsStep.jsx` | No change. |
| `OptionalSectionsStep.jsx` | No change. |
| `ResumePreview.jsx` | No change. Used as-is in the right panel. |

## Store

No store changes required. `templateId` is set by `TemplateGallery` via the existing `setTemplateId` action when the user selects a variant.

## Template Gallery Data

`TemplateGallery` derives its data from the existing `TEMPLATE_CONFIGS` in `templateRegistry.js` and the existing `COMPONENT_MAP` in `ResumePreview.jsx`. No new data structures needed — family grouping is inferred from the template ID prefix (e.g., `classic-*`, `modern-*`).

## Out of Scope

- Palette / font size controls in Phase 2 (those remain on `/preview`)
- Inline editing on the preview panel
- Mobile / responsive layout
- Any changes to form field content or validation
