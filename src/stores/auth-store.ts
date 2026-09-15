import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

const ACCESS_TOKEN = 'thisisjustarandomstring'
const AUTH_USER = 'auth-user'
const ACCESS_TOKEN_EXPIRES_AT = 'access-token-expires-at'

export type AuthStatus =
  | 'initializing'
  | 'authenticated'
  | 'reauthorizing'
  | 'unauthenticated'

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
    setCredentials: (accessToken: string, expiresAt: number) => void
    setStatus: (status: AuthStatus) => void
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
  const hasValidToken = Boolean(
    initToken && initExpiresAt && Date.now() < initExpiresAt - 60_000
  )

  if (initToken && !hasValidToken) {
    removeCookie(ACCESS_TOKEN)
    removeCookie(ACCESS_TOKEN_EXPIRES_AT)
  }

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
          return { ...state, auth: { ...state.auth, user } }
        }),
      accessToken: hasValidToken ? initToken : '',
      expiresAt: hasValidToken ? initExpiresAt : null,
      status: hasValidToken ? 'authenticated' : 'unauthenticated',
      setCredentials: (accessToken, expiresAt) =>
        set((state) => {
          setCookie(ACCESS_TOKEN, JSON.stringify(accessToken))
          setCookie(ACCESS_TOKEN_EXPIRES_AT, JSON.stringify(expiresAt))
          return {
            ...state,
            auth: {
              ...state.auth,
              accessToken,
              expiresAt,
              status: 'authenticated',
            },
          }
        }),
      setStatus: (status) =>
        set((state) => ({
          ...state,
          auth: { ...state.auth, status },
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
              status: 'unauthenticated',
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
            },
          }
        }),
    },
  }
})
