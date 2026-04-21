import { useState } from 'react'
import axios from 'axios'
import { useResumeStore } from '../../store/useResumeStore'

export default function DownloadButtons() {
  const content    = useResumeStore((s) => s.content)
  const templateId = useResumeStore((s) => s.templateId)
  const [loading, setLoading] = useState(null)
  const [error, setError]     = useState('')

  async function download(type) {
    setLoading(type)
    setError('')
    try {
      const { data } = await axios.post(`/api/export/${type}`, { content, templateId }, { responseType: 'blob' })
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = `resume.${type}`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError(`Failed to export ${type.toUpperCase()}. Please try again.`)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
        <button onClick={() => download('pdf')} disabled={!!loading}
          style={{ padding: '12px', borderRadius: '6px', border: 'none', background: '#6c63ff', color: '#fff', fontWeight: 600, cursor: loading ? 'wait' : 'pointer' }}>
          {loading === 'pdf' ? 'Generating...' : 'Download PDF'}
        </button>
        <button onClick={() => download('docx')} disabled={!!loading}
          style={{ padding: '12px', borderRadius: '6px', border: 'none', background: '#0066cc', color: '#fff', fontWeight: 600, cursor: loading ? 'wait' : 'pointer' }}>
          {loading === 'docx' ? 'Generating...' : 'Download DOCX'}
        </button>
      </div>
      {error && <p style={{ color: '#e53e3e', fontSize: '0.85rem' }}>{error}</p>}
    </div>
  )
}
