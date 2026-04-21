import { create } from 'zustand'

export const useAgentStore = create(() => ({
  review: { score: null, feedback: [], loading: false },
  suggestions: { items: [], loading: false },
  jobMatch: { score: null, gaps: [], loading: false },
  benchmark: { courses: [], loading: false }
}))
