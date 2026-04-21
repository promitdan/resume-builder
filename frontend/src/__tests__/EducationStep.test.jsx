import { render, screen, fireEvent } from '@testing-library/react'
import EducationStep from '../components/wizard/EducationStep'
import { useResumeStore } from '../store/useResumeStore'

beforeEach(() => useResumeStore.setState(useResumeStore.getInitialState()))

test('renders Add Education button', () => {
  render(<EducationStep />)
  expect(screen.getByText(/add education/i)).toBeInTheDocument()
})

test('clicking Add Education adds an entry', () => {
  render(<EducationStep />)
  fireEvent.click(screen.getByText(/add education/i))
  expect(useResumeStore.getState().content.education).toHaveLength(1)
})

test('shows institution field after adding entry', () => {
  render(<EducationStep />)
  fireEvent.click(screen.getByText(/add education/i))
  expect(screen.getByPlaceholderText(/institution/i)).toBeInTheDocument()
})
