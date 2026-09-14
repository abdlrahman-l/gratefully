import { useEffect, useState } from 'react'
import { getActiveEntries } from '@/db/entries.repository'
import type { GratefullyEntry } from '@/types/gratefully'

const WEEK_DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const

export type DashboardWeekDay = {
  key: (typeof WEEK_DAYS)[number]
  complete: boolean
}

type DashboardData = {
  totalEntries: number
  monthlyEntries: number
  streakDays: number
  completedDays: number
  week: DashboardWeekDay[]
}

function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getStartOfWeek(date: Date): Date {
  const start = new Date(date)
  const day = start.getDay()
  const daysSinceMonday = day === 0 ? 6 : day - 1
  start.setDate(start.getDate() - daysSinceMonday)
  return start
}

function getDashboardData(entries: GratefullyEntry[]): DashboardData {
  const now = new Date()
  const today = toDateKey(now)
  const currentMonth = today.slice(0, 7)
  const entryDates = new Set(entries.map((entry) => entry.date))
  const startOfWeek = getStartOfWeek(now)

  const week = WEEK_DAYS.map((key, index) => {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + index)

    return {
      key,
      complete: entryDates.has(toDateKey(date)),
    }
  })

  let streakDays = 0
  const streakDate = new Date(now)
  while (entryDates.has(toDateKey(streakDate))) {
    streakDays += 1
    streakDate.setDate(streakDate.getDate() - 1)
  }

  return {
    totalEntries: entries.length,
    monthlyEntries: entries.filter((entry) =>
      entry.date.startsWith(currentMonth)
    ).length,
    streakDays,
    completedDays: week.filter(({ complete }) => complete).length,
    week,
  }
}

const EMPTY_DATA: DashboardData = {
  totalEntries: 0,
  monthlyEntries: 0,
  streakDays: 0,
  completedDays: 0,
  week: WEEK_DAYS.map((key) => ({ key, complete: false })),
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>(EMPTY_DATA)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadDashboardData = async () => {
      try {
        const entries = await getActiveEntries()
        if (isMounted) setData(getDashboardData(entries))
      } catch {
        // Keep the dashboard usable with its initial zero values if the local database is unavailable.
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void loadDashboardData()

    return () => {
      isMounted = false
    }
  }, [])

  return { ...data, isLoading }
}
