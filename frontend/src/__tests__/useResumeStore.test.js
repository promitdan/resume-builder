import { act, renderHook } from '@testing-library/react'
import { useResumeStore } from '../store/useResumeStore'

beforeEach(() => {
  useResumeStore.setState(useResumeStore.getInitialState())
})

describe('useResumeStore', () => {
  test('initial state has empty content and classic template', () => {
    const { result } = renderHook(() => useResumeStore())
    expect(result.current.templateId).toBe('classic')
    expect(result.current.content.personal.name).toBe('')
    expect(result.current.content.experience).toEqual([])
    expect(result.current.content.sectionOrder).toEqual(['personal', 'experience', 'education', 'skills'])
  })

  test('updatePersonal merges fields into personal', () => {
    const { result } = renderHook(() => useResumeStore())
    act(() => result.current.updatePersonal({ name: 'Jane Doe', email: 'jane@test.com' }))
    expect(result.current.content.personal.name).toBe('Jane Doe')
    expect(result.current.content.personal.email).toBe('jane@test.com')
  })

  test('addExperience appends an entry with a uuid id', () => {
    const { result } = renderHook(() => useResumeStore())
    act(() => result.current.addExperience())
    expect(result.current.content.experience).toHaveLength(1)
    expect(result.current.content.experience[0].id).toBeTruthy()
    expect(result.current.content.experience[0].company).toBe('')
  })

  test('updateExperience updates the correct entry by id', () => {
    const { result } = renderHook(() => useResumeStore())
    act(() => result.current.addExperience())
    const id = result.current.content.experience[0].id
    act(() => result.current.updateExperience(id, { company: 'Acme' }))
    expect(result.current.content.experience[0].company).toBe('Acme')
  })

  test('removeExperience removes entry by id', () => {
    const { result } = renderHook(() => useResumeStore())
    act(() => result.current.addExperience())
    const id = result.current.content.experience[0].id
    act(() => result.current.removeExperience(id))
    expect(result.current.content.experience).toHaveLength(0)
  })

  test('toggleOptionalSection adds section key to sectionOrder', () => {
    const { result } = renderHook(() => useResumeStore())
    act(() => result.current.toggleOptionalSection('projects', true))
    expect(result.current.content.sectionOrder).toContain('projects')
  })

  test('toggleOptionalSection removes section key from sectionOrder', () => {
    const { result } = renderHook(() => useResumeStore())
    act(() => result.current.toggleOptionalSection('projects', true))
    act(() => result.current.toggleOptionalSection('projects', false))
    expect(result.current.content.sectionOrder).not.toContain('projects')
  })

  test('setTemplateId updates templateId', () => {
    const { result } = renderHook(() => useResumeStore())
    act(() => result.current.setTemplateId('modern'))
    expect(result.current.templateId).toBe('modern')
  })

  test('setContent replaces full content', () => {
    const { result } = renderHook(() => useResumeStore())
    const incoming = {
      meta: { version: '1.0', updatedAt: '' },
      personal: { name: 'Parsed User', title: '', email: '', phone: '', location: '', linkedin: '', website: '', summary: '' },
      experience: [], education: [], skills: [], projects: [],
      certifications: [], languages: [], awards: [], custom: [],
      sectionOrder: ['personal', 'experience', 'education', 'skills'],
      _raw: ''
    }
    act(() => result.current.setContent(incoming))
    expect(result.current.content.personal.name).toBe('Parsed User')
  })

  test('resetResume restores initial state', () => {
    const { result } = renderHook(() => useResumeStore())
    act(() => result.current.updatePersonal({ name: 'Someone' }))
    act(() => result.current.resetResume())
    expect(result.current.content.personal.name).toBe('')
  })
})
