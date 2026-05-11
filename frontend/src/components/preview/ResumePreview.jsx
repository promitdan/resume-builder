import { useRef, useEffect, useState } from 'react'
import ClassicTemplate          from './templates/ClassicTemplate'
import ClassicAcademicTemplate  from './templates/ClassicAcademicTemplate'
import ClassicFormalTemplate    from './templates/ClassicFormalTemplate'
import ModernTemplate           from './templates/ModernTemplate'
import ModernSidebarTemplate    from './templates/ModernSidebarTemplate'
import ModernBannerTemplate     from './templates/ModernBannerTemplate'
import ModernSplitTemplate      from './templates/ModernSplitTemplate'
import MinimalTemplate          from './templates/MinimalTemplate'
import MinimalColumnsTemplate   from './templates/MinimalColumnsTemplate'
import MinimalBoxedTemplate     from './templates/MinimalBoxedTemplate'
import MinimalSerifTemplate     from './templates/MinimalSerifTemplate'
import ExecutiveTemplate        from './templates/ExecutiveTemplate'
import ExecutiveBandTemplate    from './templates/ExecutiveBandTemplate'
import ExecutiveSidebarTemplate from './templates/ExecutiveSidebarTemplate'
import CreativeTemplate         from './templates/CreativeTemplate'
import CreativeStarTemplate     from './templates/CreativeStarTemplate'
import CreativeMinimalTemplate  from './templates/CreativeMinimalTemplate'
import { TEMPLATE_CONFIGS }     from '../../registry/templateRegistry'
import {
  measureAndDistribute, sliceContent,
  CONTENT_HEIGHT, PAGE_GAP, PAGE_WIDTH,
} from '../../utils/pageLayout'

export const COMPONENT_MAP = {
  'classic':             ClassicTemplate,
  'classic-traditional': ClassicTemplate,
  'classic-academic':    ClassicAcademicTemplate,
  'classic-formal':      ClassicFormalTemplate,
  'modern':              ModernTemplate,
  'modern-sidebar':      ModernSidebarTemplate,
  'modern-banner':       ModernBannerTemplate,
  'modern-split':        ModernSplitTemplate,
  'minimal':             MinimalTemplate,
  'minimal-columns':     MinimalColumnsTemplate,
  'minimal-boxed':       MinimalBoxedTemplate,
  'minimal-serif':       MinimalSerifTemplate,
  'executive':           ExecutiveTemplate,
  'executive-band':      ExecutiveBandTemplate,
  'executive-sidebar':   ExecutiveSidebarTemplate,
  'creative':            CreativeTemplate,
  'creative-star':       CreativeStarTemplate,
  'creative-minimal':    CreativeMinimalTemplate,
}

const FONT_SIZE_VARS = {
  small:  { '--resume-body': '12px', '--resume-meta': '11px', '--resume-label': '10px', '--resume-sub': '13px' },
  medium: { '--resume-body': '14px', '--resume-meta': '13px', '--resume-label': '11px', '--resume-sub': '15px' },
  large:  { '--resume-body': '16px', '--resume-meta': '15px', '--resume-label': '12px', '--resume-sub': '17px' },
}

export { CONTENT_HEIGHT, PAGE_GAP }

export default function ResumePreview({ content, templateId, paletteIndex = 0, fontSize = 'medium', onBreaksChange }) {
  const Template      = COMPONENT_MAP[templateId]
  const tpl           = TEMPLATE_CONFIGS[templateId]
  const measureRef    = useRef()
  const [pageSlices, setPageSlices] = useState([{ slicedContent: content, pageIndex: 0 }])

  const paletteColors = tpl?.palettes?.[paletteIndex]?.colors ?? {}
  const fontVars      = FONT_SIZE_VARS[fontSize] ?? FONT_SIZE_VARS.medium
  const isTwoColumn   = tpl?.layoutType === 'two-column'

  useEffect(() => {
    if (!measureRef.current) return
    const el = measureRef.current

    const compute = () => {
      const result = measureAndDistribute(el, isTwoColumn)
      let slices

      if (result.type === 'single') {
        slices = result.pages.map((assignment, i) => ({
          slicedContent: sliceContent(content, assignment, i),
          pageIndex:     i,
        }))
      } else {
        slices = []
        for (let i = 0; i < result.totalPages; i++) {
          const combined = [
            ...(result.leftPages[i]  ?? []),
            ...(result.rightPages[i] ?? []),
          ]
          slices.push({
            slicedContent: sliceContent(content, combined, i),
            pageIndex:     i,
          })
        }
      }

      if (slices.length === 0) slices = [{ slicedContent: content, pageIndex: 0 }]
      setPageSlices(slices)
      onBreaksChange?.(slices.length)
    }

    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    return () => ro.disconnect()
  }, [content, templateId, fontSize, isTwoColumn, paletteIndex, onBreaksChange])

  if (!Template) return <div style={{ padding: '20px', color: '#e53e3e' }}>Unknown template: {templateId}</div>

  return (
    <div style={{ width: `${PAGE_WIDTH}px`, margin: '0 auto' }}>
      {/* Hidden full render for measurement — always pageIndex=0 so all content is present */}
      <div
        ref={measureRef}
        style={{
          position: 'absolute', left: '-9999px', top: 0,
          width: `${PAGE_WIDTH}px`, visibility: 'hidden', pointerEvents: 'none',
          ...fontVars,
        }}
      >
        <Template content={content} paletteColors={paletteColors} pageIndex={0} />
      </div>

      {/* N page cards — each is a fresh template render with its content slice */}
      {pageSlices.map(({ slicedContent, pageIndex }, i) => (
        <div
          key={`page-${pageIndex}`}
          data-page-card
          className="page"
          style={{
            width:        `${PAGE_WIDTH}px`,
            height:       `${CONTENT_HEIGHT}px`,
            background:   '#fff',
            boxShadow:    '0 2px 16px rgba(0,0,0,0.15)',
            overflow:     'hidden',
            marginBottom: i < pageSlices.length - 1 ? `${PAGE_GAP}px` : 0,
          }}
        >
          <div style={{ ...fontVars }}>
            <Template
              content={slicedContent}
              paletteColors={paletteColors}
              pageIndex={pageIndex}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
