import { create } from 'zustand'
import {
  settingsApi,
  type TenantSettings,
  type TenantProfile,
  type UpdateSettingsData,
  type UpdateTenantProfileData,
} from '@/lib/settings-api'
import { useAuthStore } from '@/stores/auth.store'

// ============================================================================
// Types
// ============================================================================

interface SettingsState {
  // Data
  settings: TenantSettings | null
  tenantProfile: TenantProfile | null

  // UI State
  isLoading: boolean
  isSaving: boolean
  error: string | null
  successMessage: string | null
}

interface SettingsActions {
  // Fetch
  fetchSettings: () => Promise<void>
  fetchTenantProfile: () => Promise<void>
  fetchAll: () => Promise<void>

  // Update
  updateSettings: (data: UpdateSettingsData) => Promise<void>
  updateTenantProfile: (data: UpdateTenantProfileData) => Promise<void>

  // UI
  clearError: () => void
  clearSuccessMessage: () => void
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: SettingsState = {
  settings: null,
  tenantProfile: null,
  isLoading: false,
  isSaving: false,
  error: null,
  successMessage: null,
}

// ============================================================================
// Store
// ============================================================================

export const useSettingsStore = create<SettingsState & SettingsActions>((set) => ({
  ...initialState,

  fetchSettings: async () => {
    set({ isLoading: true, error: null })
    try {
      const settings = await settingsApi.getSettings()
      set({ settings, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load settings'
      set({ error: message, isLoading: false })
    }
  },

  fetchTenantProfile: async () => {
    set({ isLoading: true, error: null })
    try {
      const tenantProfile = await settingsApi.getTenantProfile()
      set({ tenantProfile, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load clinic profile'
      set({ error: message, isLoading: false })
    }
  },

  fetchAll: async () => {
    set({ isLoading: true, error: null })
    try {
      const [settings, tenantProfile] = await Promise.all([
        settingsApi.getSettings(),
        settingsApi.getTenantProfile(),
      ])
      set({ settings, tenantProfile, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load data'
      set({ error: message, isLoading: false })
    }
  },

  updateSettings: async (data: UpdateSettingsData) => {
    set({ isSaving: true, error: null })
    try {
      const settings = await settingsApi.updateSettings(data)
      set({
        settings,
        isSaving: false,
        successMessage: 'Settings saved successfully',
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save settings'
      set({ error: message, isSaving: false })
      throw error
    }
  },

  updateTenantProfile: async (data: UpdateTenantProfileData) => {
    set({ isSaving: true, error: null })
    try {
      const tenantProfile = await settingsApi.updateTenantProfile(data)
      set({
        tenantProfile,
        isSaving: false,
        successMessage: 'Clinic profile saved successfully',
      })

      // Sync tenant data to auth store so dashboard and other pages see updates
      const { user, setUser } = useAuthStore.getState()
      if (user) {
        setUser({
          ...user,
          tenant: {
            ...user.tenant,
            id: tenantProfile.id,
            name: tenantProfile.name,
            slug: tenantProfile.slug,
            logo: tenantProfile.logo ?? undefined,
            currency: tenantProfile.currency,
          },
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save clinic profile'
      set({ error: message, isSaving: false })
      throw error
    }
  },

  clearError: () => set({ error: null }),
  clearSuccessMessage: () => set({ successMessage: null }),
}))
