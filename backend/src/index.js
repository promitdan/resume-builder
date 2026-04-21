const express = require('express')
const cors = require('cors')
const uploadRouter = require('./routes/upload')
const exportRouter = require('./routes/export')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json({ limit: '10mb' }))

app.use('/api/upload', uploadRouter)
app.use('/api/export', exportRouter)
app.use('/api/agents', (req, res) => res.status(501).json({ error: 'Agents not yet implemented', code: 'NOT_IMPLEMENTED' }))

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

if (require.main === module) {
  app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`))
}

module.exports = app
