import { render, screen, fireEvent } from '@testing-library/react'
import TemplatePickerStep from '../components/wizard/TemplatePickerStep'
import { useResumeStore } from '../store/useResumeStore'

beforeEach(() => useResumeStore.setState(useResumeStore.getInitialState()))

test('renders all 5 template cards', () => {
  render(<TemplatePickerStep />)
  expect(screen.getByText('Classic')).toBeInTheDocument()
  expect(screen.getByText('Modern')).toBeInTheDocument()
  expect(screen.getByText('Minimal')).toBeInTheDocument()
  expect(screen.getByText('Executive')).toBeInTheDocument()
  expect(screen.getByText('Creative')).toBeInTheDocument()
})

test('clicking Modern updates store templateId', () => {
  render(<TemplatePickerStep />)
  fireEvent.click(screen.getByText('Modern').closest('[data-template]'))
  expect(useResumeStore.getState().templateId).toBe('modern')
})
