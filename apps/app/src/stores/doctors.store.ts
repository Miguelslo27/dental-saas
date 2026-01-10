import { create } from 'zustand'
import {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  restoreDoctor,
  getDoctorStats,
  getDoctorApiErrorMessage,
  type Doctor,
  type DoctorStats,
  type CreateDoctorData,
  type UpdateDoctorData,
  type ListDoctorsParams,
} from '@/lib/doctor-api'

// ============================================================================
// Types
// ============================================================================

export interface DoctorsState {
  doctors: Doctor[]
  selectedDoctor: Doctor | null
  stats: DoctorStats | null
  isLoading: boolean
  error: string | null
  searchQuery: string
  showInactive: boolean
}

export interface DoctorsActions {
  // Fetch actions
  fetchDoctors: (params?: ListDoctorsParams) => Promise<void>
  fetchDoctorById: (id: string) => Promise<Doctor | null>
  fetchStats: () => Promise<void>

  // CRUD actions
  addDoctor: (data: CreateDoctorData) => Promise<Doctor>
  editDoctor: (id: string, data: UpdateDoctorData) => Promise<Doctor>
  removeDoctor: (id: string) => Promise<void>
  restoreDeletedDoctor: (id: string) => Promise<Doctor>

  // UI state actions
  setSelectedDoctor: (doctor: Doctor | null) => void
  setSearchQuery: (query: string) => void
  setShowInactive: (show: boolean) => void
  clearError: () => void
  reset: () => void
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: DoctorsState = {
  doctors: [],
  selectedDoctor: null,
  stats: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  showInactive: false,
}

// ============================================================================
// Store
// ============================================================================

export const useDoctorsStore = create<DoctorsState & DoctorsActions>()((set, get) => ({
  ...initialState,

  // --------------------------------------------------------------------------
  // Fetch Actions
  // --------------------------------------------------------------------------

  fetchDoctors: async (params?: ListDoctorsParams) => {
    set({ isLoading: true, error: null })
    try {
      const { searchQuery, showInactive } = get()
      const doctors = await getDoctors({
        ...params,
        search: params?.search ?? (searchQuery || undefined),
        includeInactive: params?.includeInactive ?? showInactive,
      })
      set({ doctors, isLoading: false })
    } catch (error) {
      set({ error: getDoctorApiErrorMessage(error), isLoading: false })
    }
  },

  fetchDoctorById: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const doctor = await getDoctorById(id)
      set({ selectedDoctor: doctor, isLoading: false })
      return doctor
    } catch (error) {
      set({ error: getDoctorApiErrorMessage(error), isLoading: false })
      return null
    }
  },

  fetchStats: async () => {
    try {
      const stats = await getDoctorStats()
      set({ stats })
    } catch (error) {
      // Stats fetch failure is not critical, just log it
      console.warn('Failed to fetch doctor stats:', getDoctorApiErrorMessage(error))
    }
  },

  // --------------------------------------------------------------------------
  // CRUD Actions
  // --------------------------------------------------------------------------

  addDoctor: async (data: CreateDoctorData) => {
    set({ isLoading: true, error: null })
    try {
      const newDoctor = await createDoctor(data)
      set((state) => ({
        doctors: [...state.doctors, newDoctor],
        isLoading: false,
      }))
      // Refresh stats after adding
      get().fetchStats()
      return newDoctor
    } catch (error) {
      const message = getDoctorApiErrorMessage(error)
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  editDoctor: async (id: string, data: UpdateDoctorData) => {
    set({ isLoading: true, error: null })
    try {
      const updatedDoctor = await updateDoctor(id, data)
      set((state) => ({
        doctors: state.doctors.map((d) => (d.id === id ? updatedDoctor : d)),
        selectedDoctor: state.selectedDoctor?.id === id ? updatedDoctor : state.selectedDoctor,
        isLoading: false,
      }))
      return updatedDoctor
    } catch (error) {
      const message = getDoctorApiErrorMessage(error)
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  removeDoctor: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await deleteDoctor(id)
      set((state) => ({
        // If showing inactive, just mark as inactive; otherwise remove from list
        doctors: state.showInactive
          ? state.doctors.map((d) => (d.id === id ? { ...d, isActive: false } : d))
          : state.doctors.filter((d) => d.id !== id),
        selectedDoctor: state.selectedDoctor?.id === id ? null : state.selectedDoctor,
        isLoading: false,
      }))
      // Refresh stats after removing
      get().fetchStats()
    } catch (error) {
      const message = getDoctorApiErrorMessage(error)
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  restoreDeletedDoctor: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const restoredDoctor = await restoreDoctor(id)
      set((state) => ({
        doctors: state.doctors.map((d) => (d.id === id ? restoredDoctor : d)),
        isLoading: false,
      }))
      // Refresh stats after restoring
      get().fetchStats()
      return restoredDoctor
    } catch (error) {
      const message = getDoctorApiErrorMessage(error)
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  // --------------------------------------------------------------------------
  // UI State Actions
  // --------------------------------------------------------------------------

  setSelectedDoctor: (doctor) => {
    set({ selectedDoctor: doctor })
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query })
  },

  setShowInactive: (show) => {
    set({ showInactive: show })
  },

  clearError: () => {
    set({ error: null })
  },

  reset: () => {
    set(initialState)
  },
}))
