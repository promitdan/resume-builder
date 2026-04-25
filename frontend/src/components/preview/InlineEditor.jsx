import { useState, useEffect, useRef } from 'react'
import { useResumeStore } from '../../store/useResumeStore'

export default function InlineEditor({ path, value, multiline = false, children }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState('')
  const setField  = useResumeStore(s => s.setField)
  const inputRef  = useRef()
  const wrapRef   = useRef()

  function startEdit(e) {
    e.stopPropagation()
    setDraft(value ?? '')
    setEditing(true)
  }

  function confirm() {
    setField(path, draft)
    setEditing(false)
  }

  function cancel() {
    setEditing(false)
  }

  function onKeyDown(e) {
    if (!multiline && e.key === 'Enter') { e.preventDefault(); confirm() }
    if (e.key === 'Escape') cancel()
  }

  useEffect(() => {
    if (!editing) return
    inputRef.current?.focus()
    inputRef.current?.select()
    function onMouseDown(e) {
      if (!wrapRef.current?.contains(e.target)) cancel()
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [editing])

  const inputStyle = {
    border: '1.5px solid #3b82f6',
    borderRadius: '3px',
    padding: '2px 4px',
    outline: 'none',
    background: '#eff6ff',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    color: 'inherit',
    lineHeight: 'inherit',
    width: '100%',
    boxSizing: 'border-box',
    resize: multiline ? 'vertical' : 'none',
  }

  if (!editing) {
    return (
      <span
        ref={wrapRef}
        onClick={startEdit}
        title="Click to edit"
        style={{ cursor: 'text', borderRadius: '2px', display: 'inline' }}
      >
        {children ?? value}
      </span>
    )
  }

  return (
    <span ref={wrapRef} style={{ position: 'relative', display: 'inline-block', width: multiline ? '100%' : 'auto' }}>
      {multiline ? (
        <textarea
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          rows={4}
          style={{ ...inputStyle, display: 'block', minHeight: '60px' }}
        />
      ) : (
        <input
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          style={inputStyle}
        />
      )}
      <span style={{
        position: 'absolute', top: '100%', right: 0, marginTop: '2px',
        display: 'flex', gap: '4px', zIndex: 100,
        background: '#fff', borderRadius: '4px', border: '1px solid #e2e8f0',
        padding: '2px 4px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <button
          onClick={confirm}
          style={{ border: 'none', background: 'none', color: '#22c55e', cursor: 'pointer', fontWeight: 700, fontSize: '13px', padding: '2px 6px' }}
        >✓</button>
        <button
          onClick={cancel}
          style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 700, fontSize: '13px', padding: '2px 6px' }}
        >✕</button>
      </span>
    </span>
  )
}
