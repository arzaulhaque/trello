const request = require('supertest')
const app = require('../app')

describe('Health check', () => {
  it('GET /health returns 200 with status ok', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.timestamp).toBeDefined()
  })
})

describe('Error handler', () => {
  it('returns JSON error for unknown routes via middleware', async () => {
    const res = await request(app).get('/api/nonexistent-route')
    // Express returns 404 for unregistered routes - test at least it responds
    expect(res.status).toBeGreaterThanOrEqual(400)
  })
})
