import { useState } from 'react'
import { CATEGORIES, TEMPLATE_CONFIGS } from '../../registry/templateRegistry'
import { COMPONENT_MAP } from '../preview/ResumePreview'
import TemplatePreview from '../landing/TemplatePreview'
import { useResumeStore } from '../../store/useResumeStore'

const THUMBNAIL_CONTENT = {
  meta: { version: '1.0', updatedAt: '' },
  personal: {
    name: 'Alexandra Chen',
    title: 'Senior Software Engineer',
    email: 'alex@example.com',
    phone: '(415) 555-0192',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexchen',
    website: '',
    summary: 'Full-stack engineer with 7 years building scalable web applications and distributed systems.',
  },
  experience: [
    {
      id: '1', company: 'Stripe', role: 'Senior Software Engineer',
      location: 'San Francisco, CA', startDate: 'Mar 2021', endDate: '',
      current: true,
      bullets: [
        'Led delivery of a real-time analytics dashboard serving 50,000+ merchants',
        'Designed a distributed rate-limiting service handling 2M+ requests/second',
      ],
    },
    {
      id: '2', company: 'Airbnb', role: 'Software Engineer II',
      location: 'San Francisco, CA', startDate: 'Jun 2018', endDate: 'Feb 2021',
      current: false,
      bullets: ['Built the host payout system processing $120M+ in monthly transactions'],
    },
  ],
  education: [
    { id: '1', institution: 'Carnegie Mellon University', degree: 'M.S.', field: 'Computer Science', startDate: '2014', endDate: '2016', gpa: '3.9' },
  ],
  skills: [
    { id: '1', category: 'Languages', items: ['TypeScript', 'Python', 'Go', 'Java'] },
    { id: '2', category: 'Frontend',  items: ['React', 'Next.js', 'GraphQL', 'CSS'] },
  ],
  projects: [], certifications: [], languages: [], awards: [], custom: [],
  sectionOrder: ['personal', 'experience', 'skills', 'education'],
  _raw: '',
}

const FAMILY_ACCENT = {
  classic:   '#1a2744',
  modern:    '#1e3a5f',
  minimal:   '#555555',
  executive: '#1a1a1a',
  creative:  '#6c63ff',
}

const navy   = '#1a2744'
const orange = '#f47c20'
const border = '#d8d2c8'
const bg     = '#f0ebe2'
const bg2    = '#e8e3d8'

