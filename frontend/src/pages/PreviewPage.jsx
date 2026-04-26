import { useNavigate } from 'react-router-dom'
import { useState, useCallback } from 'react'
import { useResumeStore } from '../store/useResumeStore'
import ResumePreview from '../components/preview/ResumePreview'
import TemplateSwitcher from '../components/preview/TemplateSwitcher'
import DownloadButtons from '../components/shared/DownloadButtons'
import { TEMPLATE_CONFIGS } from '../registry/templateRegistry'

const FONT_SCALE_STEPS = [0.80, 0.85, 0.90, 0.95, 1.00, 1.05, 1.10, 1.15, 1.20]

export default function PreviewPage() {
  const content      = useResumeStore(s => s.content)
  const templateId   = useResumeStore(s => s.templateId)
  const paletteIndex = useResumeStore(s => s.paletteIndex)
  const fontScale    = useResumeStore(s => s.fontScale)
  const setPaletteIndex = useResumeStore(s => s.setPaletteIndex)
  const setFontScale    = useResumeStore(s => s.setFontScale)
  const navigate     = useNavigate()

  const tpl      = TEMPLATE_CONFIGS[templateId]
  const palettes = tpl?.palettes ?? []
  const isMonochrome = palettes.length === 0

  const decreaseFontScale = () => {
    const idx = FONT_SCALE_STEPS.indexOf(fontScale)
    if (idx > 0) setFontScale(FONT_SCALE_STEPS[idx - 1])
  }
  const increaseFontScale = () => {
    const idx = FONT_SCALE_STEPS.indexOf(fontScale)
    if (idx < FONT_SCALE_STEPS.length - 1) setFontScale(FONT_SCALE_STEPS[idx + 1])
  }
  const resetFontScale = () => setFontScale(1.0)

  const scaleIdx   = FONT_SCALE_STEPS.indexOf(fontScale)
  const canDecrease = scaleIdx > 0
  const canIncrease = scaleIdx < FONT_SCALE_STEPS.length - 1

  // Page navigation
  const [breaks, setBreaks]           = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = breaks.length + 1

  const handleBreaksChange = useCallback((next) => {
    setBreaks(next)
    setCurrentPage(1)
  }, [])

  const goToPage = useCallback((page) => {
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
          {/* Paper area */}
          <div style={{ background: '#e2e8f0', padding: '24px', boxSizing: 'border-box', display: 'flex', justifyContent: 'center', minHeight: '100%' }}>
            <ResumePreview
              content={content}
              templateId={templateId}
              paletteIndex={paletteIndex}
              fontScale={fontScale}
              onBreaksChange={handleBreaksChange}
              currentPage={currentPage}
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

        {/* Right sidebar */}
        <div style={{ width: '240px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Edit Resume */}
          <button
            type="button"
            onClick={() => navigate('/build')}
            style={{ width: '100%', background: '#3b82f6', color: '#fff', fontWeight: 600, fontSize: '14px', padding: '11px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            onMouseEnter={e => e.currentTarget.style.background='#2563eb'}
            onMouseLeave={e => e.currentTarget.style.background='#3b82f6'}
          >
            ✏ Edit Resume
          </button>

          {/* Template switcher card */}
          <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '16px' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Template</h3>
            <TemplateSwitcher />
          </div>

          {/* Color palette card */}
          <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Color</h3>
              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>
                {isMonochrome ? 'Monochrome' : palettes[paletteIndex]?.label}
              </span>
            </div>
            {isMonochrome ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#1a1a1a', boxShadow: '0 0 0 2.5px #fff, 0 0 0 4.5px #1a1a1a', flexShrink: 0 }} />
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>No color variants for this template</span>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
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

          {/* Font size card */}
          <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '16px' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Font Size</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={decreaseFontScale}
                disabled={!canDecrease}
                style={{ width: '32px', height: '32px', border: '1.5px solid #e2e8f0', borderRadius: '6px', background: canDecrease ? '#fff' : '#f8fafc', color: canDecrease ? '#334155' : '#cbd5e1', cursor: canDecrease ? 'pointer' : 'default', fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >
                A
                <span style={{ fontSize: '9px', marginTop: '3px', marginLeft: '-1px' }}>−</span>
              </button>

              <button
                type="button"
                onClick={resetFontScale}
                title="Reset to 100%"
                style={{ flex: 1, height: '32px', border: '1.5px solid #e2e8f0', borderRadius: '6px', background: fontScale === 1.0 ? '#f1f5f9' : '#fff', color: '#334155', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
              >
                {Math.round(fontScale * 100)}%
              </button>

              <button
                type="button"
                onClick={increaseFontScale}
                disabled={!canIncrease}
                style={{ width: '32px', height: '32px', border: '1.5px solid #e2e8f0', borderRadius: '6px', background: canIncrease ? '#fff' : '#f8fafc', color: canIncrease ? '#334155' : '#cbd5e1', cursor: canIncrease ? 'pointer' : 'default', fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >
                A
                <span style={{ fontSize: '9px', marginTop: '-3px', marginLeft: '-1px' }}>+</span>
              </button>
            </div>
          </div>

          {/* Download card */}
          <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '16px' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Download</h3>
            <DownloadButtons />
          </div>
        </div>
      </div>
    </div>
  )
}
