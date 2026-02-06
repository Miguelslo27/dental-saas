import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Permission } from '@dental/shared';
import { Can } from './Can';
import { usePermissions } from '../../hooks/usePermissions';

// Mock the usePermissions hook
vi.mock('../../hooks/usePermissions', () => ({
  usePermissions: vi.fn(),
}));

describe('Can component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('single permission check', () => {
    it('should render children when user has permission', () => {
      (usePermissions as any).mockReturnValue({
        can: (permission: Permission) => permission === Permission.PATIENTS_CREATE,
        canAny: vi.fn(),
        canAll: vi.fn(),
      });

      render(
        <Can permission={Permission.PATIENTS_CREATE}>
          <button>Create Patient</button>
        </Can>
      );

      expect(screen.getByText('Create Patient')).toBeInTheDocument();
    });

    it('should not render children when user lacks permission', () => {
      (usePermissions as any).mockReturnValue({
        can: () => false,
        canAny: vi.fn(),
        canAll: vi.fn(),
      });

      render(
        <Can permission={Permission.PATIENTS_CREATE}>
          <button>Create Patient</button>
        </Can>
      );

      expect(screen.queryByText('Create Patient')).not.toBeInTheDocument();
    });

    it('should render fallback when user lacks permission', () => {
      (usePermissions as any).mockReturnValue({
        can: () => false,
        canAny: vi.fn(),
        canAll: vi.fn(),
      });

      render(
        <Can
          permission={Permission.PATIENTS_CREATE}
          fallback={<span>No permission</span>}
        >
          <button>Create Patient</button>
        </Can>
      );

      expect(screen.queryByText('Create Patient')).not.toBeInTheDocument();
      expect(screen.getByText('No permission')).toBeInTheDocument();
    });
  });

  describe('multiple permissions with requireAny', () => {
    it('should render when user has at least one permission', () => {
      (usePermissions as any).mockReturnValue({
        can: vi.fn(),
        canAny: (permissions: Permission[]) =>
          permissions.includes(Permission.PATIENTS_VIEW),
        canAll: vi.fn(),
      });

      render(
        <Can
          permission={[Permission.PATIENTS_VIEW, Permission.PATIENTS_CREATE]}
          requireAny
        >
          <div>Patient Management</div>
        </Can>
      );

      expect(screen.getByText('Patient Management')).toBeInTheDocument();
    });

    it('should not render when user has none of the permissions', () => {
      (usePermissions as any).mockReturnValue({
        can: vi.fn(),
        canAny: () => false,
        canAll: vi.fn(),
      });

      render(
        <Can
          permission={[Permission.PATIENTS_CREATE, Permission.PATIENTS_DELETE]}
          requireAny
        >
          <div>Patient Management</div>
        </Can>
      );

      expect(screen.queryByText('Patient Management')).not.toBeInTheDocument();
    });
  });

  describe('multiple permissions with requireAll (default)', () => {
    it('should render when user has all permissions', () => {
      (usePermissions as any).mockReturnValue({
        can: vi.fn(),
        canAny: vi.fn(),
        canAll: () => true,
      });

      render(
        <Can
          permission={[Permission.PATIENTS_VIEW, Permission.APPOINTMENTS_VIEW]}
        >
          <div>Combined View</div>
        </Can>
      );

      expect(screen.getByText('Combined View')).toBeInTheDocument();
    });

    it('should not render when user is missing any permission', () => {
      (usePermissions as any).mockReturnValue({
        can: vi.fn(),
        canAny: vi.fn(),
        canAll: () => false,
      });

      render(
        <Can
          permission={[Permission.PATIENTS_VIEW, Permission.PATIENTS_CREATE]}
        >
          <div>Combined View</div>
        </Can>
      );

      expect(screen.queryByText('Combined View')).not.toBeInTheDocument();
    });
  });

  describe('no permission specified', () => {
    it('should always render children', () => {
      (usePermissions as any).mockReturnValue({
        can: vi.fn(),
        canAny: vi.fn(),
        canAll: vi.fn(),
      });

      render(
        <Can>
          <div>Always visible</div>
        </Can>
      );

      expect(screen.getByText('Always visible')).toBeInTheDocument();
    });
  });

  describe('real-world scenarios', () => {
    it('STAFF should not see create button for labworks', () => {
      (usePermissions as any).mockReturnValue({
        can: (permission: Permission) =>
          permission === Permission.LABWORKS_VIEW,
        canAny: vi.fn(),
        canAll: vi.fn(),
      });

      render(
        <Can permission={Permission.LABWORKS_CREATE}>
          <button>New Labwork</button>
        </Can>
      );

      expect(screen.queryByText('New Labwork')).not.toBeInTheDocument();
    });

    it('ADMIN should see create button for labworks', () => {
      (usePermissions as any).mockReturnValue({
        can: (permission: Permission) =>
          [Permission.LABWORKS_VIEW, Permission.LABWORKS_CREATE].includes(
            permission
          ),
        canAny: vi.fn(),
        canAll: vi.fn(),
      });

      render(
        <Can permission={Permission.LABWORKS_CREATE}>
          <button>New Labwork</button>
        </Can>
      );

      expect(screen.getByText('New Labwork')).toBeInTheDocument();
    });

    it('STAFF should not see create button for expenses', () => {
      (usePermissions as any).mockReturnValue({
        can: (permission: Permission) =>
          permission === Permission.EXPENSES_VIEW,
        canAny: vi.fn(),
        canAll: vi.fn(),
      });

      render(
        <Can permission={Permission.EXPENSES_CREATE}>
          <button>New Expense</button>
        </Can>
      );

      expect(screen.queryByText('New Expense')).not.toBeInTheDocument();
    });

    it('only OWNER should see tenant profile update section', () => {
      (usePermissions as any).mockReturnValue({
        can: (permission: Permission) =>
          permission !== Permission.TENANT_PROFILE_UPDATE,
        canAny: vi.fn(),
        canAll: vi.fn(),
      });

      render(
        <Can permission={Permission.TENANT_PROFILE_UPDATE}>
          <section>Tenant Profile Settings</section>
        </Can>
      );

      expect(screen.queryByText('Tenant Profile Settings')).not.toBeInTheDocument();
    });
  });
});
