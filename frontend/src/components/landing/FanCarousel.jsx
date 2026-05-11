// frontend/src/components/landing/FanCarousel.jsx
import { useState, useEffect, useCallback } from 'react'
import TemplatePreview from './TemplatePreview'

import ClassicTemplate   from '../preview/templates/ClassicTemplate'
import ModernTemplate    from '../preview/templates/ModernTemplate'
import ExecutiveTemplate from '../preview/templates/ExecutiveTemplate'
import CreativeTemplate  from '../preview/templates/CreativeTemplate'
import MinimalTemplate   from '../preview/templates/MinimalTemplate'

import classicTpl    from '../../templates/classic.json'
import modernTpl     from '../../templates/modern.json'
import executiveTpl  from '../../templates/executive.json'
import creativeTpl   from '../../templates/creative.json'
import minimalTpl    from '../../templates/minimal.json'

const SAMPLE = {
  personal: {
    name: 'Alexandra Chen',
    title: 'Senior Software Engineer',
    email: 'alex.chen@example.com',
    phone: '+1 (415) 555-0192',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexchen',
    website: 'alexchen.dev',
    summary: 'Full-stack engineer with 7 years building scalable web systems. Led cross-functional teams delivering high-impact products at Fortune 500 enterprises.',
  },
  experience: [
    {
      id: '1', company: 'Stripe', role: 'Senior Software Engineer',
      location: 'San Francisco, CA', startDate: 'Mar 2021', endDate: '', current: true,
      bullets: [
        'Built real-time analytics dashboard serving 50,000+ merchants, cutting load time 65%',
        'Designed distributed rate-limiting service handling 2M+ requests/second',
        'Mentored 4 junior engineers, reducing bug escape rate by 40%',
      ],
    },
    {
      id: '2', company: 'Airbnb', role: 'Software Engineer II',
      location: 'San Francisco, CA', startDate: 'Jun 2018', endDate: 'Feb 2021', current: false,
      bullets: [
        'Built host payout system processing $120M+ in monthly transactions',
        'Developed ML pricing algorithm increasing booking conversions by 18%',
        'Contributed to GraphQL API migration, reducing data-fetching overhead 45%',
      ],
    },
    {
      id: '3', company: 'Vertex Labs', role: 'Software Engineer',
      location: 'New York, NY', startDate: 'Jul 2016', endDate: 'May 2018', current: false,
      bullets: [
        'Grew core product from 0 to 10,000+ daily active users in 18 months',
        'Implemented CI/CD pipeline cutting deployment time from 2 hours to 12 minutes',
      ],
    },
  ],
  education: [
    { id: '1', institution: 'Carnegie Mellon University', degree: 'M.S.', field: 'Computer Science', startDate: '2014', endDate: '2016', gpa: '3.9' },
    { id: '2', institution: 'University of Michigan', degree: 'B.S.', field: 'Computer Science', startDate: '2010', endDate: '2014', gpa: '3.8' },
  ],
  skills: [
    { id: '1', category: 'Languages',  items: ['TypeScript', 'Python', 'Go', 'Java', 'SQL'] },
    { id: '2', category: 'Frontend',   items: ['React', 'Next.js', 'GraphQL', 'CSS/Sass'] },
    { id: '3', category: 'Backend',    items: ['Node.js', 'PostgreSQL', 'Redis', 'Kafka', 'AWS'] },
    { id: '4', category: 'Tools',      items: ['Docker', 'Terraform', 'Datadog', 'GitHub Actions'] },
  ],
  projects: [], certifications: [], languages: [], awards: [], custom: [],
  sectionOrder: ['personal', 'experience', 'skills', 'education'],
  _raw: '',
}

const TEMPLATES = [
  { name: 'Classic',   Component: ClassicTemplate,   config: classicTpl   },
  { name: 'Modern',    Component: ModernTemplate,    config: modernTpl    },
  { name: 'Executive', Component: ExecutiveTemplate, config: executiveTpl },
  { name: 'Creative',  Component: CreativeTemplate,  config: creativeTpl  },
  { name: 'Minimal',   Component: MinimalTemplate,   config: minimalTpl   },
]

const N = TEMPLATES.length

// Maps relative position (-2..2) to fan transform styles
const FAN_STYLE = {
  '-2': { transform: 'translateX(-29vh) translateY(4vh) rotate(-14deg) scale(0.60)', filter: 'blur(4px)', zIndex: 1,  boxShadow: '0 6px 24px rgba(26,39,68,0.18)',  cursor: 'pointer' },
  '-1': { transform: 'translateX(-16vh) translateY(2vh) rotate(-7deg)  scale(0.78)', filter: 'blur(2px)', zIndex: 3,  boxShadow: '0 10px 32px rgba(26,39,68,0.22)', cursor: 'pointer' },
  '0':  { transform: 'translateX(0)     translateY(0)   rotate(0deg)   scale(1)',    filter: 'none',       zIndex: 5,  boxShadow: '0 24px 64px rgba(26,39,68,0.28), 0 0 0 1.5px rgba(244,124,32,0.35)', cursor: 'default' },
  '1':  { transform: 'translateX(16vh)  translateY(2vh) rotate(7deg)   scale(0.78)', filter: 'blur(2px)', zIndex: 3,  boxShadow: '0 10px 32px rgba(26,39,68,0.22)', cursor: 'pointer' },
  '2':  { transform: 'translateX(29vh)  translateY(4vh) rotate(14deg)  scale(0.60)', filter: 'blur(4px)', zIndex: 1,  boxShadow: '0 6px 24px rgba(26,39,68,0.18)',  cursor: 'pointer' },
}

