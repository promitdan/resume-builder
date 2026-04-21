import { Link } from 'react-router-dom'

export default function HeroCTA({ onUploadClick }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <h1 style={{ fontSize: '2.2rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '8px' }}>
        Build Your Perfect Resume
      </h1>
      <p style={{ color: '#888', marginBottom: '32px', fontSize: '1rem' }}>
        Professional · Free · No sign-up needed
      </p>
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link
          to="/build"
          style={{
            background: '#6c63ff', color: '#fff', padding: '14px 28px',
            borderRadius: '8px', textDecoration: 'none', fontWeight: 600,
            fontSize: '1rem', boxShadow: '0 4px 14px rgba(108,99,255,0.35)'
          }}
        >
          ✦ Start Fresh
        </Link>
        <button
          onClick={onUploadClick}
          style={{
            background: '#fff', color: '#6c63ff', padding: '14px 28px',
            border: '2px solid #6c63ff', borderRadius: '8px', fontWeight: 600,
            fontSize: '1rem', cursor: 'pointer'
          }}
        >
          ↑ Upload Resume
        </button>
      </div>
      <p style={{ marginTop: '16px', fontSize: '0.8rem', color: '#bbb' }}>
        PDF &amp; DOCX supported · Download as PDF or DOCX
      </p>
    </div>
  )
}
