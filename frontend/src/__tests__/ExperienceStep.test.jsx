import { render, screen, fireEvent } from '@testing-library/react'
import ExperienceStep from '../components/wizard/ExperienceStep'
import { useResumeStore } from '../store/useResumeStore'

beforeEach(() => useResumeStore.setState(useResumeStore.getInitialState()))

test('renders Add Work Experience button when list is empty', () => {
  render(<ExperienceStep />)
  expect(screen.getByText(/add work experience/i)).toBeInTheDocument()
})

test('clicking Add Work Experience adds an entry', () => {
  render(<ExperienceStep />)
  fireEvent.click(screen.getByText(/add work experience/i))
  expect(useResumeStore.getState().content.experience).toHaveLength(1)
})

test('shows company field after adding entry', () => {
  render(<ExperienceStep />)
  fireEvent.click(screen.getByText(/add work experience/i))
  expect(screen.getByPlaceholderText(/company/i)).toBeInTheDocument()
})
