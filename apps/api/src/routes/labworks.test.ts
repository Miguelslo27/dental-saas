import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { app } from '../app.js'
import { prisma } from '@dental/database'
import { hashPassword } from '../services/auth.service.js'
import { sign } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret'

describe('Labworks Routes - Permission Tests', () => {
  let tenantId: string
  let adminToken: string
  let staffToken: string
  let testLabworkId: string
  const testSlug = `test-labworks-${Date.now()}`

  // Helper to generate JWT token
  function generateToken(userId: string, tenantId: string, role: string) {
    return sign(
      { sub: userId, tenantId, role },
      JWT_SECRET,
      { expiresIn: '1h' }
    )
  }

  beforeAll(async () => {
    // Create test tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Test Clinic for Labworks',
        slug: testSlug,
        currency: 'USD',
        timezone: 'America/New_York',
      },
    })
    tenantId = tenant.id

    // Get or create free plan
    let freePlan = await prisma.plan.findUnique({ where: { name: 'free' } })
    if (!freePlan) {
      freePlan = await prisma.plan.create({
        data: {
          name: 'free',
          displayName: 'Free',
          price: 0,
          maxAdmins: 1,
          maxDoctors: 3,
          maxPatients: 15,
        },
      })
    }

    // Create subscription
    await prisma.subscription.create({
      data: {
        tenantId: tenant.id,
        planId: freePlan.id,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })

    // Create ADMIN user
    const hashedPassword = await hashPassword('password123')
    const adminUser = await prisma.user.create({
      data: {
        tenantId,
        email: 'admin@labworks-test.com',
        name: 'Admin User',
        passwordHash: hashedPassword,
        role: 'ADMIN',
      },
    })
    adminToken = generateToken(adminUser.id, tenantId, 'ADMIN')

    // Create STAFF user
    const staffUser = await prisma.user.create({
      data: {
        tenantId,
        email: 'staff@labworks-test.com',
        name: 'Staff User',
        passwordHash: hashedPassword,
        role: 'STAFF',
      },
    })
    staffToken = generateToken(staffUser.id, tenantId, 'STAFF')

    // Create a labwork as ADMIN for testing
    const labworkData = {
      patientName: 'Test Patient',
      description: 'Test dental work',
      laboratory: 'Test Lab',
      status: 'PENDING',
      sentDate: new Date().toISOString(),
    }

    const response = await request(app)
      .post('/api/labworks')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(labworkData)

    testLabworkId = response.body.id
  })

  afterAll(async () => {
    // Clean up test data
    await prisma.labwork.deleteMany({ where: { tenantId } })
    await prisma.user.deleteMany({ where: { tenantId } })
    await prisma.subscription.deleteMany({ where: { tenantId } })
    await prisma.tenant.delete({ where: { id: tenantId } })
  })

  describe('POST /api/labworks (Create)', () => {
    it('should allow ADMIN to create labwork', async () => {
      const labworkData = {
        patientName: 'John Doe',
        description: 'Crown preparation',
        laboratory: 'Dental Lab Inc',
        status: 'PENDING',
        sentDate: new Date().toISOString(),
      }

      const response = await request(app)
        .post('/api/labworks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(labworkData)

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('id')
      expect(response.body.patientName).toBe(labworkData.patientName)
    })

    it('should deny STAFF from creating labwork', async () => {
      const labworkData = {
        patientName: 'Jane Smith',
        description: 'Bridge work',
        laboratory: 'Lab Plus',
        status: 'PENDING',
        sentDate: new Date().toISOString(),
      }

      const response = await request(app)
        .post('/api/labworks')
        .set('Authorization', `Bearer ${staffToken}`)
        .send(labworkData)

      expect(response.status).toBe(403)
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('PUT /api/labworks/:id (Update)', () => {
    it('should allow ADMIN to update labwork', async () => {
      const updateData = {
        status: 'COMPLETED',
        receivedDate: new Date().toISOString(),
      }

      const response = await request(app)
        .put(`/api/labworks/${testLabworkId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('COMPLETED')
    })

    it('should deny STAFF from updating labwork', async () => {
      const updateData = {
        status: 'IN_PROGRESS',
      }

      const response = await request(app)
        .put(`/api/labworks/${testLabworkId}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send(updateData)

      expect(response.status).toBe(403)
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('DELETE /api/labworks/:id (Delete)', () => {
    it('should deny STAFF from deleting labwork', async () => {
      const response = await request(app)
        .delete(`/api/labworks/${testLabworkId}`)
        .set('Authorization', `Bearer ${staffToken}`)

      expect(response.status).toBe(403)
      expect(response.body).toHaveProperty('error')
    })

    it('should allow ADMIN to delete labwork', async () => {
      // Create a new labwork to delete
      const labworkData = {
        patientName: 'Delete Test',
        description: 'To be deleted',
        laboratory: 'Test Lab',
        status: 'PENDING',
        sentDate: new Date().toISOString(),
      }

      const createResponse = await request(app)
        .post('/api/labworks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(labworkData)

      const labworkId = createResponse.body.id

      const deleteResponse = await request(app)
        .delete(`/api/labworks/${labworkId}`)
        .set('Authorization', `Bearer ${adminToken}`)

      expect(deleteResponse.status).toBe(200)
    })
  })

  describe('GET /api/labworks (View)', () => {
    it('should allow STAFF to view labworks', async () => {
      const response = await request(app)
        .get('/api/labworks')
        .set('Authorization', `Bearer ${staffToken}`)

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
    })

    it('should allow ADMIN to view labworks', async () => {
      const response = await request(app)
        .get('/api/labworks')
        .set('Authorization', `Bearer ${adminToken}`)

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
    })
  })
})
