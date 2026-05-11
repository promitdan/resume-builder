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

const navy = '#1a2744'
const orange = '#f47c20'

function LogoIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <path d="M6 28 Q18 33 30 28 L28 34 Q18 38 8 34Z" fill="#1a2744"/>
      <rect x="10" y="18" width="16" height="12" rx="2" fill="#1a2744"/>
      <rect x="11" y="5" width="14" height="18" rx="2" fill="white" stroke="#1a2744" strokeWidth="1.5"/>
      <circle cx="16" cy="10" r="2.2" fill="#2d7dd2"/>
      <line x1="13" y1="14" x2="23" y2="14" stroke="#1a2744" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="13" y1="17" x2="20" y2="17" stroke="#f47c20" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="25" y1="21" x2="32" y2="16" stroke="#f47c20" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="25" y1="21" x2="33" y2="21" stroke="#f5a623" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="25" y1="21" x2="29" y2="14" stroke="#f47c20" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}

export default function PreviewPage() {
  const content         = useResumeStore(s => s.content)
  const templateId      = useResumeStore(s => s.templateId)
  const paletteIndex    = useResumeStore(s => s.paletteIndex)
  const fontSize        = useResumeStore(s => s.fontSize)
  const setPaletteIndex = useResumeStore(s => s.setPaletteIndex)
  const setFontSize     = useResumeStore(s => s.setFontSize)
  const navigate        = useNavigate()

  const tpl          = TEMPLATE_CONFIGS[templateId]
  const palettes     = tpl?.palettes ?? []
  const isMonochrome = palettes.length === 0

  const [zoom, setZoom]             = useState(100)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const scrollRef = useRef()

  const handleBreaksChange = useCallback((count) => {
    setTotalPages(count)
    setCurrentPage(1)
  }, [])

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const scaledPageH = (CONTENT_HEIGHT + PAGE_GAP) * (zoom / 100)
    const page = Math.floor(el.scrollTop / scaledPageH) + 1
    setCurrentPage(Math.min(page, totalPages))
  }, [totalPages, zoom])

  const goToPage = useCallback((page) => {
    const el = scrollRef.current
    if (!el) return
    const scaledPageH = (CONTENT_HEIGHT + PAGE_GAP) * (zoom / 100)
    el.scrollTo({ top: (page - 1) * scaledPageH, behavior: 'smooth' })
    setCurrentPage(page)
  }, [zoom])

  const changeZoom = (delta) => setZoom(z => Math.min(150, Math.max(50, z + delta)))

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>

      {/* ── Top bar ── */}
      <div style={{
        height: 52, flexShrink: 0,
        background: '#fff', borderBottom: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px',
      }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <LogoIcon size={28} />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span style={{ fontWeight: 800, fontSize: 13, color: navy }}>Resume</span>
            <span style={{ fontWeight: 800, fontSize: 13, color: orange }}>Forge</span>
          </div>
        </a>
        <button
          type="button"
          onClick={() => navigate('/build')}
          style={{
            background: 'none', border: '1.5px solid #e2e8f0',
            color: '#334155', fontWeight: 600, fontSize: 13,
            padding: '6px 14px', borderRadius: 7, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5,
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = navy; e.currentTarget.style.color = navy }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#334155' }}
        >
          <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
              <path d="M11.5 2.5a1.5 1.5 0 012.121 2.121L5.5 12.743l-3 .757.757-3L11.5 2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
            </svg>
          Edit Resume
        </button>
      </div>

      {/* ── Body (preview + panels) ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

      {/* ── Resume preview ── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden',
        backgroundImage: [
          'radial-gradient(circle, rgba(170,178,210,0.65) 1px, transparent 1px)',
          'linear-gradient(145deg, #dde1f0 0%, #e8ebf7 35%, #edf0f9 60%, #e4e8f4 100%)',
        ].join(', '),
        backgroundSize: '22px 22px, 100% 100%',
      }}>
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            height: '100%', overflow: 'auto',
            display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
            padding: '48px 40px 100px',
            boxSizing: 'border-box',
          }}
        >
          <div style={{
            transform: `scale(${zoom / 100})`, transformOrigin: 'top center',
            filter: 'drop-shadow(0 8px 32px rgba(15,23,42,0.14))',
          }}>
            <ResumePreview
              content={content}
              templateId={templateId}
              paletteIndex={paletteIndex}
              fontSize={fontSize}
              onBreaksChange={handleBreaksChange}
            />
          </div>
        </div>

        {/* Floating bottom bar */}
        <div style={{
          position: 'absolute', bottom: 20, left: 0, right: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          {/* Zoom — left */}
          <div style={{
            position: 'absolute', left: 20,
            display: 'flex', alignItems: 'center', gap: 2,
            background: 'rgba(15,23,42,0.72)', backdropFilter: 'blur(8px)',
            borderRadius: 999, padding: '5px 10px',
            pointerEvents: 'auto',
          }}>
            <button onClick={() => changeZoom(-10)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '0 4px' }}>−</button>
            <span style={{ color: '#fff', fontSize: 12, fontWeight: 600, minWidth: 38, textAlign: 'center' }}>{zoom}%</span>
            <button onClick={() => changeZoom(10)}  style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '0 4px' }}>+</button>
            <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.25)', margin: '0 5px' }} />
            <button
              onClick={() => {
                const el = scrollRef.current
                if (el?.requestFullscreen) el.requestFullscreen()
              }}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.75)', cursor: 'pointer', fontSize: 13, lineHeight: 1, padding: '0 2px' }}
            >
              <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
                <path d="M1 5V2h3M12 1h3v3M1 11v3h3M12 15h3v-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Page pill — centre */}
          {totalPages > 1 && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: 'rgba(15,23,42,0.72)', backdropFilter: 'blur(8px)',
              borderRadius: 999, padding: '5px 10px',
              pointerEvents: 'auto',
            }}>
              <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}
                style={{ background: 'none', border: 'none', color: currentPage <= 1 ? 'rgba(255,255,255,0.3)' : '#fff', cursor: currentPage <= 1 ? 'default' : 'pointer', padding: '2px 6px', fontSize: 16, lineHeight: 1, borderRadius: 6 }}>
                ‹
              </button>
              <span style={{ color: '#fff', fontSize: 13, fontWeight: 600, minWidth: 52, textAlign: 'center', letterSpacing: '0.2px' }}>
                {currentPage} / {totalPages}
              </span>
              <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages}
                style={{ background: 'none', border: 'none', color: currentPage >= totalPages ? 'rgba(255,255,255,0.3)' : '#fff', cursor: currentPage >= totalPages ? 'default' : 'pointer', padding: '2px 6px', fontSize: 16, lineHeight: 1, borderRadius: 6 }}>
                ›
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Right panel area — floating cards ── */}
      <div style={{
        display: 'flex', gap: 12, padding: '16px 16px 16px 12px',
        alignItems: 'flex-start', flexShrink: 0,
        height: '100%', boxSizing: 'border-box', overflowY: 'auto',
      }}>

        {/* Templates card */}
        <div style={{
          width: 550, flexShrink: 0,
          background: '#fff', borderRadius: 12,
          boxShadow: '0 2px 16px rgba(15,23,42,0.10)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          maxHeight: '100%',
        }}>
          <div style={{
            padding: '12px 14px 9px',
            fontSize: 10, fontWeight: 700, letterSpacing: '1.2px',
            textTransform: 'uppercase', color: '#94a3b8',
            borderBottom: '1px solid #f1f5f9', flexShrink: 0,
          }}>
            Templates
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
            <TemplateSwitcher />
          </div>
        </div>

        {/* Controls card */}
        <div style={{
          width: 350, flexShrink: 0,
          background: '#fff', borderRadius: 12,
          boxShadow: '0 2px 16px rgba(15,23,42,0.10)',
          display: 'flex', flexDirection: 'column',
          padding: '14px', gap: 18,
          maxHeight: '100%', overflowY: 'auto',
        }}>

          {/* Color */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#94a3b8' }}>Color</span>
              <span style={{ fontSize: 10, color: '#94a3b8' }}>{isMonochrome ? 'Monochrome' : palettes[paletteIndex]?.label}</span>
            </div>
            {isMonochrome ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#1a1a1a', flexShrink: 0, boxShadow: '0 0 0 2.5px #fff, 0 0 0 4px #1a1a1a' }} />
                <span style={{ fontSize: 11, color: '#94a3b8' }}>No color variants</span>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {palettes.map((palette, i) => (
                  <button
                    key={palette.label}
                    type="button"
                    title={palette.label}
                    onClick={() => setPaletteIndex(i)}
                    style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: palette.swatch, border: 'none',
                      cursor: 'pointer', padding: 0, flexShrink: 0,
                      boxShadow: i === paletteIndex
                        ? `0 0 0 2.5px #fff, 0 0 0 4px ${palette.swatch}`
                        : '0 1px 3px rgba(0,0,0,0.20)',
                      transition: 'box-shadow 0.15s',
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Typography */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#94a3b8', marginBottom: 9 }}>Typography</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {FONT_SIZE_OPTIONS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFontSize(key)}
                  style={{
                    flex: 1, height: 32,
                    border: `1.5px solid ${fontSize === key ? navy : '#e2e8f0'}`,
                    borderRadius: 6,
                    background: fontSize === key ? '#f0f2f8' : '#fff',
                    color: fontSize === key ? navy : '#64748b',
                    fontWeight: 600, fontSize: 13, cursor: 'pointer',
                    transition: 'border-color 0.12s, background 0.12s',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Downloads */}
          <DownloadButtons />

        </div>
      </div>

      </div>{/* end body */}
    </div>
  )
}
