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

  const navy = '#1c4cb7'

  // PDF file icon: folded-corner document with red PDF badge
  const PdfIcon = () => (
    <svg viewBox="0 0 20 22" fill="none" width="15" height="17" style={{ flexShrink: 0 }}>
      <path d="M3 2a1 1 0 011-1h9l4 4v15a1 1 0 01-1 1H4a1 1 0 01-1-1V2z" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2"/>
      <path d="M13 1v4h4" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" strokeLinejoin="round"/>
      <rect x="2" y="12" width="10" height="6" rx="1.2" fill="#ef4444"/>
      <text x="7" y="17" textAnchor="middle" fontSize="4.5" fontWeight="800" fill="#fff" fontFamily="Arial, sans-serif">PDF</text>
    </svg>
  )

  // DOCX file icon: folded-corner document with blue Word badge
  const DocxIcon = () => (
    <svg viewBox="0 0 20 22" fill="none" width="15" height="17" style={{ flexShrink: 0 }}>
      <path d="M3 2a1 1 0 011-1h9l4 4v15a1 1 0 01-1 1H4a1 1 0 01-1-1V2z" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2"/>
      <path d="M13 1v4h4" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" strokeLinejoin="round"/>
      <rect x="2" y="12" width="10" height="6" rx="1.2" fill="#2563eb"/>
      <text x="7" y="17" textAnchor="middle" fontSize="4" fontWeight="800" fill="#fff" fontFamily="Arial, sans-serif">DOC</text>
    </svg>
  )

  const btn = (type, label, Icon) => (
    <button type="button" onClick={() => download(type)} disabled={!!loading}
      style={{
        width: '100%', background: loading === type ? '#64748b' : '#1c4cb7',
        color: '#fff', fontWeight: 600, fontSize: '13px', padding: '11px 14px',
        borderRadius: '8px', border: 'none', cursor: loading ? 'wait' : 'pointer',
        marginBottom: '8px', transition: 'background 0.15s',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
      }}
      onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#243560' }}
      onMouseLeave={e => { if (!loading) e.currentTarget.style.background = loading === type ? '#64748b' : navy }}>
      {loading === type ? 'Generating…' : <><Icon />{label}</>}
    </button>
  )

  return (
    <div>
      {btn('pdf',  'Download PDF',  PdfIcon)}
      {/* {btn('docx', 'Download DOCX', DocxIcon)} */}
      {error && <p style={{ margin: '6px 0 0', color: '#ef4444', fontSize: '12px' }}>{error}</p>}
    </div>
  )
}
