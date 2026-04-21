import { render, screen, fireEvent } from '@testing-library/react'
import OptionalSectionsStep from '../components/wizard/OptionalSectionsStep'
import { useResumeStore } from '../store/useResumeStore'

beforeEach(() => useResumeStore.setState(useResumeStore.getInitialState()))

test('renders all 5 optional section toggles', () => {
  render(<OptionalSectionsStep />)
  expect(screen.getByText('Projects')).toBeInTheDocument()
  expect(screen.getByText('Certifications')).toBeInTheDocument()
  expect(screen.getByText('Languages')).toBeInTheDocument()
  expect(screen.getByText('Awards')).toBeInTheDocument()
  expect(screen.getByText('Custom Section')).toBeInTheDocument()
})

test('clicking Projects toggle adds it to sectionOrder', () => {
  render(<OptionalSectionsStep />)
  fireEvent.click(screen.getByText('Projects').closest('div'))
  expect(useResumeStore.getState().content.sectionOrder).toContain('projects')
})

test('clicking an active toggle removes it from sectionOrder', () => {
  useResumeStore.getState().toggleOptionalSection('projects', true)
  render(<OptionalSectionsStep />)
  fireEvent.click(screen.getByText('Projects').closest('div'))
  expect(useResumeStore.getState().content.sectionOrder).not.toContain('projects')
})
