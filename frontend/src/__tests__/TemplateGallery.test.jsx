import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('../store/useResumeStore', () => ({
  useResumeStore: (selector) => selector({
    templateId: 'classic-traditional',
    setTemplateId: vi.fn(),
  }),
}))

vi.mock('../components/landing/TemplatePreview', () => ({
  default: () => <div data-testid="template-preview" />,
}))

vi.mock('../components/preview/ResumePreview', () => ({
  COMPONENT_MAP: {
    'classic-traditional': () => <div />,
    'classic-academic':    () => <div />,
    'classic-formal':      () => <div />,
    'modern':              () => <div />,
    'modern-sidebar':      () => <div />,
    'modern-banner':       () => <div />,
    'modern-split':        () => <div />,
    'minimal':             () => <div />,
    'minimal-columns':     () => <div />,
    'minimal-boxed':       () => <div />,
    'minimal-serif':       () => <div />,
    'executive':           () => <div />,
    'executive-band':      () => <div />,
    'executive-sidebar':   () => <div />,
    'creative':            () => <div />,
    'creative-star':       () => <div />,
    'creative-minimal':    () => <div />,
  },
}))

import TemplateGallery from '../components/wizard/TemplateGallery'

describe('TemplateGallery', () => {
  it('renders all 5 family cards', () => {
    render(<TemplateGallery onStart={vi.fn()} />)
    expect(screen.getByText('Classic')).toBeInTheDocument()
    expect(screen.getByText('Modern')).toBeInTheDocument()
    expect(screen.getByText('Minimal')).toBeInTheDocument()
    expect(screen.getByText('Executive')).toBeInTheDocument()
    expect(screen.getByText('Creative')).toBeInTheDocument()
  })

  it('expands the family of the current template on mount', () => {
    render(<TemplateGallery onStart={vi.fn()} />)
    // currentTemplateId is 'classic-traditional' → Classic family should be open
    expect(screen.getByText('Traditional')).toBeInTheDocument()
  })

  it('shows variants when a different family card is clicked', () => {
    render(<TemplateGallery onStart={vi.fn()} />)
    fireEvent.click(screen.getByText('Modern'))
    expect(screen.getByText('Sidebar')).toBeInTheDocument()
  })

  it('collapses expanded family when clicking it again', () => {
    render(<TemplateGallery onStart={vi.fn()} />)
    // Classic is expanded on mount; click it to collapse
    fireEvent.click(screen.getByText('Classic'))
    expect(screen.queryByText('Traditional')).not.toBeInTheDocument()
  })

  it('"Start building" button is enabled when a variant is pre-selected', () => {
    render(<TemplateGallery onStart={vi.fn()} />)
    expect(screen.getByRole('button', { name: /start building/i })).not.toBeDisabled()
  })

  it('calls onStart with the selected templateId when button is clicked', () => {
    const onStart = vi.fn()
    render(<TemplateGallery onStart={onStart} />)
    fireEvent.click(screen.getByRole('button', { name: /start building/i }))
    expect(onStart).toHaveBeenCalledWith('classic-traditional')
  })

  it('updates selected variant when a different variant is clicked', () => {
    const onStart = vi.fn()
    render(<TemplateGallery onStart={onStart} />)
    // Classic family is expanded — click Academic
    fireEvent.click(screen.getByText('Academic'))
    fireEvent.click(screen.getByRole('button', { name: /start building/i }))
    expect(onStart).toHaveBeenCalledWith('classic-academic')
  })
})