function getPos(i, current) {
  let rel = ((i - current) % N + N) % N
  if (rel > Math.floor(N / 2)) rel -= N
  return rel  // guaranteed -2..2 for N=5
}

export default function FanCarousel() {
  const [current, setCurrent] = useState(2)

  const goTo = useCallback((idx) => {
    const next = ((idx % N) + N) % N
    setCurrent(next)
  }, [])

  const move = useCallback((dir) => goTo(current + dir), [current, goTo])

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(() => move(1), 3500)
    return () => clearInterval(timer)
  }, [move])

  const arrowBtn = (label, onClick) => (
    <button
      onClick={onClick}
      style={{
        position: 'absolute', top: '50%', transform: 'translateY(-50%)',
        width: 36, height: 36, borderRadius: '50%',
        background: 'rgba(26,39,68,0.65)', border: '1px solid rgba(26,39,68,0.15)',
        color: '#fff', fontSize: 22, cursor: 'pointer', zIndex: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.15s',
        left: label === '‹' ? 16 : undefined,
        right: label === '›' ? 16 : undefined,
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(26,39,68,0.9)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(26,39,68,0.65)' }}
    >
      {label}
    </button>
  )

  return (
    <div style={{
      background: 'linear-gradient(160deg, #ede8de 0%, #e4dfd4 55%, #d8d2c6 100%)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', position: 'relative',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(244,124,32,0.07) 0%, transparent 70%)',
      }} />

      {/* Section label */}
      <div style={{
        position: 'absolute', top: 20, left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10,
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: '#a09080', textTransform: 'uppercase' }}>Professional Template Preview</span>
      </div>

      {/* Fan stage */}
      <div style={{ position: 'relative', width: '100%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {arrowBtn('‹', () => move(-1))}

        {TEMPLATES.map(({ Component, config, name }, i) => {
          const pos = getPos(i, current)
          const posStyle = FAN_STYLE[String(pos)]
          const paletteColors = config.palettes?.[0]?.colors ?? {}

          return (
            <div
              key={name}
              onClick={() => pos !== 0 && goTo(i)}
              style={{
                position: 'absolute',
                height: '75%',
                aspectRatio: '0.707',
                borderRadius: 6,
                overflow: 'hidden',
                opacity: 1,
                transition: 'transform 0.55s cubic-bezier(0.34, 1.1, 0.64, 1), filter 0.45s ease, box-shadow 0.45s ease',
                willChange: 'transform, filter',
                ...posStyle,
              }}
            >
              <TemplatePreview Component={Component} paletteColors={paletteColors} content={SAMPLE} />
            </div>
          )
        })}

        {arrowBtn('›', () => move(1))}
      </div>

      {/* Dot indicators — sit just above the feature strip */}
      <div style={{ position: 'absolute', bottom: 152, left: 0, right: 0, display: 'flex', gap: 7, justifyContent: 'center', zIndex: 10 }}>
        {TEMPLATES.map((_, i) => (
          <div
            key={i}
            onClick={() => goTo(i)}
            style={{
              width: 6, height: 6, borderRadius: '50%', cursor: 'pointer',
              background: i === current ? '#f47c20' : 'rgba(26,39,68,0.2)',
              transform: i === current ? 'scale(1.4)' : 'scale(1)',
              transition: 'background 0.2s, transform 0.2s',
            }}
          />
        ))}
      </div>

      {/* Feature strip */}
      <div style={{
        flexShrink: 0, display: 'flex',
        borderTop: '1px solid rgba(26,39,68,0.12)',
        background: 'rgba(26,39,68,0.06)',
        paddingBottom: 12,
        zIndex: 10,
      }}>
        {[
          {
            label: 'ATS Friendly', sub: 'Beat the bots', iconBg: '#ede9fe',
            icon: (
              <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
                <circle cx="10" cy="10" r="7.5" stroke="#7c3aed" strokeWidth="1.4"/>
                <path d="M7 10l2 2 4-4" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ),
          },
          {
            label: 'AI Suggestions', sub: 'Write better, faster', iconBg: '#fff7ed',
            icon: (
              <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
                <path d="M10 2L11.4 6.6H16.2L12.4 9.4L13.8 14L10 11.2L6.2 14L7.6 9.4L3.8 6.6H8.6L10 2Z" fill="#f47c20"/>
              </svg>
            ),
          },
          {
            label: 'Multiple Formats', sub: 'PDF & DOCX', iconBg: '#dcfce7',
            icon: (
              <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
                <rect x="4" y="2" width="12" height="14" rx="2" stroke="#16a34a" strokeWidth="1.5"/>
                <path d="M10 7v5M7.5 10l2.5 2.5 2.5-2.5" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="7" y1="5" x2="13" y2="5" stroke="#16a34a" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
              </svg>
            ),
          },
          {
            label: 'Secure & Private', sub: 'Your data, your control', iconBg: '#dbeafe',
            icon: (
              <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
                <path d="M10 2L4 5v5c0 3.5 2.5 6.5 6 7.5 3.5-1 6-4 6-7.5V5L10 2Z" stroke="#2563eb" strokeWidth="1.4" fill="rgba(37,99,235,0.1)"/>
                <path d="M7.5 10l2 2 3-3" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ),
          },
        ].map(({ label, sub, icon, iconBg }) => (
          <div key={label} style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 10,
            padding: '14px 14px 18px',
            borderRight: '1px solid rgba(26,39,68,0.08)',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', background: iconBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>{icon}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1a2744', lineHeight: 1.2 }}>{label}</div>
              <div style={{ fontSize: 11, color: '#7a7060', marginTop: 2 }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
