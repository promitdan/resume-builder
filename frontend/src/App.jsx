import { Routes, Route } from 'react-router-dom'
import LandingPage  from './pages/LandingPage'
import BuildPage    from './pages/BuildPage'
import PreviewPage  from './pages/PreviewPage'

export default function App() {
  return (
    <Routes>
      <Route path="/"        element={<LandingPage />} />
      <Route path="/build"   element={<BuildPage />} />
      <Route path="/preview" element={<PreviewPage />} />
    </Routes>
  )
}
