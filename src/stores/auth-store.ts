import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

const ACCESS_TOKEN = 'thisisjustarandomstring'
const AUTH_USER = 'auth-user'
const ACCESS_TOKEN_EXPIRES_AT = 'access-token-expires-at'

export type AuthStatus = 'initializing' | 'authenticated' | 'unauthenticated'
export type DriveConnectionStatus = 'connected' | 'disconnected' | 'connecting'

export interface AuthUser {
  accountNo: string
  email: string
  role: string[]
  exp: number
  name?: string
  picture?: string
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    expiresAt: number | null
    status: AuthStatus
    driveConnectionStatus: DriveConnectionStatus
    setCredentials: (
      accessToken: string,
      expiresAt: number,
      driveConnectionStatus?: DriveConnectionStatus
    ) => void
    setStatus: (status: AuthStatus) => void
    setDriveConnectionStatus: (status: DriveConnectionStatus) => void
    resetAccessToken: () => void
    reset: () => void
  }
}

function parseCookie<T>(cookieName: string, fallback: T): T {
  const value = getCookie(cookieName)
  if (!value) return fallback

  try {
    return JSON.parse(value) as T
  } catch {
    // Remove malformed persisted state instead of preventing the app from loading.
    removeCookie(cookieName)
    return fallback
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  const initToken = parseCookie<string>(ACCESS_TOKEN, '')
  const initUser = parseCookie<AuthUser | null>(AUTH_USER, null)
  const persistedExpiresAt = parseCookie<number | null>(
    ACCESS_TOKEN_EXPIRES_AT,
    null
  )
  // Migrate the existing user.exp persistence (seconds) to the explicit token
  // expiry timestamp used by the token lifecycle.
  const initExpiresAt =
    persistedExpiresAt ?? (initUser?.exp ? initUser.exp * 1000 : null)
  return {
    auth: {
      user: initUser,
      setUser: (user) =>
        set((state) => {
          if (user) {
            setCookie(AUTH_USER, JSON.stringify(user))
          } else {
            removeCookie(AUTH_USER)
          }
          return {
            ...state,
            auth: {
              ...state.auth,
              user,
              status: user ? 'authenticated' : 'unauthenticated',
            },
          }
        }),
      accessToken: initToken,
      expiresAt: initExpiresAt,
      status: 'initializing',
      driveConnectionStatus: 'disconnected',
      setCredentials: (
        accessToken,
        expiresAt,
        driveConnectionStatus = 'connected'
      ) =>
        set((state) => {
          setCookie(ACCESS_TOKEN, JSON.stringify(accessToken))
          setCookie(ACCESS_TOKEN_EXPIRES_AT, JSON.stringify(expiresAt))
          return {
            ...state,
            auth: {
              ...state.auth,
              accessToken,
              expiresAt,
              driveConnectionStatus,
            },
          }
        }),
      setStatus: (status) =>
        set((state) => ({
          ...state,
          auth: { ...state.auth, status },
        })),
      setDriveConnectionStatus: (driveConnectionStatus) =>
        set((state) => ({
          ...state,
          auth: { ...state.auth, driveConnectionStatus },
        })),
      resetAccessToken: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          removeCookie(ACCESS_TOKEN_EXPIRES_AT)
          return {
            ...state,
            auth: {
              ...state.auth,
              accessToken: '',
              expiresAt: null,
              driveConnectionStatus: 'disconnected',
            },
          }
        }),
      reset: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          removeCookie(ACCESS_TOKEN_EXPIRES_AT)
          removeCookie(AUTH_USER)
          return {
            ...state,
            auth: {
              ...state.auth,
              user: null,
              accessToken: '',
              expiresAt: null,
              status: 'unauthenticated',
              driveConnectionStatus: 'disconnected',
            },
          }
        }),
    },
  }
})
