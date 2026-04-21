import ClassicTemplate   from './templates/ClassicTemplate'
import ModernTemplate    from './templates/ModernTemplate'
import MinimalTemplate   from './templates/MinimalTemplate'
import ExecutiveTemplate from './templates/ExecutiveTemplate'
import CreativeTemplate  from './templates/CreativeTemplate'

const MAP = { classic: ClassicTemplate, modern: ModernTemplate, minimal: MinimalTemplate, executive: ExecutiveTemplate, creative: CreativeTemplate }

export default function ResumePreview({ content, templateId }) {
  const Template = MAP[templateId]
  if (!Template) return <div style={{ padding: '20px', color: '#e53e3e' }}>Unknown template: {templateId}</div>
  return (
    <div style={{ width: '8.5in', minHeight: '11in', background: '#fff', margin: '0 auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <Template content={content} />
    </div>
  )
}
