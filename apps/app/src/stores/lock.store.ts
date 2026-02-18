import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { authApi } from '@/lib/api'
import type { ProfileUser } from '@/lib/api'
import { useAuthStore } from './auth.store'

export interface LockState {
  isLocked: boolean
  autoLockMinutes: number
  profiles: ProfileUser[]
}

export interface LockActions {
  lock: () => void
  unlock: () => void
  setAutoLockMinutes: (minutes: number) => void
  fetchProfiles: (clinicSlug: string) => Promise<void>
  pinLogin: (userId: string, pin: string, clinicSlug: string) => Promise<void>
  reset: () => void
}

const initialState: LockState = {
  isLocked: false,
  autoLockMinutes: 5,
  profiles: [],
}

export const useLockStore = create<LockState & LockActions>()(
  persist(
    (set) => ({
      ...initialState,

      lock: () => set({ isLocked: true }),

      unlock: () => set({ isLocked: false }),

      setAutoLockMinutes: (minutes) => set({ autoLockMinutes: minutes }),

      fetchProfiles: async (clinicSlug) => {
        try {
          const profiles = await authApi.getProfiles(clinicSlug)
          set({ profiles })
        } catch {
          set({ profiles: [] })
        }
      },

      pinLogin: async (userId, pin, clinicSlug) => {
        const response = await authApi.pinLogin({ userId, pin, clinicSlug })
        const { user, accessToken, refreshToken } = response
        useAuthStore.getState().setAuth(user, accessToken, refreshToken)
        set({ isLocked: false })
      },

      reset: () => set({ ...initialState }),
    }),
    {
      name: 'dental-lock',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        isLocked: state.isLocked,
        autoLockMinutes: state.autoLockMinutes,
      }),
    }
  )
)
