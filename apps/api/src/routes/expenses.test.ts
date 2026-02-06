import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { Role } from '@dental/database';
import app from '../app';
import { createTestTenant, createTestUser, cleanupTestData } from '../test/helpers';

describe('Expenses Routes - Permission Tests', () => {
  let testTenantId: string;
  let adminToken: string;
  let staffToken: string;
  let testExpenseId: string;

  beforeAll(async () => {
    // Create test tenant
    const tenant = await createTestTenant();
    testTenantId = tenant.id;

    // Create ADMIN user
    const admin = await createTestUser({
      tenantId: testTenantId,
      email: 'admin@expenses-test.com',
      role: Role.ADMIN,
    });
    adminToken = admin.token;

    // Create STAFF user
    const staff = await createTestUser({
      tenantId: testTenantId,
      email: 'staff@expenses-test.com',
      role: Role.STAFF,
    });
    staffToken = staff.token;

    // Create an expense as ADMIN for testing
    const expenseData = {
      description: 'Test Expense',
      amount: 150.00,
      category: 'SUPPLIES',
      date: new Date().toISOString(),
    };

    const response = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(expenseData);

    testExpenseId = response.body.id;
  });

  afterAll(async () => {
    await cleanupTestData(testTenantId);
  });

  describe('POST /api/expenses (Create)', () => {
    it('should allow ADMIN to create expense', async () => {
      const expenseData = {
        description: 'Office supplies',
        amount: 250.50,
        category: 'SUPPLIES',
        date: new Date().toISOString(),
      };

      const response = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(expenseData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.description).toBe(expenseData.description);
      expect(response.body.amount).toBe(expenseData.amount);
    });

    it('should deny STAFF from creating expense', async () => {
      const expenseData = {
        description: 'Unauthorized expense',
        amount: 100.00,
        category: 'SUPPLIES',
        date: new Date().toISOString(),
      };

      const response = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${staffToken}`)
        .send(expenseData);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/expenses/:id (Update)', () => {
    it('should allow ADMIN to update expense', async () => {
      const updateData = {
        amount: 175.00,
        description: 'Updated expense description',
      };

      const response = await request(app)
        .put(`/api/expenses/${testExpenseId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.amount).toBe(175.00);
      expect(response.body.description).toBe(updateData.description);
    });

    it('should deny STAFF from updating expense', async () => {
      const updateData = {
        amount: 200.00,
      };

      const response = await request(app)
        .put(`/api/expenses/${testExpenseId}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send(updateData);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/expenses/:id (Delete)', () => {
    it('should deny STAFF from deleting expense', async () => {
      const response = await request(app)
        .delete(`/api/expenses/${testExpenseId}`)
        .set('Authorization', `Bearer ${staffToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });

    it('should allow ADMIN to delete expense', async () => {
      // Create a new expense to delete
      const expenseData = {
        description: 'Expense to delete',
        amount: 50.00,
        category: 'OTHER',
        date: new Date().toISOString(),
      };

      const createResponse = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(expenseData);

      const expenseId = createResponse.body.id;

      const deleteResponse = await request(app)
        .delete(`/api/expenses/${expenseId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteResponse.status).toBe(200);
    });
  });

  describe('GET /api/expenses (View)', () => {
    it('should allow STAFF to view expenses', async () => {
      const response = await request(app)
        .get('/api/expenses')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should allow ADMIN to view expenses', async () => {
      const response = await request(app)
        .get('/api/expenses')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
