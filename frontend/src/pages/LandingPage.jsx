import { useState } from 'react'
import HeroCTA       from '../components/landing/HeroCTA'
import UploadDropzone from '../components/landing/UploadDropzone'

export default function LandingPage() {
  const [showUpload, setShowUpload] = useState(false)

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(160deg, #f8f7ff 60%, #ede9ff)',
      padding: '32px 16px'
    }}>
      <HeroCTA onUploadClick={() => setShowUpload(true)} />
      {showUpload && (
        <div style={{ marginTop: '40px', width: '100%', maxWidth: '460px' }}>
          <UploadDropzone />
        </div>
      )}
    </div>
  )
}
