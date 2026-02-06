import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { Role } from '@dental/database';
import app from '../app';
import { createTestTenant, createTestUser, cleanupTestData } from '../test/helpers';

describe('Labworks Routes - Permission Tests', () => {
  let testTenantId: string;
  let adminToken: string;
  let staffToken: string;
  let testLabworkId: string;

  beforeAll(async () => {
    // Create test tenant
    const tenant = await createTestTenant();
    testTenantId = tenant.id;

    // Create ADMIN user
    const admin = await createTestUser({
      tenantId: testTenantId,
      email: 'admin@labworks-test.com',
      role: Role.ADMIN,
    });
    adminToken = admin.token;

    // Create STAFF user
    const staff = await createTestUser({
      tenantId: testTenantId,
      email: 'staff@labworks-test.com',
      role: Role.STAFF,
    });
    staffToken = staff.token;

    // Create a labwork as ADMIN for testing
    const labworkData = {
      patientName: 'Test Patient',
      description: 'Test dental work',
      laboratory: 'Test Lab',
      status: 'PENDING',
      sentDate: new Date().toISOString(),
    };

    const response = await request(app)
      .post('/api/labworks')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(labworkData);

    testLabworkId = response.body.id;
  });

  afterAll(async () => {
    await cleanupTestData(testTenantId);
  });

  describe('POST /api/labworks (Create)', () => {
    it('should allow ADMIN to create labwork', async () => {
      const labworkData = {
        patientName: 'John Doe',
        description: 'Crown preparation',
        laboratory: 'Dental Lab Inc',
        status: 'PENDING',
        sentDate: new Date().toISOString(),
      };

      const response = await request(app)
        .post('/api/labworks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(labworkData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.patientName).toBe(labworkData.patientName);
    });

    it('should deny STAFF from creating labwork', async () => {
      const labworkData = {
        patientName: 'Jane Smith',
        description: 'Bridge work',
        laboratory: 'Lab Plus',
        status: 'PENDING',
        sentDate: new Date().toISOString(),
      };

      const response = await request(app)
        .post('/api/labworks')
        .set('Authorization', `Bearer ${staffToken}`)
        .send(labworkData);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/labworks/:id (Update)', () => {
    it('should allow ADMIN to update labwork', async () => {
      const updateData = {
        status: 'COMPLETED',
        receivedDate: new Date().toISOString(),
      };

      const response = await request(app)
        .put(`/api/labworks/${testLabworkId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('COMPLETED');
    });

    it('should deny STAFF from updating labwork', async () => {
      const updateData = {
        status: 'IN_PROGRESS',
      };

      const response = await request(app)
        .put(`/api/labworks/${testLabworkId}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send(updateData);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/labworks/:id (Delete)', () => {
    it('should deny STAFF from deleting labwork', async () => {
      const response = await request(app)
        .delete(`/api/labworks/${testLabworkId}`)
        .set('Authorization', `Bearer ${staffToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });

    it('should allow ADMIN to delete labwork', async () => {
      // Create a new labwork to delete
      const labworkData = {
        patientName: 'Delete Test',
        description: 'To be deleted',
        laboratory: 'Test Lab',
        status: 'PENDING',
        sentDate: new Date().toISOString(),
      };

      const createResponse = await request(app)
        .post('/api/labworks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(labworkData);

      const labworkId = createResponse.body.id;

      const deleteResponse = await request(app)
        .delete(`/api/labworks/${labworkId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteResponse.status).toBe(200);
    });
  });

  describe('GET /api/labworks (View)', () => {
    it('should allow STAFF to view labworks', async () => {
      const response = await request(app)
        .get('/api/labworks')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should allow ADMIN to view labworks', async () => {
      const response = await request(app)
        .get('/api/labworks')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
