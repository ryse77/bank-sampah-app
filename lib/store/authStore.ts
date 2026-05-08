import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/lib/types';

interface AuthState {
  user: User | null;
  token: string | null;
  _hasHydrated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
  updateUser: (user: User) => void;
}

interface PersistedAuthState {
  user: User | null;
  token: string | null;
}

const customStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(name, value);
    } catch {
      // ignore
    }
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(name);
    } catch {
      // ignore
    }
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      _hasHydrated: false,
      setAuth: (user, token) => {
        set({
          user: { ...user, profile_completed: user.profile_completed ?? false },
          token,
        });
      },
      logout: () => {
        set({ user: null, token: null });
      },
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      updateUser: (user) =>
        set({
          user: { ...user, profile_completed: user.profile_completed ?? false },
        }),
    }),
    {
      name: 'bank-sampah-auth',
      storage: createJSONStorage(() => customStorage),
      partialize: (state): PersistedAuthState => ({
        user: state.user,
        token: state.token,
      }),
      version: 2,
      onRehydrateStorage: () => {
        return (state, error) => {
          if (!error) {
            state?.setHasHydrated(true);
          }
        };
      },
      migrate: (persistedState: unknown): PersistedAuthState => {
        const state = (persistedState ?? {}) as Partial<PersistedAuthState>;
        const user = state.user
          ? { ...state.user, profile_completed: state.user.profile_completed ?? false }
          : null;

        return {
          user,
          token: state.token ?? null,
        };
      },
    }
  )
);
