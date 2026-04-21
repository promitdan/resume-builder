import { create } from 'zustand'
import { v4 as uuid } from 'uuid'

const emptyContent = () => ({
  meta: { version: '1.0', updatedAt: new Date().toISOString() },
  personal: { name: '', title: '', email: '', phone: '', location: '', linkedin: '', website: '', summary: '' },
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  awards: [],
  custom: [],
  sectionOrder: ['personal', 'experience', 'education', 'skills'],
  _raw: ''
})

const initialState = {
  content: emptyContent(),
  templateId: 'classic'
}

export const useResumeStore = create((set) => ({
  ...initialState,

  setContent: (content) => set({ content }),

  updatePersonal: (fields) =>
    set((s) => ({ content: { ...s.content, personal: { ...s.content.personal, ...fields } } })),

  addExperience: () =>
    set((s) => ({
      content: {
        ...s.content,
        experience: [...s.content.experience, { id: uuid(), company: '', role: '', location: '', startDate: '', endDate: '', current: false, bullets: [''] }]
      }
    })),

  updateExperience: (id, fields) =>
    set((s) => ({
      content: {
        ...s.content,
        experience: s.content.experience.map((e) => (e.id === id ? { ...e, ...fields } : e))
      }
    })),

  removeExperience: (id) =>
    set((s) => ({ content: { ...s.content, experience: s.content.experience.filter((e) => e.id !== id) } })),

  addEducation: () =>
    set((s) => ({
      content: {
        ...s.content,
        education: [...s.content.education, { id: uuid(), institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' }]
      }
    })),

  updateEducation: (id, fields) =>
    set((s) => ({
      content: {
        ...s.content,
        education: s.content.education.map((e) => (e.id === id ? { ...e, ...fields } : e))
      }
    })),

  removeEducation: (id) =>
    set((s) => ({ content: { ...s.content, education: s.content.education.filter((e) => e.id !== id) } })),

  updateSkills: (skills) =>
    set((s) => ({ content: { ...s.content, skills } })),

  toggleOptionalSection: (key, enabled) =>
    set((s) => {
      const order = s.content.sectionOrder.filter((k) => k !== key)
      if (enabled) order.push(key)
      return { content: { ...s.content, sectionOrder: order } }
    }),

  reorderSections: (newOrder) =>
    set((s) => ({ content: { ...s.content, sectionOrder: newOrder } })),

  setTemplateId: (templateId) => set({ templateId }),

  resetResume: () => set({ content: emptyContent(), templateId: 'classic' })
}))

useResumeStore.getInitialState = () => ({ content: emptyContent(), templateId: 'classic' })
