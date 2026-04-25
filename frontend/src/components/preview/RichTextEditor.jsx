import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import { useState, useEffect } from 'react'
import { useResumeStore } from '../../store/useResumeStore'
import RichTextToolbar from './RichTextToolbar'
import './RichTextEditor.css'

export default function RichTextEditor({ path, value }) {
  const setField = useResumeStore(s => s.setField)
  const [isFocused, setIsFocused] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
      }),
    ],
    content: value || '',
    onFocus: () => setIsFocused(true),
    onBlur: ({ editor }) => {
      setIsFocused(false)
      setField(path, editor.getHTML())
    },
  })

  useEffect(() => {
    if (!editor || isFocused) return
    const current = editor.getHTML()
    if (current !== value) {
      editor.commands.setContent(value || '', false)
    }
  }, [value, editor, isFocused])

  return (
    <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
      {isFocused && editor && (
        <div style={{ position: 'absolute', bottom: '100%', left: 0, marginBottom: '4px', zIndex: 100 }}>
          <RichTextToolbar editor={editor} />
        </div>
      )}
      <div
        style={{
          outline: 'none',
          padding: isFocused ? '2px 6px' : '0',
          borderLeft: isFocused ? '2px solid #3b82f6' : '2px solid transparent',
          background: isFocused ? '#eff6ff' : 'transparent',
          borderRadius: '2px',
          cursor: 'text',
          minHeight: '1em',
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
