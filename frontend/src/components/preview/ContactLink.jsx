const DOMAIN_LABELS = {
  'linkedin.com':      'LinkedIn',
  'github.com':        'GitHub',
  'gitlab.com':        'GitLab',
  'behance.net':       'Behance',
  'dribbble.com':      'Dribbble',
  'twitter.com':       'Twitter',
  'x.com':             'Twitter',
  'medium.com':        'Medium',
  'stackoverflow.com': 'Stack Overflow',
  'kaggle.com':        'Kaggle',
}

function getLabel(url, fieldKey) {
  if (fieldKey === 'personal.linkedin') return 'LinkedIn'
  if (!url) return ''
  try {
    const host = new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace(/^www\./, '')
    for (const [domain, label] of Object.entries(DOMAIN_LABELS)) {
      if (host.endsWith(domain)) return label
    }
    return host
  } catch {
    return url
  }
}

function ExternalLinkIcon() {
  return (
    <svg
      width="9" height="9" viewBox="0 0 12 12" fill="none"
      style={{ display: 'inline', marginLeft: '2px', verticalAlign: 'middle', opacity: 0.55, flexShrink: 0 }}
    >
      <path d="M5 2H2a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V7M8 1h3m0 0v3m0-3L5.5 6.5"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function ContactLink({ path, value, style = {} }) {
  if (!value) return null
  const label = getLabel(value, path)
  const href = value.startsWith('http') ? value : `https://${value}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={href}
      style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', ...style }}
    >
      {label}<ExternalLinkIcon />
    </a>
  )
}
