import { render, screen, fireEvent } from '@testing-library/react'
import PersonalInfoStep from '../components/wizard/PersonalInfoStep'
import { useResumeStore } from '../store/useResumeStore'

beforeEach(() => useResumeStore.setState(useResumeStore.getInitialState()))

test('renders all personal info fields', () => {
  render(<PersonalInfoStep />)
  expect(screen.getByPlaceholderText(/full name/i)).toBeInTheDocument()
  expect(screen.getByPlaceholderText(/job title/i)).toBeInTheDocument()
  expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
  expect(screen.getByPlaceholderText(/phone/i)).toBeInTheDocument()
})

test('typing in name field updates store', () => {
  render(<PersonalInfoStep />)
  fireEvent.change(screen.getByPlaceholderText(/full name/i), { target: { value: 'Jane Doe' } })
  expect(useResumeStore.getState().content.personal.name).toBe('Jane Doe')
})

test('renders summary textarea', () => {
  render(<PersonalInfoStep />)
  expect(screen.getByPlaceholderText(/professional summary/i)).toBeInTheDocument()
})
