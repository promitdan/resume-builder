import { create } from 'zustand'
import { v4 as uuid } from 'uuid'
import { set as lodashSet } from 'lodash'

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
  sectionOrder: ['personal', 'experience', 'skills', 'education'],
  _raw: ''
})

const mockContent = () => ({
  meta: { version: '1.0', updatedAt: new Date().toISOString() },
  personal: {
    name: 'Alexandra Chen',
    title: 'Senior Software Engineer',
    email: 'alex.chen@example.com',
    phone: '+1 (415) 555-0192',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexchen',
    website: 'alexchen.dev',
    summary: 'Full-stack software engineer with 7 years of experience building scalable web applications and distributed systems. Led cross-functional teams to deliver high-impact products at companies ranging from early-stage startups to Fortune 500 enterprises. Passionate about clean architecture, developer experience, and mentoring junior engineers.'
  },
  experience: [
    {
      id: uuid(),
      company: 'Stripe',
      role: 'Senior Software Engineer',
      location: 'San Francisco, CA',
      startDate: 'Mar 2021',
      endDate: '',
      current: true,
      bullets: [
        'Architected and led delivery of a real-time payment analytics dashboard serving 50,000+ merchants, reducing load time by 65%',
        'Designed a distributed rate-limiting service handling 2M+ requests/second across 12 global data centers',
        'Mentored 4 junior engineers, establishing code review practices that reduced bug escape rate by 40%',
        'Led migration of legacy payment pipeline to event-driven architecture using Kafka, eliminating 99.9% of data inconsistencies'
      ]
    },
    {
      id: uuid(),
      company: 'Airbnb',
      role: 'Software Engineer II',
      location: 'San Francisco, CA',
      startDate: 'Jun 2018',
      endDate: 'Feb 2021',
      current: false,
      bullets: [
        'Built the host payout system processing $120M+ in monthly transactions with zero-downtime deployments',
        'Developed real-time pricing algorithm increasing booking conversion rates by 18% using ML model integration',
        'Contributed to the GraphQL API migration, reducing client-side data fetching overhead by 45%',
        'Co-authored internal TypeScript style guide adopted across 200+ engineers'
      ]
    },
    {
      id: uuid(),
      company: 'Vertex Labs',
      role: 'Software Engineer',
      location: 'New York, NY',
      startDate: 'Jul 2016',
      endDate: 'May 2018',
      current: false,
      bullets: [
        'Built the core product from 0 to 1, reaching 10,000+ daily active users in 18 months',
        'Implemented CI/CD pipeline reducing deployment time from 2 hours to 12 minutes',
        'Designed RESTful API serving iOS and Android clients with 99.95% uptime SLA'
      ]
    }
  ],
  education: [
    {
      id: uuid(),
      institution: 'Carnegie Mellon University',
      degree: 'M.S.',
      field: 'Computer Science',
      startDate: '2014',
      endDate: '2016',
      gpa: '3.9'
    },
    {
      id: uuid(),
      institution: 'University of Michigan',
      degree: 'B.S.',
      field: 'Computer Science & Mathematics',
      startDate: '2010',
      endDate: '2014',
      gpa: '3.8'
    }
  ],
  skills: [
    { id: uuid(), category: 'Languages', items: ['TypeScript', 'Python', 'Go', 'Java', 'SQL'] },
    { id: uuid(), category: 'Frontend', items: ['React', 'Next.js', 'GraphQL', 'CSS/Sass', 'Figma'] },
    { id: uuid(), category: 'Backend & Infrastructure', items: ['Node.js', 'PostgreSQL', 'Redis', 'Kafka', 'Kubernetes', 'AWS'] },
    { id: uuid(), category: 'Tools', items: ['Git', 'Docker', 'Terraform', 'Datadog', 'GitHub Actions'] }
  ],
  projects: [],
  certifications: [],
  languages: [],
  awards: [],
  custom: [],
  sectionOrder: ['personal', 'experience', 'skills', 'education'],
  _raw: ''
})

