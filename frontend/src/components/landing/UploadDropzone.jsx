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
      navigate('/build')
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
        border: `2px dashed ${dragging ? '#4a9eda' : '#6c63ff'}`,
        borderRadius: '12px', padding: '40px 32px', background: dragging ? '#f0f4ff' : '#f8f7ff',
        cursor: loading ? 'wait' : 'pointer', textAlign: 'center',
        transition: 'all 0.2s', maxWidth: '420px', margin: '0 auto'
      }}
    >
      <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📄</div>
      <p style={{ color: '#6c63ff', fontWeight: 600, marginBottom: '4px' }}>
        {loading ? 'Parsing your resume…' : 'Drop PDF or DOCX here'}
      </p>
      <p style={{ fontSize: '0.8rem', color: '#aaa' }}>or click to browse</p>
      {error && <p style={{ color: '#e53e3e', marginTop: '10px', fontSize: '0.85rem' }}>{error}</p>}
      <input
        ref={inputRef} type="file" accept=".pdf,.docx" style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  )
}
