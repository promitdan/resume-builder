import { useRef, useEffect, useState } from 'react'
import ClassicTemplate   from './templates/ClassicTemplate'
import ModernTemplate    from './templates/ModernTemplate'
import MinimalTemplate   from './templates/MinimalTemplate'
import ExecutiveTemplate from './templates/ExecutiveTemplate'
import CreativeTemplate  from './templates/CreativeTemplate'

const MAP = { classic: ClassicTemplate, modern: ModernTemplate, minimal: MinimalTemplate, executive: ExecutiveTemplate, creative: CreativeTemplate }

// 11in at 96 CSS px/in = 1056px
const PAGE_HEIGHT_PX = 11 * 96

export default function ResumePreview({ content, templateId }) {
  const Template   = MAP[templateId]
  const paperRef   = useRef()
  const [breaks, setBreaks] = useState([])

  useEffect(() => {
    if (!paperRef.current) return
    const el = paperRef.current
    const compute = () => {
      const h = el.scrollHeight
      const count = Math.floor(h / PAGE_HEIGHT_PX)
      setBreaks(Array.from({ length: count }, (_, i) => (i + 1) * PAGE_HEIGHT_PX))
    }
    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    return () => ro.disconnect()
  }, [content, templateId])

  if (!Template) return <div style={{ padding: '20px', color: '#e53e3e' }}>Unknown template: {templateId}</div>

  return (
    <div
      ref={paperRef}
      style={{ width: '8.5in', minHeight: '11in', background: '#fff', margin: '0 auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', position: 'relative' }}
    >
      <Template content={content} />

      {breaks.map((y, idx) => (
        <div
          key={y}
          style={{ position: 'absolute', left: 0, right: 0, top: y, pointerEvents: 'none', zIndex: 20 }}
        >
          {/* dashed rule */}
          <div style={{ borderTop: '1.5px dashed rgba(99,102,241,0.45)' }} />

          {/* left label — page above */}
          <div style={{
            position: 'absolute',
            left: '10px',
            top: '-13px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: '#6366f1',
            color: '#fff',
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '0.6px',
            padding: '2px 8px',
            borderRadius: '8px',
            opacity: 0.85,
          }}>
            PAGE {idx + 1} / PAGE {idx + 2}
          </div>
        </div>
      ))}
    </div>
  )
}
