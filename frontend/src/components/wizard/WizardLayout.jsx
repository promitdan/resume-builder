import { useResumeStore } from '../../store/useResumeStore'
import ResumePreview, { COMPONENT_MAP, CONTENT_HEIGHT, PAGE_GAP } from '../preview/ResumePreview'
import { PAGE_WIDTH } from '../../utils/pageLayout'
import { TEMPLATE_CONFIGS } from '../../registry/templateRegistry'
import TemplatePreview from '../landing/TemplatePreview'
import { useRef, useEffect, useState } from 'react'

const navy   = '#1a2744'
const orange = '#f47c20'

export default function WizardLayout({ steps, currentStep, onNext, onStepClick, onChangeTemplate }) {
  const content       = useResumeStore(s => s.content)
  const templateId    = useResumeStore(s => s.templateId)
  const paletteIndex  = useResumeStore(s => s.paletteIndex)
  const fontSize      = useResumeStore(s => s.fontSize)

  const step = steps[currentStep]
  if (!step) return <div>Invalid step</div>

  const StepComponent = step.component
  const isLast        = currentStep === steps.length - 1
  const tpl           = TEMPLATE_CONFIGS[templateId]
  const paletteColors = tpl?.palettes?.[paletteIndex]?.colors ?? {}
  const Component     = COMPONENT_MAP[templateId]

  const panelRef = useRef()
  const [scale, setScale] = useState(1)
  const [pageCount, setPageCount] = useState(1)
  useEffect(() => {
    const el = panelRef.current
    if (!el) return
    const obs = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width
      if (w > 0) setScale(w / PAGE_WIDTH)
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      fontFamily: "'Inter', -apple-system, sans-serif",
      overflow: 'hidden', background: '#f8fafc',
    }}>
      {/* Top bar */}
      <div style={{
        height: 52, flexShrink: 0,
        background: '#fff', borderBottom: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: 16,
      }}>
        {/* Change template button */}
        <button
          onClick={onChangeTemplate}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: 'none', border: '1px solid #e2e8f0',
            borderRadius: 7, padding: '4px 10px 4px 6px',
            cursor: 'pointer', flexShrink: 0,
            transition: 'border-color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#94a3b8'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
        >
          <div style={{
            width: 24, height: 32, borderRadius: 3,
            overflow: 'hidden', flexShrink: 0, background: '#f1f5f9',
          }}>
            {Component && (
              <TemplatePreview Component={Component} paletteColors={paletteColors} content={content} />
            )}
          </div>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
            Change template
          </span>
        </button>

        {/* Step breadcrumb */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 2, overflow: 'hidden',
        }}>
          {steps.map((s, i) => {
            const done   = i < currentStep
            const active = i === currentStep
            return (
              <div key={s.title} style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                {i > 0 && <span style={{ color: '#cbd5e1', fontSize: 12 }}>›</span>}
                <button
                  onClick={() => done && onStepClick && onStepClick(i)}
                  style={{
                    background: 'none', border: 'none', padding: '3px 7px',
                    borderRadius: 5, cursor: done ? 'pointer' : 'default',
                    fontSize: 12, fontWeight: active ? 700 : 500,
                    color: done ? '#334155' : active ? navy : '#94a3b8',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}
                >
                  {done && (
                    <span style={{
                      width: 14, height: 14, borderRadius: '50%',
                      background: '#22c55e', color: '#fff',
                      fontSize: 9, fontWeight: 800,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      ✓
                    </span>
                  )}
                  {s.title}
                </button>
              </div>
            )
          })}
        </div>

        {/* Progress + Finish */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ width: 80, height: 4, background: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              width: `${((currentStep + 1) / steps.length) * 100}%`,
              height: '100%', background: orange, borderRadius: 2,
              transition: 'width 0.3s',
            }} />
          </div>
          <button
            onClick={onNext}
            style={{
              background: isLast ? orange : navy, color: '#fff',
              fontWeight: 700, fontSize: 13, padding: '7px 20px',
              borderRadius: 7, border: 'none', cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = isLast ? '#e06910' : '#243560'}
            onMouseLeave={e => e.currentTarget.style.background = isLast ? orange : navy}
          >
            {isLast ? 'Finish →' : 'Next →'}
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left: form */}
        <div style={{
          flex: '0 0 55%', overflowY: 'auto',
          padding: '28px 32px', borderRight: '1px solid #e2e8f0',
        }}>
          <StepComponent />
        </div>

        {/* Right: live preview */}
        <div style={{
          flex: '0 0 45%', overflowY: 'auto', overflowX: 'hidden',
          background: '#f1f5f9',
          padding: '24px 20px',
        }}>
          <div ref={panelRef} style={{ width: '100%' }}>
            <div style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              width: PAGE_WIDTH,
              // collapse the dead DOM space that transform: scale() leaves behind
              marginBottom: -((pageCount * CONTENT_HEIGHT + (pageCount - 1) * PAGE_GAP) * (1 - scale)),
              filter: 'drop-shadow(0 4px 16px rgba(15,23,42,0.14))',
            }}>
              <ResumePreview
                content={content}
                templateId={templateId}
                paletteIndex={paletteIndex}
                fontSize={fontSize}
                onBreaksChange={setPageCount}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
