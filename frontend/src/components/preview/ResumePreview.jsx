import { useRef, useEffect, useState } from 'react'
import ClassicTemplate   from './templates/ClassicTemplate'
import ModernTemplate    from './templates/ModernTemplate'
import MinimalTemplate   from './templates/MinimalTemplate'
import ExecutiveTemplate from './templates/ExecutiveTemplate'
import CreativeTemplate  from './templates/CreativeTemplate'
import classicTpl   from '../../templates/classic.json'
import modernTpl    from '../../templates/modern.json'
import minimalTpl   from '../../templates/minimal.json'
import executiveTpl from '../../templates/executive.json'
import creativeTpl  from '../../templates/creative.json'

const COMPONENT_MAP = { classic: ClassicTemplate, modern: ModernTemplate, minimal: MinimalTemplate, executive: ExecutiveTemplate, creative: CreativeTemplate }
const TEMPLATE_MAP  = { classic: classicTpl, modern: modernTpl, minimal: minimalTpl, executive: executiveTpl, creative: creativeTpl }

// 11in at 96 CSS px/in = 1056px
const PAGE_HEIGHT_PX = 11 * 96

export default function ResumePreview({ content, templateId, paletteIndex = 0, fontScale = 1.0 }) {
  const Template   = COMPONENT_MAP[templateId]
  const tpl        = TEMPLATE_MAP[templateId]
  const paperRef   = useRef()
  const [breaks, setBreaks] = useState([])

  const paletteColors = tpl?.palettes?.[paletteIndex]?.colors ?? {}

  useEffect(() => {
    if (!paperRef.current) return
    const el = paperRef.current
    const scaledPageH = PAGE_HEIGHT_PX * fontScale
    const compute = () => {
      const h = el.scrollHeight
      const count = Math.floor(h / scaledPageH)
      setBreaks(Array.from({ length: count }, (_, i) => (i + 1) * scaledPageH))
    }
    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    return () => ro.disconnect()
  }, [content, templateId, fontScale])

  if (!Template) return <div style={{ padding: '20px', color: '#e53e3e' }}>Unknown template: {templateId}</div>

  return (
    <div
      ref={paperRef}
      style={{ width: '8.5in', minHeight: '11in', background: '#fff', margin: '0 auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', position: 'relative' }}
    >
      <div style={{ zoom: fontScale }}>
        <Template content={content} paletteColors={paletteColors} />
      </div>

      {breaks.map((y, idx) => (
        <div
          key={y}
          style={{ position: 'absolute', left: 0, right: 0, top: y, pointerEvents: 'none', zIndex: 20 }}
        >
          {/* shadow above (bottom of page N) */}
          <div style={{ height: '18px', background: 'linear-gradient(to top, rgba(0,0,0,0.06) 0%, transparent 100%)', marginTop: '-18px' }} />

          {/* hairline */}
          <div style={{ borderTop: '1.5px dashed rgba(99,102,241,0.5)' }} />

          {/* shadow below (top of page N+1) */}
          <div style={{ height: '18px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.06) 0%, transparent 100%)' }} />

          {/* page label in right margin */}
          <div style={{
            position: 'absolute',
            right: '-80px',
            top: '-11px',
            background: '#6366f1',
            color: '#fff',
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '0.5px',
            padding: '2px 7px',
            borderRadius: '6px',
            opacity: 0.85,
            whiteSpace: 'nowrap',
          }}>
            {idx + 1} / {idx + 2}
          </div>
        </div>
      ))}
    </div>
  )
}
