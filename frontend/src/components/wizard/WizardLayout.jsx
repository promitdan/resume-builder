export default function WizardLayout({ steps = [], currentStep = 0, onNext, onBack }) {
  const step   = steps[currentStep]
  const isLast = currentStep === steps.length - 1
  const isFirst = currentStep === 0

  if (!step) return <div>Invalid step</div>

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px' }}>
            Step {currentStep + 1} of {steps.length}
          </div>
          <div style={{ height: '4px', background: '#e5e7eb', borderRadius: '2px', overflow: 'hidden', marginBottom: '14px' }}>
            <div style={{ width: `${((currentStep + 1) / steps.length) * 100}%`, height: '100%', background: '#6c63ff', transition: 'width 0.3s' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1a1a2e', margin: 0 }}>{step.title}</h2>
        </div>
      </div>

      <div style={{ flex: 1, padding: '32px 16px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <step.component />
        </div>
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', padding: '20px', background: '#fff', display: 'flex', justifyContent: 'center', gap: '16px' }}>
        <button disabled={isFirst} onClick={onBack} style={{ padding: '10px 24px', borderRadius: '6px', border: '1px solid #ddd', background: isFirst ? '#f3f4f6' : '#fff', color: isFirst ? '#999' : '#333', fontWeight: 600, cursor: isFirst ? 'not-allowed' : 'pointer' }}>
          ← Back
        </button>
        <button onClick={onNext} style={{ padding: '10px 24px', borderRadius: '6px', border: 'none', background: '#6c63ff', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
          {isLast ? 'Finish' : 'Next →'}
        </button>
      </div>
    </div>
  )
}
