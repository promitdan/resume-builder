jest.mock('node-fetch')
const fetch = require('node-fetch')
const { Response } = jest.requireActual('node-fetch')
const { parseWithOllama, OllamaUnavailableError } = require('../services/parser/ollamaParser')

const MOCK_CONTENT = {
  personal: { name: 'Jane Doe', email: 'jane@example.com', phone: '', title: '', location: '', linkedin: '', website: '', summary: '' },
  experience: [], education: [], skills: [], projects: [], certifications: [], languages: [], awards: [], custom: []
}

describe('parseWithOllama', () => {
  beforeEach(() => jest.clearAllMocks())

  test('returns parsed content on successful Ollama response', async () => {
    fetch.mockResolvedValueOnce(new Response(JSON.stringify({
      message: { content: JSON.stringify(MOCK_CONTENT) }
    }), { status: 200 }))

    const result = await parseWithOllama('Jane Doe\njane@example.com')
    expect(result.personal.name).toBe('Jane Doe')
    expect(result.personal.email).toBe('jane@example.com')
  })

  test('throws OllamaUnavailableError when connection refused', async () => {
    const err = new Error('connect ECONNREFUSED')
    err.code = 'ECONNREFUSED'
    fetch.mockRejectedValueOnce(err)

    await expect(parseWithOllama('some text')).rejects.toBeInstanceOf(OllamaUnavailableError)
  })

  test('throws OllamaUnavailableError on non-200 response', async () => {
    fetch.mockResolvedValueOnce(new Response('Internal Server Error', { status: 500 }))

    await expect(parseWithOllama('some text')).rejects.toBeInstanceOf(OllamaUnavailableError)
  })

  test('throws Error when response JSON is malformed', async () => {
    fetch.mockResolvedValueOnce(new Response(JSON.stringify({
      message: { content: 'not valid json {{{' }
    }), { status: 200 }))

    await expect(parseWithOllama('some text')).rejects.toThrow()
  })

  test('uses OLLAMA_MODEL env var when set', async () => {
    process.env.OLLAMA_MODEL = 'mistral'
    fetch.mockResolvedValueOnce(new Response(JSON.stringify({
      message: { content: JSON.stringify(MOCK_CONTENT) }
    }), { status: 200 }))

    await parseWithOllama('some text')
    const body = JSON.parse(fetch.mock.calls[0][1].body)
    expect(body.model).toBe('mistral')
    delete process.env.OLLAMA_MODEL
  })
})
