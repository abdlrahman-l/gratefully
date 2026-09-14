import { useEffect, useRef, useState } from 'react'
import { useNavigate, useRouterState } from '@tanstack/react-router'

type SearchState = Record<string, string | undefined>

type UseUrlSearchStateReturn<T extends SearchState> = {
  states: T | null
  updateKey: (key: keyof T, value: string) => void
  debouncedStates: T | null
  isReady: boolean
  query: SearchState
}

function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedValue(value), delay)
    return () => window.clearTimeout(timeoutId)
  }, [value, delay])

  return debouncedValue
}

/** Keeps filter state in the URL while exposing an immediately-updating and debounced value. */
export function useUrlSearchState<T extends SearchState>(
  defaultValues: T,
  delay = 500
): UseUrlSearchStateReturn<T> {
  const navigate = useNavigate()
  const query = useRouterState({
    select: (state) => state.location.search as SearchState,
  })
  const [states, setStates] = useState<T | null>(null)
  const isHydrated = useRef(false)
  const isFirstDebounce = useRef(true)
  const debouncedStates = useDebounce(states, delay)

  useEffect(() => {
    if (isHydrated.current) return

    const initialStates = { ...defaultValues }
    Object.keys(defaultValues).forEach((key) => {
      const value = query[key]
      if (typeof value === 'string') {
        initialStates[key as keyof T] = value as T[keyof T]
      }
    })

    setStates(initialStates)
    isHydrated.current = true
  }, [defaultValues, query])

  useEffect(() => {
    if (!isHydrated.current || !debouncedStates) return
    if (isFirstDebounce.current) {
      isFirstDebounce.current = false
      return
    }

    const nextSearch = { ...query }
    let hasChanged = false

    Object.keys(defaultValues).forEach((key) => {
      const value = debouncedStates[key]
      const nextValue =
        value && value !== defaultValues[key] ? value : undefined

      if (nextSearch[key] !== nextValue) {
        nextSearch[key] = nextValue
        hasChanged = true
      }
    })

    if (hasChanged) {
      // The journey route intentionally accepts free-form search keys; keep the
      // hook reusable even though this route has no explicit search schema.
      const navigateSearch = navigate as unknown as (options: {
        search: SearchState
        replace?: boolean
      }) => void
      navigateSearch({
        search: nextSearch,
        replace: true,
      })
    }
  }, [debouncedStates, defaultValues, navigate, query])

  const updateKey = (key: keyof T, value: string) => {
    setStates((previous) => ({
      ...(previous ?? defaultValues),
      [key]: value,
    }))
  }

  return {
    states,
    updateKey,
    debouncedStates,
    isReady: isHydrated.current,
    query,
  }
}
