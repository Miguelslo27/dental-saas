import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import {
  UserRole,
  Permission,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from '@dental/shared';
import {
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
} from './permissions.js';

describe('Permissions System', () => {
  describe('ROLE_PERMISSIONS mapping', () => {
    it('should grant STAFF only view permissions', () => {
      const staffPermissions = ROLE_PERMISSIONS.STAFF;

      // Should have view permissions
      expect(staffPermissions).toContain(Permission.PATIENTS_VIEW);
      expect(staffPermissions).toContain(Permission.APPOINTMENTS_VIEW);
      expect(staffPermissions).toContain(Permission.DOCTORS_VIEW);
      expect(staffPermissions).toContain(Permission.LABWORKS_VIEW);
      expect(staffPermissions).toContain(Permission.EXPENSES_VIEW);

      // Should NOT have create/update/delete permissions
      expect(staffPermissions).not.toContain(Permission.PATIENTS_CREATE);
      expect(staffPermissions).not.toContain(Permission.LABWORKS_CREATE);
      expect(staffPermissions).not.toContain(Permission.EXPENSES_CREATE);
      expect(staffPermissions).not.toContain(Permission.DENTAL_CHARTS_UPDATE);
    });

    it('should grant DOCTOR STAFF permissions plus dental chart editing and statistics', () => {
      const doctorPermissions = ROLE_PERMISSIONS.DOCTOR;

      // Should have all STAFF view permissions
      expect(doctorPermissions).toContain(Permission.PATIENTS_VIEW);
      expect(doctorPermissions).toContain(Permission.APPOINTMENTS_VIEW);

      // Should have additional permissions
      expect(doctorPermissions).toContain(Permission.DENTAL_CHARTS_UPDATE);
      expect(doctorPermissions).toContain(Permission.STATISTICS_VIEW);

      // Should NOT have CRUD permissions on resources
      expect(doctorPermissions).not.toContain(Permission.PATIENTS_CREATE);
      expect(doctorPermissions).not.toContain(Permission.LABWORKS_CREATE);
      expect(doctorPermissions).not.toContain(Permission.EXPENSES_CREATE);
    });

    it('should grant CLINIC_ADMIN operational CRUD but not user management or settings updates', () => {
      const clinicAdminPermissions = ROLE_PERMISSIONS.CLINIC_ADMIN;

      // Should have full CRUD on operational resources
      expect(clinicAdminPermissions).toContain(Permission.PATIENTS_CREATE);
      expect(clinicAdminPermissions).toContain(Permission.PATIENTS_UPDATE);
      expect(clinicAdminPermissions).toContain(Permission.PATIENTS_DELETE);
      expect(clinicAdminPermissions).toContain(Permission.APPOINTMENTS_CREATE);
      expect(clinicAdminPermissions).toContain(Permission.DOCTORS_CREATE);
      expect(clinicAdminPermissions).toContain(Permission.LABWORKS_CREATE);
      expect(clinicAdminPermissions).toContain(Permission.EXPENSES_CREATE);

      // Should have dental chart + statistics + attachments
      expect(clinicAdminPermissions).toContain(Permission.DENTAL_CHARTS_VIEW);
      expect(clinicAdminPermissions).toContain(Permission.DENTAL_CHARTS_UPDATE);
      expect(clinicAdminPermissions).toContain(Permission.STATISTICS_VIEW);
      expect(clinicAdminPermissions).toContain(Permission.ATTACHMENTS_VIEW);
      expect(clinicAdminPermissions).toContain(Permission.ATTACHMENTS_UPLOAD);
      expect(clinicAdminPermissions).toContain(Permission.ATTACHMENTS_DELETE);

      // Should have view-only for users and settings
      expect(clinicAdminPermissions).toContain(Permission.USERS_VIEW);
      expect(clinicAdminPermissions).toContain(Permission.SETTINGS_VIEW);

      // Should NOT have user management, settings update, data export, or owner-exclusive permissions
      expect(clinicAdminPermissions).not.toContain(Permission.USERS_CREATE);
      expect(clinicAdminPermissions).not.toContain(Permission.USERS_UPDATE);
      expect(clinicAdminPermissions).not.toContain(Permission.USERS_DELETE);
      expect(clinicAdminPermissions).not.toContain(Permission.SETTINGS_UPDATE);
      expect(clinicAdminPermissions).not.toContain(Permission.DATA_EXPORT);
      expect(clinicAdminPermissions).not.toContain(Permission.USERS_PROMOTE_OWNER);
      expect(clinicAdminPermissions).not.toContain(Permission.TENANT_PROFILE_UPDATE);
      expect(clinicAdminPermissions).not.toContain(Permission.TENANT_DELETE);
      expect(clinicAdminPermissions).not.toContain(Permission.BILLING_VIEW);
      expect(clinicAdminPermissions).not.toContain(Permission.BILLING_MANAGE);
    });

    it('should grant ADMIN full operational control', () => {
      const adminPermissions = ROLE_PERMISSIONS.ADMIN;

      // Should have full CRUD on operational resources
      expect(adminPermissions).toContain(Permission.PATIENTS_CREATE);
      expect(adminPermissions).toContain(Permission.PATIENTS_UPDATE);
      expect(adminPermissions).toContain(Permission.PATIENTS_DELETE);

      expect(adminPermissions).toContain(Permission.APPOINTMENTS_CREATE);
      expect(adminPermissions).toContain(Permission.LABWORKS_CREATE);
      expect(adminPermissions).toContain(Permission.EXPENSES_CREATE);

      expect(adminPermissions).toContain(Permission.USERS_CREATE);
      expect(adminPermissions).toContain(Permission.SETTINGS_UPDATE);
      expect(adminPermissions).toContain(Permission.DATA_EXPORT);

      // Should NOT have OWNER-exclusive permissions
      expect(adminPermissions).not.toContain(Permission.USERS_PROMOTE_OWNER);
      expect(adminPermissions).not.toContain(Permission.TENANT_PROFILE_UPDATE);
      expect(adminPermissions).not.toContain(Permission.TENANT_DELETE);
      expect(adminPermissions).not.toContain(Permission.BILLING_VIEW);
    });

    it('should grant OWNER complete access including exclusive permissions', () => {
      const ownerPermissions = ROLE_PERMISSIONS.OWNER;

      // Should have all ADMIN permissions
      expect(ownerPermissions).toContain(Permission.PATIENTS_CREATE);
      expect(ownerPermissions).toContain(Permission.USERS_CREATE);
      expect(ownerPermissions).toContain(Permission.SETTINGS_UPDATE);

      // Should have OWNER-exclusive permissions
      expect(ownerPermissions).toContain(Permission.USERS_PROMOTE_OWNER);
      expect(ownerPermissions).toContain(Permission.TENANT_PROFILE_UPDATE);
      expect(ownerPermissions).toContain(Permission.TENANT_DELETE);
      expect(ownerPermissions).toContain(Permission.BILLING_VIEW);
      expect(ownerPermissions).toContain(Permission.BILLING_MANAGE);
    });
  });

  describe('hasPermission()', () => {
    it('should return true when role has permission', () => {
      expect(hasPermission(UserRole.ADMIN, Permission.PATIENTS_CREATE)).toBe(true);
      expect(hasPermission(UserRole.OWNER, Permission.TENANT_DELETE)).toBe(true);
      expect(hasPermission(UserRole.DOCTOR, Permission.DENTAL_CHARTS_UPDATE)).toBe(true);
    });

    it('should return false when role does not have permission', () => {
      expect(hasPermission(UserRole.STAFF, Permission.PATIENTS_CREATE)).toBe(false);
      expect(hasPermission(UserRole.DOCTOR, Permission.EXPENSES_CREATE)).toBe(false);
      expect(hasPermission(UserRole.ADMIN, Permission.TENANT_DELETE)).toBe(false);
    });

    it('should correctly handle STAFF read-only permissions', () => {
      expect(hasPermission(UserRole.STAFF, Permission.LABWORKS_VIEW)).toBe(true);
      expect(hasPermission(UserRole.STAFF, Permission.LABWORKS_CREATE)).toBe(false);
      expect(hasPermission(UserRole.STAFF, Permission.EXPENSES_VIEW)).toBe(true);
      expect(hasPermission(UserRole.STAFF, Permission.EXPENSES_CREATE)).toBe(false);
    });
  });

  describe('hasAnyPermission()', () => {
    it('should return true if role has at least one permission', () => {
      const permissions = [Permission.PATIENTS_CREATE, Permission.PATIENTS_UPDATE];
      expect(hasAnyPermission(UserRole.ADMIN, permissions)).toBe(true);
    });

    it('should return false if role has none of the permissions', () => {
      const permissions = [Permission.PATIENTS_CREATE, Permission.PATIENTS_DELETE];
      expect(hasAnyPermission(UserRole.STAFF, permissions)).toBe(false);
    });

    it('should return true if role has any permission in the list', () => {
      const permissions = [
        Permission.PATIENTS_CREATE, // STAFF doesn't have
        Permission.PATIENTS_VIEW,   // STAFF has this
      ];
      expect(hasAnyPermission(UserRole.STAFF, permissions)).toBe(true);
    });
  });

  describe('hasAllPermissions()', () => {
    it('should return true if role has all permissions', () => {
      const permissions = [Permission.PATIENTS_CREATE, Permission.PATIENTS_UPDATE];
      expect(hasAllPermissions(UserRole.ADMIN, permissions)).toBe(true);
    });

    it('should return false if role is missing any permission', () => {
      const permissions = [
        Permission.PATIENTS_VIEW,   // STAFF has this
        Permission.PATIENTS_CREATE, // STAFF doesn't have this
      ];
      expect(hasAllPermissions(UserRole.STAFF, permissions)).toBe(false);
    });

    it('should return true for empty permission list', () => {
      expect(hasAllPermissions(UserRole.STAFF, [])).toBe(true);
    });
  });

  describe('requirePermission middleware', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
      mockReq = {
        user: undefined,
      };
      mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };
      mockNext = vi.fn();
    });

    it('should return 401 if no user is authenticated', () => {
      const middleware = requirePermission(Permission.PATIENTS_VIEW);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Authentication required' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 if user does not have required permission', () => {
      mockReq.user = { role: UserRole.STAFF } as any;
      const middleware = requirePermission(Permission.PATIENTS_CREATE);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Insufficient permissions',
        required: Permission.PATIENTS_CREATE,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next() if user has required permission', () => {
      mockReq.user = { role: UserRole.ADMIN } as any;
      const middleware = requirePermission(Permission.PATIENTS_CREATE);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should allow OWNER to perform OWNER-exclusive operations', () => {
      mockReq.user = { role: UserRole.OWNER } as any;
      const middleware = requirePermission(Permission.TENANT_DELETE);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny ADMIN from OWNER-exclusive operations', () => {
      mockReq.user = { role: UserRole.ADMIN } as any;
      const middleware = requirePermission(Permission.TENANT_DELETE);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireAnyPermission middleware', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
      mockReq = {
        user: undefined,
      };
      mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };
      mockNext = vi.fn();
    });

    it('should return 401 if no user is authenticated', () => {
      const permissions = [Permission.PATIENTS_VIEW, Permission.PATIENTS_CREATE];
      const middleware = requireAnyPermission(permissions);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 if user has none of the required permissions', () => {
      mockReq.user = { role: UserRole.STAFF } as any;
      const permissions = [Permission.PATIENTS_CREATE, Permission.PATIENTS_DELETE];
      const middleware = requireAnyPermission(permissions);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next() if user has at least one required permission', () => {
      mockReq.user = { role: UserRole.STAFF } as any;
      const permissions = [Permission.PATIENTS_CREATE, Permission.PATIENTS_VIEW];
      const middleware = requireAnyPermission(permissions);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });

  describe('requireAllPermissions middleware', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
      mockReq = {
        user: undefined,
      };
      mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };
      mockNext = vi.fn();
    });

    it('should return 401 if no user is authenticated', () => {
      const permissions = [Permission.PATIENTS_VIEW, Permission.PATIENTS_CREATE];
      const middleware = requireAllPermissions(permissions);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 if user is missing any required permission', () => {
      mockReq.user = { role: UserRole.STAFF } as any;
      const permissions = [Permission.PATIENTS_VIEW, Permission.PATIENTS_CREATE];
      const middleware = requireAllPermissions(permissions);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next() if user has all required permissions', () => {
      mockReq.user = { role: UserRole.ADMIN } as any;
      const permissions = [Permission.PATIENTS_VIEW, Permission.PATIENTS_CREATE];
      const middleware = requireAllPermissions(permissions);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });

  describe('Permission hierarchy validation', () => {
    it('should verify STAFF cannot create/edit/delete labworks', () => {
      expect(hasPermission(UserRole.STAFF, Permission.LABWORKS_CREATE)).toBe(false);
      expect(hasPermission(UserRole.STAFF, Permission.LABWORKS_UPDATE)).toBe(false);
      expect(hasPermission(UserRole.STAFF, Permission.LABWORKS_DELETE)).toBe(false);
    });

    it('should verify STAFF cannot create/edit/delete expenses', () => {
      expect(hasPermission(UserRole.STAFF, Permission.EXPENSES_CREATE)).toBe(false);
      expect(hasPermission(UserRole.STAFF, Permission.EXPENSES_UPDATE)).toBe(false);
      expect(hasPermission(UserRole.STAFF, Permission.EXPENSES_DELETE)).toBe(false);
    });

    it('should verify ADMIN can create/edit/delete labworks', () => {
      expect(hasPermission(UserRole.ADMIN, Permission.LABWORKS_CREATE)).toBe(true);
      expect(hasPermission(UserRole.ADMIN, Permission.LABWORKS_UPDATE)).toBe(true);
      expect(hasPermission(UserRole.ADMIN, Permission.LABWORKS_DELETE)).toBe(true);
    });

    it('should verify ADMIN can create/edit/delete expenses', () => {
      expect(hasPermission(UserRole.ADMIN, Permission.EXPENSES_CREATE)).toBe(true);
      expect(hasPermission(UserRole.ADMIN, Permission.EXPENSES_UPDATE)).toBe(true);
      expect(hasPermission(UserRole.ADMIN, Permission.EXPENSES_DELETE)).toBe(true);
    });

    it('should verify CLINIC_ADMIN can manage operational resources', () => {
      expect(hasPermission(UserRole.CLINIC_ADMIN, Permission.PATIENTS_CREATE)).toBe(true);
      expect(hasPermission(UserRole.CLINIC_ADMIN, Permission.APPOINTMENTS_CREATE)).toBe(true);
      expect(hasPermission(UserRole.CLINIC_ADMIN, Permission.DOCTORS_CREATE)).toBe(true);
      expect(hasPermission(UserRole.CLINIC_ADMIN, Permission.LABWORKS_CREATE)).toBe(true);
      expect(hasPermission(UserRole.CLINIC_ADMIN, Permission.EXPENSES_CREATE)).toBe(true);
    });

    it('should verify CLINIC_ADMIN cannot manage users or update settings', () => {
      expect(hasPermission(UserRole.CLINIC_ADMIN, Permission.USERS_CREATE)).toBe(false);
      expect(hasPermission(UserRole.CLINIC_ADMIN, Permission.USERS_UPDATE)).toBe(false);
      expect(hasPermission(UserRole.CLINIC_ADMIN, Permission.USERS_DELETE)).toBe(false);
      expect(hasPermission(UserRole.CLINIC_ADMIN, Permission.SETTINGS_UPDATE)).toBe(false);
      expect(hasPermission(UserRole.CLINIC_ADMIN, Permission.DATA_EXPORT)).toBe(false);
    });

    it('should verify only OWNER can update tenant profile', () => {
      expect(hasPermission(UserRole.STAFF, Permission.TENANT_PROFILE_UPDATE)).toBe(false);
      expect(hasPermission(UserRole.DOCTOR, Permission.TENANT_PROFILE_UPDATE)).toBe(false);
      expect(hasPermission(UserRole.CLINIC_ADMIN, Permission.TENANT_PROFILE_UPDATE)).toBe(false);
      expect(hasPermission(UserRole.ADMIN, Permission.TENANT_PROFILE_UPDATE)).toBe(false);
      expect(hasPermission(UserRole.OWNER, Permission.TENANT_PROFILE_UPDATE)).toBe(true);
    });

    it('should verify only OWNER can promote users to OWNER', () => {
      expect(hasPermission(UserRole.STAFF, Permission.USERS_PROMOTE_OWNER)).toBe(false);
      expect(hasPermission(UserRole.DOCTOR, Permission.USERS_PROMOTE_OWNER)).toBe(false);
      expect(hasPermission(UserRole.CLINIC_ADMIN, Permission.USERS_PROMOTE_OWNER)).toBe(false);
      expect(hasPermission(UserRole.ADMIN, Permission.USERS_PROMOTE_OWNER)).toBe(false);
      expect(hasPermission(UserRole.OWNER, Permission.USERS_PROMOTE_OWNER)).toBe(true);
    });
  });
});
