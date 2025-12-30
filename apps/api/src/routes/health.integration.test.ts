import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../app.js'

describe('Health endpoint', () => {
  it('GET /api/health should return 200 with status ok', async () => {
    const response = await request(app).get('/api/health')

    expect(response.status).toBe(200)
    expect(response.body.status).toBe('ok')
    expect(response.body.timestamp).toBeDefined()
    expect(response.body.uptime).toBeDefined()
  })
})

describe('404 handler', () => {
  it('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/api/unknown-route')

    expect(response.status).toBe(404)
    expect(response.body.success).toBe(false)
    expect(response.body.error.code).toBe('NOT_FOUND')
  })
})
