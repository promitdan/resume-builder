import { useState } from 'react'
import AiAssistPopover from './AiAssistPopover'

export default function RichTextToolbar({ editor }) {
  const [showAi, setShowAi] = useState(false)

  if (!editor) return null

  const addLink = () => {
    const url = window.prompt('Enter URL')
    if (url) editor.chain().focus().setLink({ href: url }).run()
    else if (url === '') editor.chain().focus().unsetLink().run()
  }

  const btn = (active) => ({
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: active ? '#334155' : 'transparent',
    border: 'none',
    color: '#e2e8f0',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  })

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2px',
        background: '#1e293b',
        borderRadius: '8px',
        padding: '5px 8px',
        boxShadow: '0 4px 12px rgba(0,0,0,.25)',
      }}>
        <button
          title="Bold"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run() }}
          style={btn(editor.isActive('bold'))}
        ><b>B</b></button>

        <button
          title="Italic"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run() }}
          style={btn(editor.isActive('italic'))}
        ><i>I</i></button>

        <button
          title="Underline"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run() }}
          style={btn(editor.isActive('underline'))}
        ><u>U</u></button>

        <button
          title="Link"
          onMouseDown={(e) => { e.preventDefault(); addLink() }}
          style={btn(editor.isActive('link'))}
        >🔗</button>

        <div style={{ width: '1px', height: '18px', background: '#334155', margin: '0 4px' }} />

        <button
          title="Ask AI"
          onMouseDown={(e) => { e.preventDefault(); setShowAi(v => !v) }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
            border: 'none',
            color: '#fff',
            borderRadius: '6px',
            padding: '4px 10px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
          }}
        >✦ Ask AI</button>
      </div>

      {showAi && (
        <AiAssistPopover editor={editor} onClose={() => setShowAi(false)} />
      )}
    </div>
  )
}
