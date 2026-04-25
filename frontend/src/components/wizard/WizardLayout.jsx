export default function WizardLayout({ steps = [], currentStep = 0, onNext, onStepClick, hasContent = false }) {
  const step   = steps[currentStep]
  const isLast = currentStep === steps.length - 1

  if (!step) return <div>Invalid step</div>

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sidebar */}
      <div style={{ width: '220px', background: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #e2e8f0' }}>
          <span style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a', letterSpacing: '-0.3px' }}>
            Resume<span style={{ color: '#3b82f6' }}>Builder</span>
          </span>
        </div>

        {/* Steps */}
        <nav style={{ padding: '16px 12px', flex: 1 }}>
          {steps.map((s, i) => {
            const done     = i < currentStep
            const active   = i === currentStep
            const canClick = done || hasContent

            return (
              <div
                key={i}
                onClick={() => canClick && onStepClick && onStepClick(i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '8px 10px', borderRadius: '7px', marginBottom: '2px',
                  cursor: canClick ? 'pointer' : 'default',
                  background: active ? '#eff6ff' : 'transparent',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (canClick) e.currentTarget.style.background = '#f0f9ff' }}
                onMouseLeave={e => { e.currentTarget.style.background = active ? '#eff6ff' : 'transparent' }}
              >
                {/* Step circle */}
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 700,
                  background: done ? '#3b82f6' : 'transparent',
                  border: done ? 'none' : `2px solid ${active ? '#3b82f6' : '#cbd5e1'}`,
                  color: done ? '#fff' : active ? '#3b82f6' : '#94a3b8',
                }}>
                  {done ? '✓' : i + 1}
                </div>
                {/* Step label */}
                <span style={{
                  fontSize: '13px', fontWeight: active ? 600 : 500,
                  color: done ? '#334155' : active ? '#3b82f6' : '#94a3b8',
                  lineHeight: 1.3,
                }}>
                  {s.title}
                </span>
              </div>
            )
          })}
        </nav>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Top bar */}
        <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, marginBottom: '2px', letterSpacing: '0.3px' }}>
              STEP {currentStep + 1} OF {steps.length}
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>{step.title}</h2>
          </div>
          {/* Progress bar */}
          <div style={{ width: '120px', height: '4px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${((currentStep + 1) / steps.length) * 100}%`, height: '100%', background: '#3b82f6', transition: 'width 0.3s', borderRadius: '4px' }} />
          </div>
        </div>

        {/* Step content */}
        <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          <step.component />
        </div>

        {/* Bottom nav */}
        <div style={{ background: '#fff', borderTop: '1px solid #e2e8f0', padding: '16px 32px', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
          <button
            onClick={onNext}
            style={{ background: '#3b82f6', color: '#fff', fontWeight: 600, fontSize: '14px', padding: '10px 28px', borderRadius: '7px', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => e.target.style.background='#2563eb'}
            onMouseLeave={e => e.target.style.background='#3b82f6'}
          >
            {isLast ? 'Finish ✓' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}
