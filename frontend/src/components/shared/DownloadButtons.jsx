import { useState } from 'react'
import axios from 'axios'
import { useResumeStore } from '../../store/useResumeStore'
import { capturePreviewHtml } from '../../utils/capturePreview'

export default function DownloadButtons() {
  const content    = useResumeStore(s => s.content)
  const templateId = useResumeStore(s => s.templateId)
  const [loading, setLoading] = useState(null)
  const [error, setError]     = useState('')

  async function download(type) {
    setLoading(type)
    setError('')
    try {
      const postBody = type === 'pdf'
        ? { html: capturePreviewHtml() }
        : { content, templateId }
      const { data } = await axios.post(`/api/export/${type}`, postBody, { responseType: 'blob' })
      const url = URL.createObjectURL(data)
      const a   = document.createElement('a')
      a.href     = url
      a.download = `resume.${type}`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError(`Failed to export ${type.toUpperCase()}. Please try again.`)
    } finally {
      setLoading(null)
    }
  }

  const btn = (type, label, bg, hover) => (
    <button type="button" onClick={() => download(type)} disabled={!!loading}
      style={{ width: '100%', background: loading === type ? '#94a3b8' : bg, color: '#fff', fontWeight: 600, fontSize: '13px', padding: '10px', borderRadius: '6px', border: 'none', cursor: loading ? 'wait' : 'pointer', marginBottom: '8px', transition: 'background 0.15s' }}
      onMouseEnter={e => { if (!loading) e.currentTarget.style.background = hover }}
      onMouseLeave={e => { if (!loading) e.currentTarget.style.background = loading === type ? '#94a3b8' : bg }}>
      {loading === type ? 'Generating…' : label}
    </button>
  )

  return (
    <div>
      {btn('pdf',  '⬇ Download PDF',  '#3b82f6', '#2563eb')}
      {btn('docx', '⬇ Download DOCX', '#0369a1', '#075985')}
      {error && <p style={{ margin: '6px 0 0', color: '#ef4444', fontSize: '12px' }}>{error}</p>}
    </div>
  )
}
