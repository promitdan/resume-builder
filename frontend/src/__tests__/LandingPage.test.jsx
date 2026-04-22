import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LandingPage from '../pages/LandingPage'

vi.mock('../components/landing/UploadDropzone', () => ({
  default: () => <div data-testid="upload-dropzone">Upload Zone</div>
}))

function renderLanding() {
  return render(<MemoryRouter><LandingPage /></MemoryRouter>)
}

test('renders Start from scratch button', () => {
  renderLanding()
  expect(screen.getByText(/start from scratch/i)).toBeInTheDocument()
})

test('renders Upload resume button', () => {
  renderLanding()
  expect(screen.getByText(/upload resume/i)).toBeInTheDocument()
})

test('shows upload dropzone when Upload resume is clicked', () => {
  renderLanding()
  expect(screen.queryByTestId('upload-dropzone')).not.toBeInTheDocument()
  fireEvent.click(screen.getByText(/upload resume/i))
  expect(screen.getByTestId('upload-dropzone')).toBeInTheDocument()
})

test('Start from scratch navigates to /build', () => {
  renderLanding()
  expect(screen.getByText(/start from scratch/i).closest('a')).toHaveAttribute('href', '/build')
})
