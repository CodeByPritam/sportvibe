import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Store authentication state of the user
const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            refreshToken: null,

            // Update authentication state with new values.
            setAuth: ({ user, accessToken, refreshToken }) =>
            set(s => ({
                user: user ?? s.user,
                accessToken: accessToken ?? s.accessToken,
                refreshToken: refreshToken ?? s.refreshToken,
            })),

            clearAuth: () =>
                set({ user: null, accessToken: null, refreshToken: null }),
        }),
        { name: 'sportvibe-auth' }
    )
)

// Export
export default useAuthStore;