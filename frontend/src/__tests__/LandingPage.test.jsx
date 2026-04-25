import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LandingPage from '../pages/LandingPage'

vi.mock('../components/landing/UploadDropzone', () => ({
  default: () => <div data-testid="upload-dropzone">Upload Zone</div>
}))

function renderLanding() {
  return render(<MemoryRouter><LandingPage /></MemoryRouter>)
}

test('renders Start from scratch card', () => {
  renderLanding()
  expect(screen.getByText(/start from scratch/i)).toBeInTheDocument()
})

test('renders Upload resume card', () => {
  renderLanding()
  expect(screen.getByText(/upload resume/i)).toBeInTheDocument()
})

test('upload dropzone is always visible (no toggle needed)', () => {
  renderLanding()
  expect(screen.getByTestId('upload-dropzone')).toBeInTheDocument()
})

test('Start from scratch link navigates to /build', () => {
  renderLanding()
  expect(screen.getByText(/start from scratch/i).closest('a')).toHaveAttribute('href', '/build')
})

test('renders load sample data link', () => {
  renderLanding()
  expect(screen.getByText(/load sample data/i)).toBeInTheDocument()
})
