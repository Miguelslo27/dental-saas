import { describe, it, expect } from 'vitest'
import { env } from './env.js'

describe('env config', () => {
  it('should have default PORT of 3000', () => {
    expect(env.PORT).toBe(3000)
  })

  it('should have NODE_ENV set to test when running tests', () => {
    expect(env.NODE_ENV).toBe('test')
  })

  it('should have default CORS_ORIGIN of *', () => {
    expect(env.CORS_ORIGIN).toBe('*')
  })
})
