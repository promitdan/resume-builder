import { render, screen, fireEvent } from '@testing-library/react'
import SkillsStep from '../components/wizard/SkillsStep'
import { useResumeStore } from '../store/useResumeStore'

beforeEach(() => useResumeStore.setState(useResumeStore.getInitialState()))

test('renders Add Skill Category button', () => {
  render(<SkillsStep />)
  expect(screen.getByText(/add skill category/i)).toBeInTheDocument()
})

test('clicking Add Skill Category adds to store', () => {
  render(<SkillsStep />)
  fireEvent.click(screen.getByText(/add skill category/i))
  expect(useResumeStore.getState().content.skills).toHaveLength(1)
})
