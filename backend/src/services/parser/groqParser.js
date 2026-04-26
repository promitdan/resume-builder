const fetch = require('node-fetch')

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL   = process.env.GROQ_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct'
const TIMEOUT_MS   = 30_000

class GroqUnavailableError extends Error {
  constructor(msg) { super(msg); this.name = 'GroqUnavailableError' }
}

const PROMPT_SECTIONS = `You are a resume parser. Extract content from the resume and return ONLY valid JSON.

Section mapping rules:
- "Experience", "Experiences", "Work Experience", "Professional Experience", "Internship", "Work History", "Employment" → SKIP entirely, do not include
- "Skills", "Technical Skills", "Core Competencies", "Key Skills", "Tools" → skills[]
- "Certifications", "Licenses", "Credentials", "Achievements and Certifications" → certifications[]
- "Languages", "Language Proficiency" → languages[]
- "Awards", "Honors", "Achievements", "Recognition", "Extracurricular Achievements" → awards[]
- "Projects", "Academic Projects", "Personal Projects", "Key Projects", "Research", "Research Paper Presentation" → projects[]
- Any other section not listed above (Volunteer, Clubs, Activities, Interests, Hobbies, Publications, etc.) → custom[] with the section heading as "title"
- "Education", "Academic Background", "Qualifications" → education[]

Rules:
- NEVER paraphrase, summarize, or rewrite any text — copy every field verbatim from the resume
- Extract every skill item — do not skip any
- Copy the professional summary verbatim word for word
- Copy project descriptions verbatim — do not shorten or rewrite them
- Copy award titles, certification names, and all other text exactly as written
- For each custom section, extract each distinct item/activity as a separate verbatim string in the bullets array
- If a field is absent, use "" or []
- Every key must be present
- For personal.linkedin: if the resume text says "LinkedIn" or "linkedin" with no visible URL, look for a linkedin.com URL in the embedded URL list and use that full URL
- For personal.website: if the resume text says "GitHub" or "github" with no visible URL, look for a github.com URL in the embedded URL list and use that full URL
- For projects[].url: if a project title is followed by "GitHub" with no visible URL, look for a matching github.com URL in the embedded URL list

Return ONLY this JSON shape:
{
  "personal": { "name": "", "title": "", "email": "", "phone": "", "location": "", "linkedin": "", "website": "", "summary": "" },
  "skills": [{ "category": "", "items": [] }],
  "certifications": [{ "name": "", "issuer": "", "date": "" }],
  "languages": [{ "language": "", "proficiency": "Professional" }],
  "awards": [{ "title": "", "issuer": "", "date": "" }],
  "projects": [{ "title": "", "description": "", "url": "" }],
  "custom": [{ "title": "", "bullets": [] }],
  "education": [{ "institution": "", "degree": "", "field": "", "startDate": "", "endDate": "", "gpa": "" }]
}`

const PROMPT_EXPERIENCE = `You are a resume parser. Extract ONLY the work experience from the resume and return ONLY valid JSON.

Rules:
- Copy ALL text verbatim — do not alter, summarize, shorten, or rewrite anything
- Copy every bullet point exactly as written, including punctuation and capitalization
- If no experience section exists, return { "experience": [] }

Return ONLY this JSON shape:
{
  "experience": [{ "company": "", "role": "", "location": "", "startDate": "", "endDate": "", "current": false, "bullets": [] }]
}`

function compressText(text) {
  return text
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .trim()
}

async function callGroq(systemPrompt, userText, maxTokens) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new GroqUnavailableError('GROQ_API_KEY is not set')

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  let response
  try {
    response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userText }
        ]
      }),
      signal: controller.signal
    })
  } catch (err) {
    if (err.name === 'AbortError') throw new GroqUnavailableError('Groq request timed out')
    throw new GroqUnavailableError(`Groq not reachable: ${err.message}`)
  } finally {
    clearTimeout(timer)
  }

  if (!response.ok) {
    const body = await response.text()
    throw new GroqUnavailableError(`Groq returned HTTP ${response.status}: ${body}`)
  }

  const data = await response.json()
  return JSON.parse(data.choices[0].message.content)
}

async function parseWithGroq(rawText) {
  const text = compressText(rawText)

  // Two parallel calls: one for all short sections, one for experience only
  const [sections, expResult] = await Promise.all([
    callGroq(PROMPT_SECTIONS, text, 3000),
    callGroq(PROMPT_EXPERIENCE, text, 6000)
  ])

  console.log('[groq pass1] keys:', Object.keys(sections))
  console.log('[groq pass1] certifications:', JSON.stringify(sections.certifications))
  console.log('[groq pass1] awards:', JSON.stringify(sections.awards))
  console.log('[groq pass1] custom:', JSON.stringify(sections.custom))
  console.log('[groq pass1] languages:', JSON.stringify(sections.languages))
  console.log('[groq pass2] experience entries:', expResult.experience?.length)

  return { ...sections, experience: expResult.experience ?? [] }
}

module.exports = { parseWithGroq, GroqUnavailableError }
