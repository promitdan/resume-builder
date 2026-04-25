import { useState } from 'react'
import axios from 'axios'

const ACTIONS = [
  { key: 'improve', label: '✨ Improve' },
  { key: 'concise', label: '✂️ Make concise' },
  { key: 'grammar', label: '✓ Fix grammar' },
]

export default function AiAssistPopover({ editor, onClose }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const run = async (action) => {
    const text = editor.getText().trim()
    if (!text) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await axios.post('http://localhost:3001/api/ai/assist', { text, action })
      editor.commands.setContent(`<p>${data.result}</p>`)
      onClose()
    } catch {
      setError("Couldn't reach AI — try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'absolute',
      top: 'calc(100% + 4px)',
      left: 0,
      background: '#1e293b',
      borderRadius: '10px',
      padding: '12px',
      boxShadow: '0 8px 24px rgba(0,0,0,.3)',
      zIndex: 101,
      minWidth: '180px',
    }}>
      <div style={{
        fontSize: '10px',
        color: '#7c3aed',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '.08em',
        marginBottom: '8px',
      }}>✦ AI Assistant</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {ACTIONS.map(({ key, label }) => (
          <button
            key={key}
            onMouseDown={(e) => { e.preventDefault(); run(key) }}
            disabled={loading}
            style={{
              background: '#334155',
              border: 'none',
              color: loading ? '#64748b' : '#cbd5e1',
              borderRadius: '6px',
              padding: '7px 12px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              textAlign: 'left',
            }}
          >{loading ? '…' : label}</button>
        ))}
      </div>

      {error && (
        <div style={{ fontSize: '11px', color: '#f87171', marginTop: '8px' }}>{error}</div>
      )}
    </div>
  )
}
