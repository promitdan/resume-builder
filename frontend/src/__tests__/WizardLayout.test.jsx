import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('../store/useResumeStore', () => ({
  useResumeStore: (selector) => selector({
    content: {
      personal: { name: '', title: '', email: '', phone: '', location: '', linkedin: '', website: '', summary: '' },
      experience: [], education: [], skills: [], projects: [],
      certifications: [], languages: [], awards: [], custom: [],
      sectionOrder: ['personal'], _raw: '',
    },
    templateId: 'classic-traditional',
    paletteIndex: 0,
    fontSize: 'medium',
  }),
}))

vi.mock('../components/landing/TemplatePreview', () => ({
  default: () => <div data-testid="template-preview" />,
}))

vi.mock('../components/preview/ResumePreview', () => ({
  default: () => <div data-testid="resume-preview" />,
  COMPONENT_MAP: { 'classic-traditional': () => <div /> },
  PAGE_WIDTH: 745,
  CONTENT_HEIGHT: 1054,
  PAGE_GAP: 16,
}))

vi.mock('../registry/templateRegistry', () => ({
  TEMPLATE_CONFIGS: { 'classic-traditional': { palettes: [] } },
}))

import WizardLayout from '../components/wizard/WizardLayout'

const mockSteps = [
  { title: 'Personal',   component: () => <div>Personal Step</div>   },
  { title: 'Experience', component: () => <div>Experience Step</div> },
  { title: 'Education',  component: () => <div>Education Step</div>  },
]

describe('WizardLayout', () => {
  it('renders the active step component', () => {
    render(<WizardLayout steps={mockSteps} currentStep={0} onNext={vi.fn()} onStepClick={vi.fn()} onChangeTemplate={vi.fn()} />)
    expect(screen.getByText('Personal Step')).toBeInTheDocument()
  })

  it('renders all step labels in the top bar', () => {
    render(<WizardLayout steps={mockSteps} currentStep={0} onNext={vi.fn()} onStepClick={vi.fn()} onChangeTemplate={vi.fn()} />)
    expect(screen.getByText('Personal')).toBeInTheDocument()
    expect(screen.getByText('Experience')).toBeInTheDocument()
    expect(screen.getByText('Education')).toBeInTheDocument()
  })

  it('shows "Next →" on non-last steps', () => {
    render(<WizardLayout steps={mockSteps} currentStep={0} onNext={vi.fn()} onStepClick={vi.fn()} onChangeTemplate={vi.fn()} />)
    expect(screen.getByText('Next →')).toBeInTheDocument()
  })

  it('shows "Finish →" on the last step', () => {
    render(<WizardLayout steps={mockSteps} currentStep={2} onNext={vi.fn()} onStepClick={vi.fn()} onChangeTemplate={vi.fn()} />)
    expect(screen.getByText('Finish →')).toBeInTheDocument()
  })

  it('calls onNext when Next/Finish is clicked', () => {
    const onNext = vi.fn()
    render(<WizardLayout steps={mockSteps} currentStep={0} onNext={onNext} onStepClick={vi.fn()} onChangeTemplate={vi.fn()} />)
    fireEvent.click(screen.getByText('Next →'))
    expect(onNext).toHaveBeenCalled()
  })

  it('calls onStepClick with index for a completed step', () => {
    const onStepClick = vi.fn()
    render(<WizardLayout steps={mockSteps} currentStep={2} onNext={vi.fn()} onStepClick={onStepClick} onChangeTemplate={vi.fn()} />)
    fireEvent.click(screen.getByText('Personal'))
    expect(onStepClick).toHaveBeenCalledWith(0)
  })

  it('does not call onStepClick for a future step', () => {
    const onStepClick = vi.fn()
    render(<WizardLayout steps={mockSteps} currentStep={0} onNext={vi.fn()} onStepClick={onStepClick} onChangeTemplate={vi.fn()} />)
    fireEvent.click(screen.getByText('Education'))
    expect(onStepClick).not.toHaveBeenCalled()
  })

  it('calls onChangeTemplate when "Change template" is clicked', () => {
    const onChangeTemplate = vi.fn()
    render(<WizardLayout steps={mockSteps} currentStep={0} onNext={vi.fn()} onStepClick={vi.fn()} onChangeTemplate={onChangeTemplate} />)
    fireEvent.click(screen.getByText('Change template'))
    expect(onChangeTemplate).toHaveBeenCalled()
  })

  it('renders the live preview panel using ResumePreview', () => {
    render(<WizardLayout steps={mockSteps} currentStep={0} onNext={vi.fn()} onStepClick={vi.fn()} onChangeTemplate={vi.fn()} />)
    expect(screen.getAllByTestId('template-preview')).toHaveLength(1)
    expect(screen.getByTestId('resume-preview')).toBeInTheDocument()
  })
})
