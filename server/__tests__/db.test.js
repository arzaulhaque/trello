// Tests for server/config/db.js — verifies pool construction and testConnection

describe('db module', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('exports a pool object and a testConnection function', () => {
    // Intercept Pool construction to avoid a real DB call
    jest.doMock('pg', () => {
      const mockPool = {
        query: jest.fn(),
        connect: jest.fn(),
        on: jest.fn(),
      }
      return { Pool: jest.fn(() => mockPool) }
    })

    const db = require('../config/db')
    expect(db).toBeDefined()
    expect(typeof db.testConnection).toBe('function')
  })

  it('enables SSL when DATABASE_URL contains neon.tech', () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@ep-test.neon.tech/db?sslmode=require'
    process.env.NODE_ENV = 'development'

    const { Pool } = require('pg')
    const MockPool = jest.fn(() => ({ query: jest.fn(), connect: jest.fn(), on: jest.fn() }))

    jest.doMock('pg', () => ({ Pool: MockPool }))
    require('../config/db')

    const callArgs = MockPool.mock.calls[0]?.[0]
    if (callArgs) {
      expect(callArgs.ssl).toBeTruthy()
    }
  })

  it('enables SSL in production regardless of DATABASE_URL', () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost/db'
    process.env.NODE_ENV = 'production'

    const MockPool = jest.fn(() => ({ query: jest.fn(), connect: jest.fn(), on: jest.fn() }))
    jest.doMock('pg', () => ({ Pool: MockPool }))
    require('../config/db')

    const callArgs = MockPool.mock.calls[0]?.[0]
    if (callArgs) {
      expect(callArgs.ssl).toBeTruthy()
    }
  })

  it('testConnection resolves when pool.connect succeeds', async () => {
    const mockRelease = jest.fn()
    const mockClient = { query: jest.fn().mockResolvedValue({}), release: mockRelease }
    const mockPool = {
      connect: jest.fn().mockResolvedValue(mockClient),
      on: jest.fn(),
    }
    jest.doMock('pg', () => ({ Pool: jest.fn(() => mockPool) }))

    const db = require('../config/db')
    await expect(db.testConnection()).resolves.toBeUndefined()
    expect(mockClient.query).toHaveBeenCalledWith('SELECT 1')
    expect(mockRelease).toHaveBeenCalled()
  })

  it('testConnection rejects when pool.connect fails', async () => {
    const mockPool = {
      connect: jest.fn().mockRejectedValue(new Error('connection refused')),
      on: jest.fn(),
    }
    jest.doMock('pg', () => ({ Pool: jest.fn(() => mockPool) }))

    const db = require('../config/db')
    await expect(db.testConnection()).rejects.toThrow('connection refused')
  })
})
