import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useResumeStore } from '../../store/useResumeStore'

export default function UploadDropzone() {
  const [dragging, setDragging]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const inputRef                  = useRef()
  const setContent                = useResumeStore((s) => s.setContent)
  const navigate                  = useNavigate()

  async function handleFile(file) {
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['pdf', 'docx'].includes(ext)) {
      setError('Only PDF and DOCX files are supported.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await axios.post('/api/upload', form)
      const parseMethod = res.headers['x-parse-method'] || 'unknown'
      console.log(`[resume-builder] PDF parsed via: ${parseMethod}`)
      setContent(res.data.content)
      navigate('/preview')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to parse file. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  if (loading) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <div style={{ background: '#fff', borderRadius: '16px', padding: '40px 48px', textAlign: 'center', maxWidth: '360px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🤖</div>
          <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: '17px', color: '#0f172a' }}>Parsing your resume…</p>
          <p style={{ margin: '0 0 24px', fontSize: '13px', color: '#64748b' }}>AI is reading your document.<br />This may take up to a minute.</p>
          <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '40%', background: '#3b82f6', borderRadius: '2px', animation: 'slide 1.4s ease-in-out infinite' }} />
          </div>
        </div>
        <style>{`@keyframes slide { 0%{transform:translateX(-100%)} 100%{transform:translateX(350%)} }`}</style>
      </div>
    )
  }

  return (
    <div
      data-testid="upload-dropzone"
      onClick={() => !loading && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      style={{
        border: `2px dashed ${dragging ? '#3b82f6' : '#bfdbfe'}`,
        borderRadius: '10px',
        padding: '32px 24px',
        background: dragging ? '#dbeafe' : '#eff6ff',
        cursor: loading ? 'wait' : 'pointer',
        textAlign: 'center',
        transition: 'all 0.2s',
      }}
    >
      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📄</div>
      <p style={{ margin: '0 0 4px', color: '#3b82f6', fontWeight: 600, fontSize: '15px' }}>
        {loading ? 'Parsing your resume…' : 'Drop your PDF or DOCX here'}
      </p>
      <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>or click to browse</p>
      {error && (
        <p style={{ margin: '12px 0 0', color: '#ef4444', fontSize: '13px', fontWeight: 500 }}>{error}</p>
      )}
      <input
        ref={inputRef} type="file" accept=".pdf,.docx" style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  )
}
