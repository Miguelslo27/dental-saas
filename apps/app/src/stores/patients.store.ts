import { create } from 'zustand'
import {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  restorePatient,
  getPatientStats,
  getPatientApiErrorMessage,
  type Patient,
  type PatientStats,
  type CreatePatientData,
  type UpdatePatientData,
  type ListPatientsParams,
} from '@/lib/patient-api'

// ============================================================================
// Types
// ============================================================================

export interface PatientsState {
  patients: Patient[]
  selectedPatient: Patient | null
  stats: PatientStats | null
  isLoading: boolean
  error: string | null
  searchQuery: string
  showInactive: boolean
}

export interface PatientsActions {
  // Fetch actions
  fetchPatients: (params?: ListPatientsParams) => Promise<void>
  fetchPatientById: (id: string) => Promise<Patient | null>
  fetchStats: () => Promise<void>

  // CRUD actions
  addPatient: (data: CreatePatientData) => Promise<Patient>
  editPatient: (id: string, data: UpdatePatientData) => Promise<Patient>
  removePatient: (id: string) => Promise<void>
  restoreDeletedPatient: (id: string) => Promise<Patient>

  // UI state actions
  setSelectedPatient: (patient: Patient | null) => void
  setSearchQuery: (query: string) => void
  setShowInactive: (show: boolean) => void
  clearError: () => void
  reset: () => void
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: PatientsState = {
  patients: [],
  selectedPatient: null,
  stats: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  showInactive: false,
}

// ============================================================================
// Store
// ============================================================================

export const usePatientsStore = create<PatientsState & PatientsActions>()((set, get) => ({
  ...initialState,

  // --------------------------------------------------------------------------
  // Fetch Actions
  // --------------------------------------------------------------------------

  fetchPatients: async (params?: ListPatientsParams) => {
    set({ isLoading: true, error: null })
    try {
      const { searchQuery, showInactive } = get()
      const patients = await getPatients({
        ...params,
        search: params?.search ?? (searchQuery || undefined),
        includeInactive: params?.includeInactive ?? showInactive,
      })
      set({ patients, isLoading: false })
    } catch (error) {
      set({ error: getPatientApiErrorMessage(error), isLoading: false })
    }
  },

  fetchPatientById: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const patient = await getPatientById(id)
      set({ selectedPatient: patient, isLoading: false })
      return patient
    } catch (error) {
      set({ error: getPatientApiErrorMessage(error), isLoading: false })
      return null
    }
  },

  fetchStats: async () => {
    try {
      const stats = await getPatientStats()
      set({ stats })
    } catch (error) {
      // Stats fetch failure is not critical, just log it
      console.warn('Failed to fetch patient stats:', getPatientApiErrorMessage(error))
    }
  },

  // --------------------------------------------------------------------------
  // CRUD Actions
  // --------------------------------------------------------------------------

  addPatient: async (data: CreatePatientData) => {
    set({ isLoading: true, error: null })
    try {
      const newPatient = await createPatient(data)
      set((state) => ({
        patients: [...state.patients, newPatient],
        isLoading: false,
      }))
      // Refresh stats after adding
      get().fetchStats()
      return newPatient
    } catch (error) {
      const message = getPatientApiErrorMessage(error)
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  editPatient: async (id: string, data: UpdatePatientData) => {
    set({ isLoading: true, error: null })
    try {
      const updatedPatient = await updatePatient(id, data)
      set((state) => ({
        patients: state.patients.map((p) => (p.id === id ? updatedPatient : p)),
        selectedPatient: state.selectedPatient?.id === id ? updatedPatient : state.selectedPatient,
        isLoading: false,
      }))
      return updatedPatient
    } catch (error) {
      const message = getPatientApiErrorMessage(error)
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  removePatient: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await deletePatient(id)
      set((state) => ({
        // If showing inactive, just mark as inactive; otherwise remove from list
        patients: state.showInactive
          ? state.patients.map((p) => (p.id === id ? { ...p, isActive: false } : p))
          : state.patients.filter((p) => p.id !== id),
        selectedPatient: state.selectedPatient?.id === id ? null : state.selectedPatient,
        isLoading: false,
      }))
      // Refresh stats after removing
      get().fetchStats()
    } catch (error) {
      const message = getPatientApiErrorMessage(error)
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  restoreDeletedPatient: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const restoredPatient = await restorePatient(id)
      set((state) => ({
        patients: state.patients.map((p) => (p.id === id ? restoredPatient : p)),
        isLoading: false,
      }))
      // Refresh stats after restoring
      get().fetchStats()
      return restoredPatient
    } catch (error) {
      const message = getPatientApiErrorMessage(error)
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  // --------------------------------------------------------------------------
  // UI State Actions
  // --------------------------------------------------------------------------

  setSelectedPatient: (patient) => {
    set({ selectedPatient: patient })
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