const initialState = {
  content: emptyContent(),
  templateId: 'classic-traditional',
  paletteIndex: 0,
  fontSize: 'medium',
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

  // Projects
  addProject: () =>
    set((s) => ({ content: { ...s.content, projects: [...s.content.projects, { id: uuid(), title: '', description: '', url: '', bullets: [''] }] } })),
  updateProject: (id, fields) =>
    set((s) => ({ content: { ...s.content, projects: s.content.projects.map(e => e.id === id ? { ...e, ...fields } : e) } })),
  removeProject: (id) =>
    set((s) => ({ content: { ...s.content, projects: s.content.projects.filter(e => e.id !== id) } })),

  // Certifications
  addCertification: () =>
    set((s) => ({ content: { ...s.content, certifications: [...s.content.certifications, { id: uuid(), name: '', issuer: '', date: '' }] } })),
  updateCertification: (id, fields) =>
    set((s) => ({ content: { ...s.content, certifications: s.content.certifications.map(e => e.id === id ? { ...e, ...fields } : e) } })),
  removeCertification: (id) =>
    set((s) => ({ content: { ...s.content, certifications: s.content.certifications.filter(e => e.id !== id) } })),

  // Languages
  addLanguage: () =>
    set((s) => ({ content: { ...s.content, languages: [...s.content.languages, { id: uuid(), language: '', proficiency: 'Professional' }] } })),
  updateLanguage: (id, fields) =>
    set((s) => ({ content: { ...s.content, languages: s.content.languages.map(e => e.id === id ? { ...e, ...fields } : e) } })),
  removeLanguage: (id) =>
    set((s) => ({ content: { ...s.content, languages: s.content.languages.filter(e => e.id !== id) } })),

  // Awards
  addAward: () =>
    set((s) => ({ content: { ...s.content, awards: [...s.content.awards, { id: uuid(), title: '', issuer: '', date: '', description: '' }] } })),
  updateAward: (id, fields) =>
    set((s) => ({ content: { ...s.content, awards: s.content.awards.map(e => e.id === id ? { ...e, ...fields } : e) } })),
  removeAward: (id) =>
    set((s) => ({ content: { ...s.content, awards: s.content.awards.filter(e => e.id !== id) } })),

  // Custom
  addCustom: () =>
    set((s) => ({ content: { ...s.content, custom: [...s.content.custom, { id: uuid(), title: '', description: '' }] } })),
  updateCustom: (id, fields) =>
    set((s) => ({ content: { ...s.content, custom: s.content.custom.map(e => e.id === id ? { ...e, ...fields } : e) } })),
  removeCustom: (id) =>
    set((s) => ({ content: { ...s.content, custom: s.content.custom.filter(e => e.id !== id) } })),

  toggleOptionalSection: (key, enabled) =>
    set((s) => {
      const order = s.content.sectionOrder.filter((k) => k !== key)
      if (enabled) order.push(key)
      return { content: { ...s.content, sectionOrder: order } }
    }),

  reorderSections: (newOrder) =>
    set((s) => ({ content: { ...s.content, sectionOrder: newOrder } })),

  setTemplateId: (templateId) => set({ templateId, paletteIndex: 0 }),

  setPaletteIndex: (paletteIndex) => set({ paletteIndex }),

  setFontSize: (fontSize) => set({ fontSize }),

  loadMockData: () => set({ content: mockContent(), templateId: 'classic-traditional' }),

  resetResume: () => set({ content: emptyContent(), templateId: 'classic-traditional' }),

  setField: (path, value) =>
    set((s) => {
      const content = structuredClone(s.content)
      lodashSet(content, path, value)
      return { content }
    }),
}))

useResumeStore.getInitialState = () => ({ content: emptyContent(), templateId: 'classic-traditional', paletteIndex: 0, fontSize: 'medium' })
