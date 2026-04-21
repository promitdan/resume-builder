import { Routes, Route } from 'react-router-dom'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<div>Landing</div>} />
      <Route path="/build" element={<div>Build</div>} />
      <Route path="/preview" element={<div>Preview</div>} />
    </Routes>
  )
}
