import { render, screen } from '@testing-library/react'
import ResumePreview from '../components/preview/ResumePreview'

const content = {
  personal: { name: 'Jane Doe', title: 'Engineer', email: '', phone: '', location: '', linkedin: '', website: '', summary: '' },
  experience: [], education: [], skills: [],
  sectionOrder: ['personal', 'experience', 'education', 'skills'], _raw: ''
}

test.each(['classic', 'modern', 'minimal', 'executive', 'creative'])('%s template renders without crash', (id) => {
  render(<ResumePreview content={content} templateId={id} />)
  expect(screen.getByText('Jane Doe')).toBeInTheDocument()
})

test('unknown templateId shows error message', () => {
  render(<ResumePreview content={content} templateId="unknown" />)
  expect(screen.getByText(/unknown template/i)).toBeInTheDocument()
})
