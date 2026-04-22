import { render, screen, fireEvent } from '@testing-library/react'
import WizardLayout from '../components/wizard/WizardLayout'

const mockSteps = [
  { title: 'Info',  component: () => <div>Info Step</div> },
  { title: 'Work',  component: () => <div>Work Step</div> },
  { title: 'Done',  component: () => <div>Done Step</div> }
]

test('renders current step component', () => {
  render(<WizardLayout steps={mockSteps} currentStep={0} onNext={() => {}} />)
  expect(screen.getByText('Info Step')).toBeInTheDocument()
})

test('shows step indicator text', () => {
  render(<WizardLayout steps={mockSteps} currentStep={1} onNext={() => {}} />)
  expect(screen.getByText(/step 2 of 3/i)).toBeInTheDocument()
})

test('Next button calls onNext', () => {
  const onNext = vi.fn()
  render(<WizardLayout steps={mockSteps} currentStep={0} onNext={onNext} />)
  fireEvent.click(screen.getByText(/next/i))
  expect(onNext).toHaveBeenCalled()
})

test('Next button shows Finish on last step', () => {
  render(<WizardLayout steps={mockSteps} currentStep={2} onNext={() => {}} />)
  expect(screen.getByText(/finish/i)).toBeInTheDocument()
})

test('clicking a completed step calls onStepClick with its index', () => {
  const onStepClick = vi.fn()
  render(<WizardLayout steps={mockSteps} currentStep={2} onNext={() => {}} onStepClick={onStepClick} />)
  // Step 0 (Info) is completed when currentStep=2 — click its sidebar item
  fireEvent.click(screen.getByText('Info'))
  expect(onStepClick).toHaveBeenCalledWith(0)
})

test('clicking a future step does not call onStepClick', () => {
  const onStepClick = vi.fn()
  render(<WizardLayout steps={mockSteps} currentStep={0} onNext={() => {}} onStepClick={onStepClick} />)
  // Step 2 (Done) is in the future when currentStep=0
  fireEvent.click(screen.getByText('Done'))
  expect(onStepClick).not.toHaveBeenCalled()
})

test('all step titles rendered in sidebar', () => {
  render(<WizardLayout steps={mockSteps} currentStep={0} onNext={() => {}} />)
  // Use getAllByText because 'Info' appears in both sidebar and top bar h2
  expect(screen.getAllByText('Info').length).toBeGreaterThanOrEqual(1)
  expect(screen.getByText('Work')).toBeInTheDocument()
  expect(screen.getByText('Done')).toBeInTheDocument()
})