export default function TemplateGallery({ onStart }) {
  const currentTemplateId = useResumeStore(s => s.templateId)
  const setTemplateId     = useResumeStore(s => s.setTemplateId)

  const initialFamily = CATEGORIES.find(c =>
    c.templates.some(t => t.id === currentTemplateId)
  )?.id ?? null

  const [expandedFamily, setExpandedFamily] = useState(initialFamily)
  const [selectedId, setSelectedId]         = useState(currentTemplateId)

  function handleFamilyClick(familyId) {
    setExpandedFamily(prev => prev === familyId ? null : familyId)
  }

  function handleVariantClick(templateId) {
    setSelectedId(templateId)
    setTemplateId(templateId)
  }

  function handleStart() {
    if (selectedId) onStart(selectedId)
  }

  return (
    <div style={{
      minHeight: '100vh', background: bg,
      fontFamily: "'Inter', -apple-system, sans-serif",
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '24px 48px 20px', background: bg2,
        borderBottom: `1px solid ${border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 22, color: navy, letterSpacing: '-0.5px' }}>
            Resume<span style={{ color: orange }}>Forge</span>
          </div>
          <div style={{ fontSize: 13, color: '#7a7060', marginTop: 3 }}>
            Choose a template to get started
          </div>
        </div>
        <button
          onClick={handleStart}
          disabled={!selectedId}
          style={{
            background: selectedId ? navy : '#c8c2b8',
            color: '#fff', fontWeight: 700, fontSize: 14,
            padding: '10px 28px', borderRadius: 8, border: 'none',
            cursor: selectedId ? 'pointer' : 'not-allowed',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { if (selectedId) e.currentTarget.style.background = '#243560' }}
          onMouseLeave={e => { if (selectedId) e.currentTarget.style.background = navy }}
        >
          Start building →
        </button>
      </div>

      {/* Family cards */}
      <div style={{ flex: 1, padding: '32px 48px' }}>
        <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
          {CATEGORIES.map(family => {
            const isExpanded  = expandedFamily === family.id
            const hasSelected = family.templates.some(t => t.id === selectedId)
            return (
              <div
                key={family.id}
                onClick={() => handleFamilyClick(family.id)}
                style={{
                  flex: 1, border: `2px solid ${isExpanded || hasSelected ? navy : border}`,
                  borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
                  background: '#fff', transition: 'border-color 0.15s, box-shadow 0.15s',
                  boxShadow: isExpanded ? '0 4px 16px rgba(26,39,68,0.12)' : 'none',
                }}
              >
                <div style={{
                  height: 110, background: FAMILY_ACCENT[family.id],
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', inset: 0, opacity: 0.15,
                    display: 'flex', flexDirection: 'column', gap: 6, padding: 12,
                  }}>
                    <div style={{ height: 12, background: '#fff', borderRadius: 2, width: '60%' }} />
                    <div style={{ height: 5,  background: '#fff', borderRadius: 2, width: '40%' }} />
                    <div style={{ height: 4,  background: '#fff', borderRadius: 2, width: '80%', marginTop: 6 }} />
                    <div style={{ height: 4,  background: '#fff', borderRadius: 2, width: '70%' }} />
                    <div style={{ height: 4,  background: '#fff', borderRadius: 2, width: '75%' }} />
                  </div>
                </div>
                <div style={{
                  padding: '10px 14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{
                    fontWeight: 700, fontSize: 14,
                    color: isExpanded || hasSelected ? navy : '#7a7060',
                  }}>
                    {family.label}
                  </span>
                  <span style={{ color: '#a09080', fontSize: 11 }}>
                    {family.templates.length} styles
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Variant row */}
        {expandedFamily && (() => {
          const family = CATEGORIES.find(c => c.id === expandedFamily)
          if (!family) return null
          return (
            <div style={{
              background: '#fff', borderRadius: 12, padding: '20px 24px',
              border: `1px solid ${border}`,
              boxShadow: '0 2px 12px rgba(26,39,68,0.08)',
            }}>
              <div style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '1px',
                textTransform: 'uppercase', color: '#a09080', marginBottom: 16,
              }}>
                {family.label} Variants
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {family.templates.map(({ id, label }) => {
                  const tplConfig     = TEMPLATE_CONFIGS[id]
                  const paletteColors = tplConfig?.palettes?.[0]?.colors ?? {}
                  const Component     = COMPONENT_MAP[id]
                  const isSelected    = id === selectedId
                  return (
                    <div
                      key={id}
                      onClick={() => handleVariantClick(id)}
                      style={{
                        width: 160, flexShrink: 0, cursor: 'pointer',
                        border: `2px solid ${isSelected ? orange : border}`,
                        borderRadius: 10, overflow: 'hidden',
                        transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.15s',
                        boxShadow: isSelected ? '0 4px 16px rgba(244,124,32,0.20)' : 'none',
                        transform: isSelected ? 'translateY(-2px)' : 'none',
                      }}
                    >
                      <div style={{ height: 200, background: '#f8f8f8', overflow: 'hidden' }}>
                        {Component && (
                          <TemplatePreview
                            Component={Component}
                            paletteColors={paletteColors}
                            content={THUMBNAIL_CONTENT}
                          />
                        )}
                      </div>
                      <div style={{
                        padding: '8px 10px',
                        background: isSelected ? '#fff7ed' : '#fff',
                        borderTop: `1px solid ${isSelected ? '#fed7aa' : '#f1f0ee'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: isSelected ? orange : navy }}>
                          {label}
                        </span>
                        {isSelected && (
                          <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                            <circle cx="8" cy="8" r="7" fill={orange} />
                            <path d="M5 8l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
