const fetch = require('node-fetch')

const OLLAMA_URL   = process.env.OLLAMA_URL   || 'http://localhost:11434'
const OLLAMA_MODEL = () => process.env.OLLAMA_MODEL || 'llama3'
const TIMEOUT_MS   = 120_000

class OllamaUnavailableError extends Error {
  constructor(msg) { super(msg); this.name = 'OllamaUnavailableError' }
}

const SYSTEM_PROMPT = `You are a resume parser. Extract structured data from the resume text and return ONLY valid JSON with this exact shape:
{
  "personal": { "name": "", "title": "", "email": "", "phone": "", "location": "", "linkedin": "", "website": "", "summary": "" },
  "experience": [{ "company": "", "role": "", "location": "", "startDate": "", "endDate": "", "current": false, "bullets": [] }],
  "education": [{ "institution": "", "degree": "", "field": "", "startDate": "", "endDate": "", "gpa": "" }],
  "skills": [{ "category": "", "items": [] }],
  "projects": [{ "title": "", "description": "", "url": "" }],
  "certifications": [{ "name": "", "issuer": "", "date": "" }],
  "languages": [{ "language": "", "proficiency": "Professional" }],
  "awards": [{ "title": "", "issuer": "", "date": "" }],
  "custom": [{ "title": "", "description": "" }]
}
Return empty arrays for sections not present. Do not add any keys not in the schema above.`

async function parseWithOllama(rawText) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  let response
  try {
    response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL(),
        format: 'json',
        stream: false,
        temperature: 0.1,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user',   content: rawText }
        ]
      }),
      signal: controller.signal
    })
  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.name === 'AbortError') {
      throw new OllamaUnavailableError(`Ollama not reachable: ${err.message}`)
    }
    throw err
  } finally {
    clearTimeout(timer)
  }

  if (!response.ok) {
    throw new OllamaUnavailableError(`Ollama returned HTTP ${response.status}`)
  }

  const data = await response.json()
  const content = JSON.parse(data.message.content)
  return content
}

module.exports = { parseWithOllama, OllamaUnavailableError }
