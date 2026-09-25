function toLocalDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getPreviousLocalDateKey(date: Date): string {
  const previousDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() - 1
  )
  return toLocalDateKey(previousDate)
}

/**
 * Counts the active streak from local YYYY-MM-DD journal date keys.
 * A missing current day is allowed until the day ends, so yesterday can start
 * an active streak when no entry has been completed today.
 */
export function calculateCurrentStreak(
  entryDates: Iterable<string>,
  now: Date = new Date()
): number {
  const completedDates = new Set(entryDates)
  let dateKey = toLocalDateKey(now)

  if (!completedDates.has(dateKey)) {
    dateKey = getPreviousLocalDateKey(now)
    if (!completedDates.has(dateKey)) return 0
  }

  let streak = 0
  while (completedDates.has(dateKey)) {
    streak += 1
    const [year, month, day] = dateKey.split('-').map(Number)
    dateKey = getPreviousLocalDateKey(new Date(year, month - 1, day))
  }

  return streak
}

export function getRewardVisualDay(streak: number): number {
  if (streak <= 0) return 1
  return ((streak - 1) % 7) + 1
}

export function getRewardImage(streak: number): string {
  return `/images/reward/week1-day${getRewardVisualDay(streak)}.png`
}

export function getNextStreakMilestone(streak: number): number {
  if (streak < 3) return 3
  if (streak < 7) return 7
  if (streak < 14) return 14
  return 30
}

export function getStreakMilestoneProgress(streak: number): number {
  const nextMilestone = getNextStreakMilestone(streak)
  return Math.min(100, Math.round((streak / nextMilestone) * 100))
}
