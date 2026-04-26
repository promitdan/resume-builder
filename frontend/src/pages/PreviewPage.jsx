import { useNavigate } from 'react-router-dom'
import { useResumeStore } from '../store/useResumeStore'
import ResumePreview from '../components/preview/ResumePreview'
import TemplateSwitcher from '../components/preview/TemplateSwitcher'
import DownloadButtons from '../components/shared/DownloadButtons'
import classicTpl   from '../templates/classic.json'
import modernTpl    from '../templates/modern.json'
import minimalTpl   from '../templates/minimal.json'
import executiveTpl from '../templates/executive.json'
import creativeTpl  from '../templates/creative.json'

const TEMPLATE_MAP = { classic: classicTpl, modern: modernTpl, minimal: minimalTpl, executive: executiveTpl, creative: creativeTpl }

const FONT_SCALE_STEPS = [0.80, 0.85, 0.90, 0.95, 1.00, 1.05, 1.10, 1.15, 1.20]

export default function PreviewPage() {
  const content      = useResumeStore(s => s.content)
  const templateId   = useResumeStore(s => s.templateId)
  const paletteIndex = useResumeStore(s => s.paletteIndex)
  const fontScale    = useResumeStore(s => s.fontScale)
  const setPaletteIndex = useResumeStore(s => s.setPaletteIndex)
  const setFontScale    = useResumeStore(s => s.setFontScale)
  const navigate     = useNavigate()

  const tpl      = TEMPLATE_MAP[templateId]
  const palettes = tpl?.palettes ?? []

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
        <div style={{ flex: 1, overflow: 'auto', background: '#e2e8f0', borderRadius: '10px', padding: '24px', minHeight: '500px' }}>
          <ResumePreview content={content} templateId={templateId} paletteIndex={paletteIndex} fontScale={fontScale} />
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
          {palettes.length > 0 && (
            <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Color</h3>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>{palettes[paletteIndex]?.label}</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {palettes.map((palette, i) => (
                  <button
                    key={palette.label}
                    type="button"
                    title={palette.label}
                    onClick={() => setPaletteIndex(i)}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: palette.swatch,
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      flexShrink: 0,
                      boxShadow: i === paletteIndex
                        ? `0 0 0 2.5px #fff, 0 0 0 4.5px ${palette.swatch}`
                        : '0 1px 3px rgba(0,0,0,0.20)',
                      transition: 'box-shadow 0.15s ease',
                    }}
                  />
                ))}
              </div>
            </div>
          )}

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
