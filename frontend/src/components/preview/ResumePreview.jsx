import { useRef, useEffect, useState } from 'react'
import ClassicTemplate         from './templates/ClassicTemplate'
import ClassicAcademicTemplate from './templates/ClassicAcademicTemplate'
import ClassicFormalTemplate   from './templates/ClassicFormalTemplate'
import ModernTemplate          from './templates/ModernTemplate'
import ModernSidebarTemplate   from './templates/ModernSidebarTemplate'
import ModernBannerTemplate    from './templates/ModernBannerTemplate'
import ModernSplitTemplate     from './templates/ModernSplitTemplate'
import MinimalTemplate         from './templates/MinimalTemplate'
import MinimalColumnsTemplate  from './templates/MinimalColumnsTemplate'
import MinimalBoxedTemplate    from './templates/MinimalBoxedTemplate'
import MinimalSerifTemplate    from './templates/MinimalSerifTemplate'
import ExecutiveTemplate         from './templates/ExecutiveTemplate'
import ExecutiveBandTemplate    from './templates/ExecutiveBandTemplate'
import ExecutiveSidebarTemplate from './templates/ExecutiveSidebarTemplate'
import CreativeTemplate        from './templates/CreativeTemplate'
import CreativeStarTemplate    from './templates/CreativeStarTemplate'
import CreativeMinimalTemplate from './templates/CreativeMinimalTemplate'
import { TEMPLATE_CONFIGS }    from '../../registry/templateRegistry'

const COMPONENT_MAP = {
  'classic':             ClassicTemplate,
  'classic-traditional': ClassicTemplate,
  'classic-academic':    ClassicAcademicTemplate,
  'classic-formal':      ClassicFormalTemplate,
  'modern':              ModernTemplate,
  'modern-sidebar':      ModernSidebarTemplate,
  'modern-banner':       ModernBannerTemplate,
  'modern-split':        ModernSplitTemplate,
  'minimal':             MinimalTemplate,
  'minimal-columns':    MinimalColumnsTemplate,
  'minimal-boxed':      MinimalBoxedTemplate,
  'minimal-serif':      MinimalSerifTemplate,
  'executive':           ExecutiveTemplate,
  'executive-band':      ExecutiveBandTemplate,
  'executive-sidebar':   ExecutiveSidebarTemplate,
  'creative':            CreativeTemplate,
  'creative-star':       CreativeStarTemplate,
  'creative-minimal':    CreativeMinimalTemplate,
}

export const CONTENT_HEIGHT = 11 * 96   // 1056px — letter page at 96dpi
export const PAGE_GAP = 24              // gap between page cards
const PAGE_INSET = 48                                    // top/bottom padding for pages 2+
const FIRST_VISIBLE = CONTENT_HEIGHT - PAGE_INSET        // 1008px — page 1 has no top inset
const VISIBLE_HEIGHT = CONTENT_HEIGHT - 2 * PAGE_INSET   // 960px — pages 2+ have top + bottom inset

// CSS custom properties injected on the template wrapper — templates reference these via var()
const FONT_SIZE_VARS = {
  small:  { '--resume-body': '12px', '--resume-meta': '11px', '--resume-label': '10px', '--resume-sub': '13px' },
  medium: { '--resume-body': '14px', '--resume-meta': '13px', '--resume-label': '11px', '--resume-sub': '15px' },
  large:  { '--resume-body': '16px', '--resume-meta': '15px', '--resume-label': '12px', '--resume-sub': '17px' },
}

function computeSmartBreaks(containerEl, firstVisibleHeight, visibleHeight) {
  const containerRect = containerEl.getBoundingClientRect()
  const totalHeight = containerEl.scrollHeight
  const allEls = Array.from(containerEl.querySelectorAll('div, p, li, span'))

  const breaks = [0]
  let pageStart = 0
  let isFirst = true

  while (pageStart < totalHeight) {
    const pageVH  = isFirst ? firstVisibleHeight : visibleHeight
    const pageEnd = pageStart + pageVH
    if (pageEnd >= totalHeight) break

    // Find the bottom edge of the last element that fits completely on this page.
    // Large structural divs (minHeight: '11in', flex containers) are naturally excluded
    // because their bottom > pageEnd.
    let lastFitBottom = -1
    for (const el of allEls) {
      const r = el.getBoundingClientRect()
      const top = r.top - containerRect.top
      const bottom = r.bottom - containerRect.top
      if (top > pageStart && bottom <= pageEnd && r.height > 0 && bottom > lastFitBottom) {
        lastFitBottom = bottom
      }
    }

    const nextBreak = lastFitBottom > pageStart + 50 ? lastFitBottom : pageEnd
    breaks.push(nextBreak)
    pageStart = nextBreak
    isFirst = false
  }

  return breaks
}

export default function ResumePreview({ content, templateId, paletteIndex = 0, fontSize = 'medium', onBreaksChange }) {
  const Template      = COMPONENT_MAP[templateId]
  const tpl           = TEMPLATE_CONFIGS[templateId]
  const measureRef    = useRef()
  const [pageBreaks, setPageBreaks] = useState([0])

  const paletteColors = tpl?.palettes?.[paletteIndex]?.colors ?? {}
  const fontVars      = FONT_SIZE_VARS[fontSize] ?? FONT_SIZE_VARS.medium
  const totalPages    = pageBreaks.length

  useEffect(() => {
    if (!measureRef.current) return
    const el = measureRef.current
    const compute = () => {
      const breaks = computeSmartBreaks(el, FIRST_VISIBLE, VISIBLE_HEIGHT)
      setPageBreaks(breaks)
      onBreaksChange?.(breaks.length)
    }
    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    return () => ro.disconnect()
  }, [content, templateId, fontSize, onBreaksChange])

  if (!Template) return <div style={{ padding: '20px', color: '#e53e3e' }}>Unknown template: {templateId}</div>

  return (
    <div style={{ width: '8.5in', margin: '0 auto' }}>
      {/* Hidden full render for height measurement and break computation */}
      <div
        ref={measureRef}
        style={{ position: 'absolute', left: '-9999px', top: 0, width: '8.5in', visibility: 'hidden', pointerEvents: 'none', ...fontVars }}
      >
        <Template content={content} paletteColors={paletteColors} />
      </div>

      {/* N stacked page cards */}
      {pageBreaks.map((breakY, i) => {
        const pageVH    = i === 0 ? FIRST_VISIBLE : VISIBLE_HEIGHT
        const nextBreak = pageBreaks[i + 1] ?? (breakY + pageVH)
        const clipHeight = Math.min(pageVH, nextBreak - breakY)
        const paddingTop = i === 0 ? 0 : PAGE_INSET
        return (
          <div
            key={i}
            className="page"
            style={{
              width: '8.5in',
              height: `${CONTENT_HEIGHT}px`,
              paddingTop: `${paddingTop}px`,
              paddingBottom: `${PAGE_INSET}px`,
              boxSizing: 'border-box',
              background: '#fff',
              boxShadow: '0 2px 16px rgba(0,0,0,0.15)',
              marginBottom: i < totalPages - 1 ? `${PAGE_GAP}px` : 0,
            }}
          >
            <div
              className="page-content"
              style={{ width: '100%', height: `${clipHeight}px`, overflow: 'hidden', position: 'relative' }}
            >
              <div style={{ transform: `translateY(${-breakY}px)`, width: '8.5in', ...fontVars }}>
                <Template content={content} paletteColors={paletteColors} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
