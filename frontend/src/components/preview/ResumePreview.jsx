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

export const CONTENT_HEIGHT = 11 * 96  // 1056px — letter page at 96dpi
export const PAGE_GAP = 24             // gray gap between page cards

export default function ResumePreview({ content, templateId, paletteIndex = 0, fontScale = 1.0, onBreaksChange }) {
  const Template      = COMPONENT_MAP[templateId]
  const tpl           = TEMPLATE_CONFIGS[templateId]
  const measureRef    = useRef()
  const [totalPages, setTotalPages] = useState(1)

  const paletteColors = tpl?.palettes?.[paletteIndex]?.colors ?? {}

  useEffect(() => {
    if (!measureRef.current) return
    const el = measureRef.current
    const compute = () => {
      const h = el.scrollHeight
      const pages = Math.max(1, Math.ceil(h / CONTENT_HEIGHT))
      setTotalPages(pages)
      onBreaksChange?.(pages)
    }
    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    return () => ro.disconnect()
  }, [content, templateId, fontScale, onBreaksChange])

  if (!Template) return <div style={{ padding: '20px', color: '#e53e3e' }}>Unknown template: {templateId}</div>

  return (
    <div style={{ width: '8.5in', margin: '0 auto' }}>
      {/* Hidden full render for height measurement */}
      <div
        ref={measureRef}
        style={{ position: 'absolute', left: '-9999px', top: 0, width: '8.5in', visibility: 'hidden', pointerEvents: 'none' }}
      >
        <div style={{ zoom: fontScale }}>
          <Template content={content} paletteColors={paletteColors} />
        </div>
      </div>

      {/* N visible page cards */}
      {Array.from({ length: totalPages }, (_, i) => (
        <div
          key={i}
          style={{
            width: '8.5in',
            height: `${CONTENT_HEIGHT}px`,
            overflow: 'hidden',
            background: '#fff',
            boxShadow: '0 2px 16px rgba(0,0,0,0.15)',
            marginBottom: i < totalPages - 1 ? `${PAGE_GAP}px` : 0,
          }}
        >
          <div style={{ transform: `translateY(${-i * CONTENT_HEIGHT}px)` }}>
            <div style={{ zoom: fontScale }}>
              <Template content={content} paletteColors={paletteColors} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
