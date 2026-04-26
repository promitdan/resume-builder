const PATH = {
  email: (c) => (
    <svg viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="3.5" width="13" height="9" rx="1.5"/>
      <path d="M1.5 5l6.5 4.5 6.5-4.5"/>
    </svg>
  ),
  phone: (c) => (
    <svg viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 2.5H6l1 3-1.8 1.1a8.5 8.5 0 003.7 3.7L10 8.5l3 1v2.3a1.2 1.2 0 01-1.3 1.2C5.8 12.7 3 9.8 3 6.3A1.2 1.2 0 013.5 2.5z"/>
    </svg>
  ),
  location: (c) => (
    <svg viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 1.5a4 4 0 014 4C12 8 8 14 8 14S4 8 4 5.5a4 4 0 014-4z"/>
      <circle cx="8" cy="5.5" r="1.5"/>
    </svg>
  ),
  globe: (c) => (
    <svg viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round">
      <circle cx="8" cy="8" r="6"/>
      <path d="M8 2c-1.8 2-2.8 3.8-2.8 6s1 4 2.8 6M8 2c1.8 2 2.8 3.8 2.8 6s-1 4-2.8 6M2 8h12"/>
    </svg>
  ),
  linkedin: (c) => (
    <svg viewBox="0 0 16 16" fill={c}>
      <path d="M3 5.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM2 7h2v7H2V7zm4 0h2v1c.4-.7 1.3-1.2 2.5-1.2 1.8 0 2.5 1.1 2.5 2.7V14h-2V9.8c0-.9-.3-1.6-1.3-1.6s-1.5.7-1.7 1.4V14H6V7z"/>
    </svg>
  ),
}

export default function ContactIcon({ type, size = 13, color = 'currentColor' }) {
  const fn = PATH[type]
  if (!fn) return null
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', width: size, height: size, flexShrink: 0 }}>
      {fn(color)}
    </span>
  )
}
