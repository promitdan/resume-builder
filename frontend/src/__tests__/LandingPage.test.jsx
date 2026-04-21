import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LandingPage from '../pages/LandingPage'

function renderLanding() {
  return render(<MemoryRouter><LandingPage /></MemoryRouter>)
}

test('renders Start Fresh button', () => {
  renderLanding()
  expect(screen.getByText(/start fresh/i)).toBeInTheDocument()
})

test('renders Upload Resume button', () => {
  renderLanding()
  expect(screen.getByText(/upload resume/i)).toBeInTheDocument()
})

test('shows file input when Upload Resume is clicked', () => {
  renderLanding()
  fireEvent.click(screen.getByText(/upload resume/i))
  expect(screen.getByTestId('upload-dropzone')).toBeInTheDocument()
})

test('Start Fresh navigates to /build', () => {
  renderLanding()
  const link = screen.getByText(/start fresh/i).closest('a')
  expect(link).toHaveAttribute('href', '/build')
})
