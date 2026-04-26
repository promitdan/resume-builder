import { useRef, useEffect } from 'react'
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

const PAGE_INSET = 48
const CONTENT_HEIGHT = 11 * 96           // 1056px — letter page at 96dpi
const PAGE_HEIGHT_PX = CONTENT_HEIGHT + 2 * PAGE_INSET  // 1152px — frame including margins

export default function ResumePreview({ content, templateId, paletteIndex = 0, fontScale = 1.0, onBreaksChange, currentPage = 1 }) {
  const Template      = COMPONENT_MAP[templateId]
  const tpl           = TEMPLATE_CONFIGS[templateId]
  const paperRef      = useRef()

  const paletteColors = tpl?.palettes?.[paletteIndex]?.colors ?? {}

  useEffect(() => {
    if (!paperRef.current) return
    const el = paperRef.current
    const compute = () => {
      const h = el.scrollHeight
      const count = Math.floor(h / CONTENT_HEIGHT)
      onBreaksChange?.(count + 1)
    }
    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    return () => ro.disconnect()
  }, [content, templateId, fontScale, onBreaksChange])

  const translateY = -(currentPage - 1) * CONTENT_HEIGHT

  if (!Template) return <div style={{ padding: '20px', color: '#e53e3e' }}>Unknown template: {templateId}</div>

  return (
    <div style={{ width: '8.5in', height: `${PAGE_HEIGHT_PX}px`, background: '#e2e8f0', margin: '0 auto', padding: `${PAGE_INSET}px 0`, boxSizing: 'border-box' }}>
      <div style={{ height: '100%', overflow: 'hidden', background: '#fff', boxShadow: '0 4px 24px rgba(0,0,0,0.18)', position: 'relative' }}>
        <div
          ref={paperRef}
          style={{ width: '8.5in', minHeight: '11in', background: '#fff', position: 'relative', transform: `translateY(${translateY}px)`, transition: 'transform 200ms ease' }}
        >
          <div style={{ zoom: fontScale }}>
            <Template content={content} paletteColors={paletteColors} />
          </div>
        </div>
      </div>
    </div>
  )
}
