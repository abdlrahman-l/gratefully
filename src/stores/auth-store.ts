import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

const ACCESS_TOKEN = 'thisisjustarandomstring'
const AUTH_USER = 'auth-user'

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
    setAccessToken: (accessToken: string) => void
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
      accessToken: initToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          setCookie(ACCESS_TOKEN, JSON.stringify(accessToken))
          return { ...state, auth: { ...state.auth, accessToken } }
        }),
      resetAccessToken: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          return { ...state, auth: { ...state.auth, accessToken: '' } }
        }),
      reset: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          removeCookie(AUTH_USER)
          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: '' },
          }
        }),
    },
  }
})
