import { useParams } from 'react-router-dom'
import ClassicTemplate         from '../components/preview/templates/ClassicTemplate'
import ClassicAcademicTemplate from '../components/preview/templates/ClassicAcademicTemplate'
import ClassicFormalTemplate   from '../components/preview/templates/ClassicFormalTemplate'
import ModernTemplate          from '../components/preview/templates/ModernTemplate'
import ModernSidebarTemplate   from '../components/preview/templates/ModernSidebarTemplate'
import ModernBannerTemplate    from '../components/preview/templates/ModernBannerTemplate'
import ModernSplitTemplate     from '../components/preview/templates/ModernSplitTemplate'
import MinimalTemplate         from '../components/preview/templates/MinimalTemplate'
import MinimalColumnsTemplate  from '../components/preview/templates/MinimalColumnsTemplate'
import MinimalBoxedTemplate    from '../components/preview/templates/MinimalBoxedTemplate'
import MinimalSerifTemplate    from '../components/preview/templates/MinimalSerifTemplate'
import ExecutiveTemplate       from '../components/preview/templates/ExecutiveTemplate'
import ExecutiveBandTemplate   from '../components/preview/templates/ExecutiveBandTemplate'
import ExecutiveSidebarTemplate from '../components/preview/templates/ExecutiveSidebarTemplate'
import CreativeTemplate        from '../components/preview/templates/CreativeTemplate'
import CreativeStarTemplate    from '../components/preview/templates/CreativeStarTemplate'
import CreativeMinimalTemplate from '../components/preview/templates/CreativeMinimalTemplate'
import { TEMPLATE_CONFIGS }    from '../registry/templateRegistry'

const COMPONENT_MAP = {
  'classic-traditional': ClassicTemplate,
  'classic-academic':    ClassicAcademicTemplate,
  'classic-formal':      ClassicFormalTemplate,
  'modern':              ModernTemplate,
  'modern-sidebar':      ModernSidebarTemplate,
  'modern-banner':       ModernBannerTemplate,
  'modern-split':        ModernSplitTemplate,
  'minimal':             MinimalTemplate,
  'minimal-columns':     MinimalColumnsTemplate,
  'minimal-boxed':       MinimalBoxedTemplate,
  'minimal-serif':       MinimalSerifTemplate,
  'executive':           ExecutiveTemplate,
  'executive-band':      ExecutiveBandTemplate,
  'executive-sidebar':   ExecutiveSidebarTemplate,
  'creative':            CreativeTemplate,
  'creative-star':       CreativeStarTemplate,
  'creative-minimal':    CreativeMinimalTemplate,
}

const FONT_VARS = {
  '--resume-body':  '14px',
  '--resume-meta':  '13px',
  '--resume-label': '11px',
  '--resume-sub':   '15px',
}

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
    {
      id: '1', institution: 'Carnegie Mellon University',
      degree: 'M.S.', field: 'Computer Science', startDate: '2014', endDate: '2016', gpa: '3.9',
    },
    {
      id: '2', institution: 'University of Michigan',
      degree: 'B.S.', field: 'Computer Science', startDate: '2010', endDate: '2014', gpa: '3.8',
    },
  ],
  skills: [
    { id: '1', category: 'Languages',   items: ['TypeScript', 'Python', 'Go', 'Java', 'SQL'] },
    { id: '2', category: 'Frontend',    items: ['React', 'Next.js', 'GraphQL', 'CSS/Sass'] },
    { id: '3', category: 'Backend',     items: ['Node.js', 'PostgreSQL', 'Redis', 'Kafka', 'AWS'] },
    { id: '4', category: 'Tools',       items: ['Docker', 'Terraform', 'Datadog', 'GitHub Actions'] },
  ],
  projects: [], certifications: [], languages: [], awards: [], custom: [],
  sectionOrder: ['personal', 'experience', 'skills', 'education'],
  _raw: '',
}

export default function TemplateThumbnailPage() {
  const { templateId } = useParams()
  const Template = COMPONENT_MAP[templateId]
  const tpl = TEMPLATE_CONFIGS[templateId]
  const paletteColors = tpl?.palettes?.[0]?.colors ?? {}

  if (!Template) return null

  return (
    <div style={{ width: `${8.5 * 96}px`, margin: 0, padding: 0, ...FONT_VARS }}>
      <Template content={SAMPLE} paletteColors={paletteColors} />
    </div>
  )
}
