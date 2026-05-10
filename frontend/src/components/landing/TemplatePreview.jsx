// frontend/src/components/landing/TemplatePreview.jsx
import { useRef, useState, useEffect } from 'react'

const TEMPLATE_WIDTH  = 745
const TEMPLATE_HEIGHT = 1054

export default function TemplatePreview({ Component, paletteColors, content }) {
  const containerRef = useRef(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width
      if (w > 0) setScale(w / TEMPLATE_WIDTH)
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
      <div style={{
        width: TEMPLATE_WIDTH,
        height: TEMPLATE_HEIGHT,
        transformOrigin: 'top left',
        transform: `scale(${scale})`,
        pointerEvents: 'none',
        userSelect: 'none',
      }}>
        <Component content={content} paletteColors={paletteColors} pageIndex={0} />
      </div>
    </div>
  )
}
