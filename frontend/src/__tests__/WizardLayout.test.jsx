import { render, screen, fireEvent } from '@testing-library/react'
import WizardLayout from '../components/wizard/WizardLayout'

const mockSteps = [
  { title: 'Info',  component: () => <div>Info Step</div> },
  { title: 'Work',  component: () => <div>Work Step</div> },
  { title: 'Done',  component: () => <div>Done Step</div> }
]

test('renders current step component', () => {
  render(<WizardLayout steps={mockSteps} currentStep={0} onNext={() => {}} onBack={() => {}} />)
  expect(screen.getByText('Info Step')).toBeInTheDocument()
})

test('shows step indicator', () => {
  render(<WizardLayout steps={mockSteps} currentStep={1} onNext={() => {}} onBack={() => {}} />)
  expect(screen.getByText(/step 2 of 3/i)).toBeInTheDocument()
})

test('Next button calls onNext', () => {
  const onNext = vi.fn()
  render(<WizardLayout steps={mockSteps} currentStep={0} onNext={onNext} onBack={() => {}} />)
  fireEvent.click(screen.getByText(/next/i))
  expect(onNext).toHaveBeenCalled()
})

test('Back button calls onBack', () => {
  const onBack = vi.fn()
  render(<WizardLayout steps={mockSteps} currentStep={1} onNext={() => {}} onBack={onBack} />)
  fireEvent.click(screen.getByText(/back/i))
  expect(onBack).toHaveBeenCalled()
})

test('Back button is disabled on step 0', () => {
  render(<WizardLayout steps={mockSteps} currentStep={0} onNext={() => {}} onBack={() => {}} />)
  expect(screen.getByText(/back/i)).toBeDisabled()
})

test('Next button shows Finish on last step', () => {
  render(<WizardLayout steps={mockSteps} currentStep={2} onNext={() => {}} onBack={() => {}} />)
  expect(screen.getByText(/finish/i)).toBeInTheDocument()
})
