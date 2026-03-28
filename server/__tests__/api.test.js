const request = require('supertest')

// Mock the database pool so tests don't need a real Postgres instance
jest.mock('../config/db', () => {
  const mockPool = {
    query: jest.fn(),
    connect: jest.fn(),
    on: jest.fn(),
  }
  return mockPool
})

const pool = require('../config/db')
const app = require('../app')

beforeEach(() => {
  jest.clearAllMocks()
})

describe('Board routes', () => {
  it('POST /api/boards returns 400 when title missing', async () => {
    const res = await request(app).post('/api/boards').send({})
    expect(res.status).toBe(400)
    expect(res.body.error.message).toMatch(/title/i)
  })

  it('POST /api/boards creates a board', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, title: 'Test Board', background_color: '#0052cc', created_at: new Date() }],
    })
    const res = await request(app)
      .post('/api/boards')
      .send({ title: 'Test Board' })
    expect(res.status).toBe(201)
    expect(res.body.title).toBe('Test Board')
  })

  it('GET /api/boards/:id returns 404 for missing board', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] })
    const res = await request(app).get('/api/boards/9999')
    expect(res.status).toBe(404)
    expect(res.body.error.message).toMatch(/not found/i)
  })
})

describe('List routes', () => {
  it('POST /api/lists returns 400 when board_id missing', async () => {
    const res = await request(app).post('/api/lists').send({ title: 'My List' })
    expect(res.status).toBe(400)
  })

  it('POST /api/lists creates a list', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ next_pos: 0 }] })
      .mockResolvedValueOnce({ rows: [{ id: 1, board_id: 1, title: 'To Do', position: 0 }] })
    const res = await request(app)
      .post('/api/lists')
      .send({ board_id: 1, title: 'To Do' })
    expect(res.status).toBe(201)
    expect(res.body.title).toBe('To Do')
  })
})

describe('Card routes', () => {
  it('POST /api/cards returns 400 when list_id missing', async () => {
    const res = await request(app).post('/api/cards').send({ title: 'My Card' })
    expect(res.status).toBe(400)
  })

  it('GET /api/cards/search returns 400 when no query', async () => {
    const res = await request(app).get('/api/cards/search')
    expect(res.status).toBe(400)
  })

  it('GET /api/cards/search returns results', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, title: 'My Card', list_title: 'To Do', board_title: 'Board' }],
    })
    const res = await request(app).get('/api/cards/search?query=My')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('POST /api/cards creates a card', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ next_pos: 0 }] })
      .mockResolvedValueOnce({ rows: [{ id: 5, list_id: 1, title: 'New Card', position: 0 }] })
    const res = await request(app)
      .post('/api/cards')
      .send({ list_id: 1, title: 'New Card' })
    expect(res.status).toBe(201)
    expect(res.body.title).toBe('New Card')
  })
})
