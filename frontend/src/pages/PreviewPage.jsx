import { useNavigate } from 'react-router-dom'
import { useState, useRef, useCallback } from 'react'
import { useResumeStore } from '../store/useResumeStore'
import ResumePreview, { CONTENT_HEIGHT, PAGE_GAP } from '../components/preview/ResumePreview'
import TemplateSwitcher from '../components/preview/TemplateSwitcher'
import DownloadButtons from '../components/shared/DownloadButtons'
import { TEMPLATE_CONFIGS } from '../registry/templateRegistry'

const FONT_SIZE_OPTIONS = [
  { key: 'small',  label: 'S' },
  { key: 'medium', label: 'M' },
  { key: 'large',  label: 'L' },
]

export default function PreviewPage() {
  const content      = useResumeStore(s => s.content)
  const templateId   = useResumeStore(s => s.templateId)
  const paletteIndex = useResumeStore(s => s.paletteIndex)
  const fontSize     = useResumeStore(s => s.fontSize)
  const setPaletteIndex = useResumeStore(s => s.setPaletteIndex)
  const setFontSize     = useResumeStore(s => s.setFontSize)
  const navigate     = useNavigate()

  const tpl      = TEMPLATE_CONFIGS[templateId]
  const palettes = tpl?.palettes ?? []
  const isMonochrome = palettes.length === 0


  // Page navigation
  const scrollRef = useRef()
  const [totalPages, setTotalPages]   = useState(1)
  const [currentPage, setCurrentPage] = useState(1)

  const handleBreaksChange = useCallback((count) => {
    setTotalPages(count)
    setCurrentPage(1)
  }, [])

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const page = Math.floor(el.scrollTop / (CONTENT_HEIGHT + PAGE_GAP)) + 1
    setCurrentPage(Math.min(page, totalPages))
  }, [totalPages])

  const goToPage = useCallback((page) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: (page - 1) * (CONTENT_HEIGHT + PAGE_GAP), behavior: 'smooth' })
    setCurrentPage(page)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontWeight: 800, fontSize: '18px', color: '#0f172a', letterSpacing: '-0.3px' }}>
          Resume<span style={{ color: '#3b82f6' }}>Builder</span>
        </span>
        <button
          type="button"
          onClick={() => navigate('/build')}
          style={{ background: 'none', border: '1.5px solid #e2e8f0', color: '#334155', fontWeight: 600, fontSize: '13px', padding: '7px 16px', borderRadius: '6px', cursor: 'pointer' }}
        >
          ← Back to Edit
        </button>
      </nav>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', gap: '24px', padding: '28px 32px', alignItems: 'flex-start', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {/* Resume preview — dominant */}
        <div style={{ flex: 1, position: 'relative', borderRadius: '10px', overflow: 'hidden', minHeight: '500px' }}>
          {/* Scrollable paper area */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            style={{ overflow: 'auto', maxHeight: 'calc(100vh - 120px)', background: '#e2e8f0', padding: '24px', boxSizing: 'border-box', display: 'flex', justifyContent: 'center' }}
          >
            <ResumePreview
              content={content}
              templateId={templateId}
              paletteIndex={paletteIndex}
              fontSize={fontSize}
              onBreaksChange={handleBreaksChange}
            />
          </div>

          {/* Floating page pill */}
          {totalPages > 1 && (
            <div style={{ position: 'absolute', bottom: '20px', left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 40 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(15,23,42,0.72)', backdropFilter: 'blur(6px)', borderRadius: '999px', padding: '6px 10px', boxShadow: '0 4px 16px rgba(0,0,0,0.28)', pointerEvents: 'auto' }}>
                <button
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  style={{ background: 'none', border: 'none', color: currentPage <= 1 ? 'rgba(255,255,255,0.3)' : '#fff', cursor: currentPage <= 1 ? 'default' : 'pointer', padding: '2px 6px', fontSize: '16px', lineHeight: 1, borderRadius: '6px', display: 'flex', alignItems: 'center' }}
                >
                  ‹
                </button>
                <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600, minWidth: '52px', textAlign: 'center', letterSpacing: '0.2px' }}>
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  style={{ background: 'none', border: 'none', color: currentPage >= totalPages ? 'rgba(255,255,255,0.3)' : '#fff', cursor: currentPage >= totalPages ? 'default' : 'pointer', padding: '2px 6px', fontSize: '16px', lineHeight: 1, borderRadius: '6px', display: 'flex', alignItems: 'center' }}
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </div>

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
      </div>
    </div>
  )
}
