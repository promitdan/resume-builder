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

const PAGE_HEIGHT_PX = 10.5 * 96
const PAGE_INSET = 48

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
      const count = Math.floor(h / PAGE_HEIGHT_PX)
      const next = Array.from({ length: count }, (_, i) => (i + 1) * PAGE_HEIGHT_PX)
      onBreaksChange?.(next.length + 1)
    }
    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    return () => ro.disconnect()
  }, [content, templateId, fontScale, onBreaksChange])

  const translateY = -(currentPage - 1) * PAGE_HEIGHT_PX + (currentPage > 1 ? PAGE_INSET : 0)

  if (!Template) return <div style={{ padding: '20px', color: '#e53e3e' }}>Unknown template: {templateId}</div>

  return (
    <div style={{ width: '8.5in', height: `${PAGE_HEIGHT_PX}px`, overflow: 'hidden', margin: '0 auto', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
      <div
        ref={paperRef}
        style={{ width: '8.5in', minHeight: '11in', background: '#fff', position: 'relative', transform: `translateY(${translateY}px)`, transition: 'transform 200ms ease' }}
      >
        <div style={{ zoom: fontScale }}>
          <Template content={content} paletteColors={paletteColors} />
        </div>
      </div>   {/* inner resume div */}
    </div>     {/* clip container */}
  )
}
