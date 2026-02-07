import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { Permission } from '@dental/shared';
import { usePermissions } from './usePermissions';
import { useAuthStore } from '../stores/auth.store';

// Mock the auth store
vi.mock('../stores/auth.store', () => ({
  useAuthStore: vi.fn(),
}));

describe('usePermissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      (useAuthStore as any).mockReturnValue(null);
    });

    it('should return false for all permission checks', () => {
      const { result } = renderHook(() => usePermissions());

      expect(result.current.can(Permission.PATIENTS_VIEW)).toBe(false);
      expect(result.current.can(Permission.PATIENTS_CREATE)).toBe(false);
      expect(result.current.canAny([Permission.PATIENTS_VIEW, Permission.PATIENTS_CREATE])).toBe(false);
      expect(result.current.canAll([Permission.PATIENTS_VIEW, Permission.PATIENTS_CREATE])).toBe(false);
    });
  });

  describe('when user is STAFF', () => {
    beforeEach(() => {
      (useAuthStore as any).mockImplementation((selector: any) =>
        selector({ user: { role: 'STAFF' } })
      );
    });

    it('should return true for view permissions', () => {
      const { result } = renderHook(() => usePermissions());

      expect(result.current.can(Permission.PATIENTS_VIEW)).toBe(true);
      expect(result.current.can(Permission.APPOINTMENTS_VIEW)).toBe(true);
      expect(result.current.can(Permission.LABWORKS_VIEW)).toBe(true);
      expect(result.current.can(Permission.EXPENSES_VIEW)).toBe(true);
    });

    it('should return false for create/update/delete permissions', () => {
      const { result } = renderHook(() => usePermissions());

      expect(result.current.can(Permission.PATIENTS_CREATE)).toBe(false);
      expect(result.current.can(Permission.LABWORKS_CREATE)).toBe(false);
      expect(result.current.can(Permission.EXPENSES_CREATE)).toBe(false);
      expect(result.current.can(Permission.DENTAL_CHARTS_UPDATE)).toBe(false);
    });

    it('should correctly check canAny', () => {
      const { result } = renderHook(() => usePermissions());

      // At least one permission exists
      expect(
        result.current.canAny([Permission.PATIENTS_VIEW, Permission.PATIENTS_CREATE])
      ).toBe(true);

      // No permissions exist
      expect(
        result.current.canAny([Permission.PATIENTS_CREATE, Permission.PATIENTS_DELETE])
      ).toBe(false);
    });

    it('should correctly check canAll', () => {
      const { result } = renderHook(() => usePermissions());

      // All view permissions exist
      expect(
        result.current.canAll([Permission.PATIENTS_VIEW, Permission.APPOINTMENTS_VIEW])
      ).toBe(true);

      // Not all permissions exist
      expect(
        result.current.canAll([Permission.PATIENTS_VIEW, Permission.PATIENTS_CREATE])
      ).toBe(false);
    });
  });

  describe('when user is DOCTOR', () => {
    beforeEach(() => {
      (useAuthStore as any).mockImplementation((selector: any) =>
        selector({ user: { role: 'DOCTOR' } })
      );
    });

    it('should have all STAFF permissions plus dental chart update', () => {
      const { result } = renderHook(() => usePermissions());

      // View permissions
      expect(result.current.can(Permission.PATIENTS_VIEW)).toBe(true);
      expect(result.current.can(Permission.APPOINTMENTS_VIEW)).toBe(true);

      // Additional DOCTOR permissions
      expect(result.current.can(Permission.DENTAL_CHARTS_UPDATE)).toBe(true);
      expect(result.current.can(Permission.STATISTICS_VIEW)).toBe(true);

      // Still cannot create/delete resources
      expect(result.current.can(Permission.PATIENTS_CREATE)).toBe(false);
      expect(result.current.can(Permission.LABWORKS_CREATE)).toBe(false);
    });
  });

  describe('when user is ADMIN', () => {
    beforeEach(() => {
      (useAuthStore as any).mockImplementation((selector: any) =>
        selector({ user: { role: 'ADMIN' } })
      );
    });

    it('should have full CRUD on operational resources', () => {
      const { result } = renderHook(() => usePermissions());

      expect(result.current.can(Permission.PATIENTS_CREATE)).toBe(true);
      expect(result.current.can(Permission.PATIENTS_UPDATE)).toBe(true);
      expect(result.current.can(Permission.PATIENTS_DELETE)).toBe(true);

      expect(result.current.can(Permission.LABWORKS_CREATE)).toBe(true);
      expect(result.current.can(Permission.EXPENSES_CREATE)).toBe(true);
      expect(result.current.can(Permission.USERS_CREATE)).toBe(true);
    });

    it('should not have OWNER-exclusive permissions', () => {
      const { result } = renderHook(() => usePermissions());

      expect(result.current.can(Permission.USERS_PROMOTE_OWNER)).toBe(false);
      expect(result.current.can(Permission.TENANT_PROFILE_UPDATE)).toBe(false);
      expect(result.current.can(Permission.TENANT_DELETE)).toBe(false);
      expect(result.current.can(Permission.BILLING_VIEW)).toBe(false);
    });
  });

  describe('when user is OWNER', () => {
    beforeEach(() => {
      (useAuthStore as any).mockImplementation((selector: any) =>
        selector({ user: { role: 'OWNER' } })
      );
    });

    it('should have all ADMIN permissions', () => {
      const { result } = renderHook(() => usePermissions());

      expect(result.current.can(Permission.PATIENTS_CREATE)).toBe(true);
      expect(result.current.can(Permission.USERS_CREATE)).toBe(true);
      expect(result.current.can(Permission.SETTINGS_UPDATE)).toBe(true);
    });

    it('should have OWNER-exclusive permissions', () => {
      const { result } = renderHook(() => usePermissions());

      expect(result.current.can(Permission.USERS_PROMOTE_OWNER)).toBe(true);
      expect(result.current.can(Permission.TENANT_PROFILE_UPDATE)).toBe(true);
      expect(result.current.can(Permission.TENANT_DELETE)).toBe(true);
      expect(result.current.can(Permission.BILLING_VIEW)).toBe(true);
      expect(result.current.can(Permission.BILLING_MANAGE)).toBe(true);
    });
  });
});
