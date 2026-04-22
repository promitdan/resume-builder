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
      const { data } = await axios.post('/api/upload', form)
      setContent(data.content)
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
