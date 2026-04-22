# Resume Builder v2 — UI Redesign, Parsing Fixes, Upload Flow

## Goal
Fix three major user-facing issues: inaccurate resume parsing for real-world two-column PDFs, wrong post-upload navigation, and unprofessional UI across all pages.

## Design Decisions

| Decision | Choice |
|---|---|
| Visual style | Clean Light — `#3b82f6` blue on white, slate grays |
| Landing layout | Focused Hero — centered, single-column, upload zone revealed inline |
| Post-upload flow | Navigate directly to `/preview` (not `/build`) |
| Wizard navigation | Left sidebar stepper — all steps listed, completed steps clickable |

## 1. Parsing Fixes

### Root causes (from user's actual two-column PDF resume):

1. **Role/company order reversed** — Resume uses `"Company, Location — Role"` format (e.g. `"Nutanix, Bengaluru — Member of Technical Staff-4"`). Parser assumes `"Role — Company"`, producing inverted results.
2. **Numbered bullets not recognized** — Parser handles `• – * -` but resume uses `1. 2. 3.` lists. All numbered bullet content is misread as new job entries.
3. **Location embedded in company field** — `"Nutanix, Bengaluru"` needs the city split into the `location` field.
4. **`EXTRA-CURRICULARS` not in section patterns** — dropped silently.
5. **Achievements section** — stored as raw custom lines rather than structured award entries.

### Fixes:
- Detect `Company, City — Role` pattern: if the left side of `—` contains a comma, treat it as `company, location` and the right side as `role`.
- Add `^\d+\.\s+` to bullet detection.
- Add `extra.curriculars?` to the `custom` section regex.
- Tighten `ACHIEVEMENTS` → stored as `awards` array with `{ id, name, date, issuer }` shape (name = full line).

## 2. Post-Upload Navigation

Single change: `navigate('/build')` → `navigate('/preview')` in `UploadDropzone.jsx`.

The `/preview` page already renders the resume. A prominent "Edit Resume" button on the preview sidebar sends the user into the wizard at step 1 with content pre-loaded.

## 3. UI Redesign

### Color System
```
Primary:         #3b82f6
Primary dark:    #2563eb
Primary light:   #eff6ff
Primary border:  #bfdbfe
Heading text:    #0f172a
Body text:       #334155
Muted text:      #64748b
Placeholder:     #94a3b8
Border:          #e2e8f0
Surface:         #f8fafc
White:           #ffffff
Danger:          #ef4444
```

### Typography
Import **Inter** from Google Fonts. Apply `font-family: 'Inter', system-ui, sans-serif` globally via `index.html`.

### Landing Page (`/`)
- `#f8fafc` full-height background
- White navbar: logo `"Resume`**`Builder`**`"` left-aligned, no nav links
- Centered hero column (max-width 480px):
  - Pill badge: `"FREE · NO SIGN-UP REQUIRED"` in blue
  - H1: `"Build a resume that gets you hired"` — bold, `#0f172a`
  - Subtitle: `"Guided wizard, 5 professional templates, PDF & DOCX export. Done in minutes."`
  - Two CTAs side-by-side: `"Start from scratch →"` (blue filled) and `"⬆ Upload resume"` (white outline)
  - Upload dropzone: inline below CTAs, revealed on "Upload resume" click, blue dashed border, `#eff6ff` background
- Trust bar pinned at bottom: `"✓ No account needed · ✓ 5 templates · ✓ Free PDF & DOCX"`

### Wizard (`/build`) — Left Sidebar Stepper
- White sidebar 200px wide, `#e2e8f0` right border
- Logo at top of sidebar
- 7 steps listed vertically:
  - **Completed**: filled blue circle with `✓`, blue label, cursor pointer, clicking jumps to that step
  - **Current**: blue-bordered circle with number, bold blue label
  - **Future**: gray-bordered circle, gray label, `cursor: default`
- Main area: `#f8fafc` background, white card centered (max-width 680px), `24px` padding, `10px` border-radius, subtle shadow
- No explicit Back button — clicking any completed sidebar step acts as back/jump
- `"Next →"` / `"Finish"` button bottom-right of card

### Preview Page (`/preview`)
- White navbar: logo left, `"← Back to Edit"` button right
- Two-column layout: resume preview (dominant, left) + 240px right sidebar
- Sidebar top: `"✏ Edit Resume"` button (full width, blue filled)
- Below: Template section with TemplateSwitcher, Download section with DownloadButtons

### Wizard Step Forms
- White card container, 24px padding, 10px border-radius, `box-shadow: 0 1px 3px rgba(0,0,0,0.08)`
- Labels: 13px, `#334155`, font-weight 600, 6px margin-bottom
- Inputs: `9px 13px` padding, `1px solid #e2e8f0` border, 6px border-radius, 15px font-size
- Focus: `border-color: #3b82f6`, `box-shadow: 0 0 0 3px #eff6ff`
- "Add" buttons: blue dashed border, full width
- "Remove" buttons: `#ef4444` text, no background
