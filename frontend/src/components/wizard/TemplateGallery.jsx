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

const FAMILY_META = {
  classic:   {
    description: 'Timeless and professional',
    icon: (color) => (
      <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
        <rect x="3" y="2" width="14" height="17" rx="2" stroke={color} strokeWidth="1.5"/>
        <line x1="6" y1="7"  x2="14" y2="7"  stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
        <line x1="6" y1="10" x2="14" y2="10" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
        <line x1="6" y1="13" x2="10" y2="13" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
  modern:    {
    description: 'Clean and contemporary',
    icon: (color) => (
      <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
        <rect x="2"  y="2" width="7" height="17" rx="1.5" stroke={color} strokeWidth="1.5"/>
        <rect x="11" y="2" width="7" height="8"  rx="1.5" stroke={color} strokeWidth="1.5"/>
        <rect x="11" y="12" width="7" height="7" rx="1.5" stroke={color} strokeWidth="1.5"/>
      </svg>
    ),
  },
  minimal:   {
    description: 'Simple and elegant',
    icon: (color) => (
      <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
        <line x1="3" y1="5"  x2="17" y2="5"  stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="3" y1="9"  x2="13" y2="9"  stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="3" y1="13" x2="17" y2="13" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="3" y1="17" x2="10" y2="17" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  executive: {
    description: 'Bold and corporate',
    icon: (color) => (
      <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
        <rect x="2" y="7" width="16" height="11" rx="2" stroke={color} strokeWidth="1.5"/>
        <path d="M7 7V5a3 3 0 016 0v2" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="10" y1="11" x2="10" y2="14" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="7"  y1="12.5" x2="13" y2="12.5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  creative:  {
    description: 'Unique and eye-catching',
    icon: (color) => (
      <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
        <circle cx="10" cy="10" r="3.5" stroke={color} strokeWidth="1.5"/>
        <path d="M10 2v2M10 16v2M2 10h2M16 10h2" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M4.93 4.93l1.41 1.41M13.66 13.66l1.41 1.41M4.93 15.07l1.41-1.41M13.66 6.34l1.41-1.41" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
}

const navy   = '#1a2744'
const orange = '#f47c20'
const border = '#d8d2c8'
const bg     = '#f0ebe2'
const bg2    = '#e8e3d8'

export default function TemplateGallery({ onStart }) {
  const currentTemplateId = useResumeStore(s => s.templateId)

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: '#fff7ed', border: `1px solid ${border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
              <rect x="3" y="2" width="14" height="17" rx="2" stroke={orange} strokeWidth="1.5"/>
              <line x1="6" y1="7"  x2="14" y2="7"  stroke={orange} strokeWidth="1.3" strokeLinecap="round"/>
              <line x1="6" y1="10" x2="14" y2="10" stroke={orange} strokeWidth="1.3" strokeLinecap="round"/>
              <line x1="6" y1="13" x2="10" y2="13" stroke={orange} strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 20, color: navy, letterSpacing: '-0.3px' }}>
              Choose a template to get started
            </div>
            <div style={{ fontSize: 12, color: '#7a7060', marginTop: 2 }}>
              Pick a design that best fits your style and profession.
            </div>
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
                role="button"
                tabIndex={0}
                onClick={() => handleFamilyClick(family.id)}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleFamilyClick(family.id)}
                style={{
                  flex: 1, border: `2px solid ${isExpanded || hasSelected ? navy : border}`,
                  borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
                  background: isExpanded || hasSelected ? navy : '#fff',
                  transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
                  boxShadow: isExpanded ? '0 4px 16px rgba(26,39,68,0.12)' : 'none',
                  padding: '14px 16px',
                  display: 'flex', alignItems: 'center', gap: 12,
                  position: 'relative',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                  background: isExpanded || hasSelected ? 'rgba(255,255,255,0.15)' : bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {FAMILY_META[family.id]?.icon(isExpanded || hasSelected ? '#fff' : navy)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: 700, fontSize: 13, lineHeight: 1.3,
                    color: isExpanded || hasSelected ? '#fff' : navy,
                  }}>
                    {family.label}
                  </div>
                  <div style={{
                    fontSize: 11, marginTop: 2,
                    color: isExpanded || hasSelected ? 'rgba(255,255,255,0.65)' : '#7a7060',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {FAMILY_META[family.id]?.description}
                  </div>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 600, flexShrink: 0,
                  color: isExpanded || hasSelected ? 'rgba(255,255,255,0.55)' : '#a09080',
                  background: isExpanded || hasSelected ? 'rgba(255,255,255,0.12)' : bg,
                  borderRadius: 20, padding: '2px 7px',
                }}>
                  {family.templates.length} styles
                </span>
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
                      role="button"
                      tabIndex={0}
                      onClick={() => handleVariantClick(id)}
                      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleVariantClick(id)}
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
