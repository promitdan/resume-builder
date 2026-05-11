# Split Controls Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single-column 240px controls sidebar with a split panel — scrollable template grid on the left, color/font/download controls always visible on the right.

**Architecture:** The entire change is in `PreviewPage.jsx`. The right sidebar block (currently a vertical flex column of card-wrapped sections) is replaced with a single bordered container holding two flex columns. `TemplateSwitcher` and `DownloadButtons` component APIs are unchanged.

**Tech Stack:** React, inline styles (no CSS files), Zustand store

---

## File Map

| Action | File | What changes |
|--------|------|--------------|
| Modify | `frontend/src/pages/PreviewPage.jsx` | Replace right sidebar (lines 116–200) with split panel |

---

## Task 1: Replace the right sidebar with the split panel

**Files:**
- Modify: `frontend/src/pages/PreviewPage.jsx:116-200`

- [ ] **Step 1: Replace the right sidebar JSX**

  Open `frontend/src/pages/PreviewPage.jsx`. Find the comment `{/* Right sidebar */}` at line 116. Replace everything from line 116 to line 200 (the closing `</div>` of the sidebar) with:

  ```jsx
  {/* Right sidebar — split panel */}
  <div style={{
    width: '320px', flexShrink: 0,
    display: 'flex',
    border: '1px solid #e2e8f0', borderRadius: '10px',
    overflow: 'hidden', background: '#fff',
    height: 'calc(100vh - 120px)',
  }}>

    {/* Left column: scrollable template list */}
    <div style={{
      width: '160px', flexShrink: 0,
      borderRight: '1px solid #e2e8f0',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '10px 12px 8px',
        fontSize: '10px', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.5px',
        color: '#94a3b8',
        borderBottom: '1px solid #f1f5f9',
        flexShrink: 0,
      }}>
        Templates
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
        <TemplateSwitcher />
      </div>
    </div>

    {/* Right column: static controls */}
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      padding: '12px', overflow: 'hidden',
    }}>

      {/* Edit Resume button */}
      <button
        type="button"
        onClick={() => navigate('/build')}
        style={{
          width: '100%', background: '#3b82f6', color: '#fff',
          fontWeight: 600, fontSize: '13px', padding: '9px',
          borderRadius: '8px', border: 'none', cursor: 'pointer',
          marginBottom: '16px',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#2563eb'}
        onMouseLeave={e => e.currentTarget.style.background = '#3b82f6'}
      >
        ✏ Edit Resume
      </button>

      {/* Color section */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8' }}>Color</span>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>
            {isMonochrome ? 'Monochrome' : palettes[paletteIndex]?.label}
          </span>
        </div>
        {isMonochrome ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#1a1a1a', boxShadow: '0 0 0 2.5px #fff, 0 0 0 4.5px #1a1a1a', flexShrink: 0 }} />
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>No color variants</span>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {palettes.map((palette, i) => (
              <button
                key={palette.label}
                type="button"
                title={palette.label}
                onClick={() => setPaletteIndex(i)}
                style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: palette.swatch, border: 'none',
                  cursor: 'pointer', padding: 0, flexShrink: 0,
                  boxShadow: i === paletteIndex
                    ? `0 0 0 2.5px #fff, 0 0 0 4.5px ${palette.swatch}`
                    : '0 1px 3px rgba(0,0,0,0.20)',
                  transition: 'box-shadow 0.15s ease',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Font size section */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8', marginBottom: '8px' }}>
          Typography
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {FONT_SIZE_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFontSize(key)}
              style={{
                flex: 1, height: '34px',
                border: `1.5px solid ${fontSize === key ? '#3b82f6' : '#e2e8f0'}`,
                borderRadius: '6px',
                background: fontSize === key ? '#eff6ff' : '#fff',
                color: fontSize === key ? '#3b82f6' : '#334155',
                fontWeight: 600, fontSize: '13px', cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Spacer — pushes download to bottom */}
      <div style={{ flex: 1 }} />

      {/* Divider */}
      <div style={{ height: '1px', background: '#f1f5f9', margin: '0 -12px 12px' }} />

      {/* Download */}
      <DownloadButtons />

    </div>
  </div>
  ```

- [ ] **Step 2: Verify in the browser**

  Run `npm run dev` from `d:/Games/Personal Projects/resume-builder`.

  Open http://localhost:5173 and navigate to the preview page. Verify:
  - The controls panel is ~320px wide with two visible columns
  - Left column shows "TEMPLATES" header and the 2-col thumbnail grid — scrolls independently when there are more templates than fit
  - Right column shows Edit Resume button, Color swatches, Typography S/M/L, and Download PDF/DOCX buttons
  - Download buttons are at the bottom of the right column, not mid-page
  - Clicking a template thumbnail changes the preview
  - Clicking a color swatch changes the palette
  - Clicking S/M/L changes font size
  - Both download buttons work
  - Clicking "Edit Resume" navigates back to /build

- [ ] **Step 3: Commit**

  ```bash
  git add frontend/src/pages/PreviewPage.jsx
  git commit -m "feat: replace sidebar with split panel — scrollable templates + always-visible controls"
  ```
