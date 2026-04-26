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

// Letter page = 11in; PDF margins are 0.25in top + 0.25in bottom = 0.5in total
// Effective printable content height per page = 10.5in * 96px/in = 1008px
const PAGE_HEIGHT_PX = 10.5 * 96
// Height of the visible page-gap band
const GAP_PX = 14

export default function ResumePreview({ content, templateId, paletteIndex = 0, fontScale = 1.0 }) {
  const Template   = COMPONENT_MAP[templateId]
  const tpl        = TEMPLATE_MAP[templateId]
  const paperRef   = useRef()
  const [breaks, setBreaks] = useState([])

  const paletteColors = tpl?.palettes?.[paletteIndex]?.colors ?? {}

  useEffect(() => {
    if (!paperRef.current) return
    const el = paperRef.current
    const compute = () => {
      // scrollHeight is in outer-div coords (no zoom); page boundaries are
      // always at PAGE_HEIGHT_PX intervals in that same space.
      const h = el.scrollHeight
      const count = Math.floor(h / PAGE_HEIGHT_PX)
      setBreaks(Array.from({ length: count }, (_, i) => (i + 1) * PAGE_HEIGHT_PX))
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
      style={{ width: '8.5in', minHeight: '11in', background: '#fff', margin: '0 auto', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', position: 'relative', overflow: 'visible' }}
    >
      <div style={{ zoom: fontScale }}>
        <Template content={content} paletteColors={paletteColors} />
      </div>

      {breaks.map((y, idx) => (
        <div
          key={y}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: y - GAP_PX / 2,
            height: GAP_PX,
            pointerEvents: 'none',
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* bottom shadow of the page above */}
          <div style={{
            flex: '0 0 50%',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.10) 100%)',
          }} />
          {/* top shadow of the page below */}
          <div style={{
            flex: '0 0 50%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.10) 100%)',
          }} />

          {/* page-break hairline centered in the gap */}
          <div style={{
            position: 'absolute',
            left: 0, right: 0,
            top: '50%',
            borderTop: '1px solid #cbd5e1',
          }} />

          {/* label to the right of the resume */}
          <div style={{
            position: 'absolute',
            left: 'calc(100% + 10px)',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '10px',
            fontWeight: 600,
            color: '#94a3b8',
            whiteSpace: 'nowrap',
            letterSpacing: '0.3px',
          }}>
            Page {idx + 2}
          </div>
        </div>
      ))}
    </div>
  )
}
