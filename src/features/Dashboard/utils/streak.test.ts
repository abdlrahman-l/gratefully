import { describe, expect, it } from 'vitest'
import {
  calculateCurrentStreak,
  getRewardImage,
  getRewardVisualDay,
  getNextStreakMilestone,
  getStreakMilestoneProgress,
} from './streak'

const today = new Date(2026, 8, 14, 12)

function dateKey(daysAgo: number): string {
  const date = new Date(2026, 8, 14 - daysAgo, 12)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

describe('calculateCurrentStreak', () => {
  it('handles empty, current-day, and previous-day entries', () => {
    expect(calculateCurrentStreak([], today)).toBe(0)
    expect(calculateCurrentStreak([dateKey(0)], today)).toBe(1)
    expect(calculateCurrentStreak([dateKey(1)], today)).toBe(1)
  })

  it('counts each completed calendar date only once', () => {
    expect(
      calculateCurrentStreak([dateKey(0), dateKey(0), dateKey(1)], today)
    ).toBe(2)
  })

  it('counts consecutive dates and stops at a missing date', () => {
    expect(calculateCurrentStreak([dateKey(0), dateKey(1)], today)).toBe(2)
    expect(calculateCurrentStreak([dateKey(0), dateKey(2)], today)).toBe(1)
    expect(
      calculateCurrentStreak([dateKey(1), dateKey(2), dateKey(3)], today)
    ).toBe(3)
  })

  it('crosses month and year boundaries using local calendar dates', () => {
    const newYear = new Date(2026, 0, 1, 12)
    expect(calculateCurrentStreak(['2026-01-01', '2025-12-31'], newYear)).toBe(
      2
    )
  })
})

describe('reward visual day', () => {
  it.each([
    [1, 1],
    [7, 7],
    [8, 7],
    [9, 7],
    [14, 7],
    [15, 7],
  ])('maps streak %i to visual day %i', (streak, visualDay) => {
    expect(getRewardVisualDay(streak)).toBe(visualDay)
  })

  it('uses day one as the safe initial image', () => {
    expect(getRewardImage(0)).toBe('/images/reward/streak-day1.png')
  })
})

describe('streak milestones', () => {
  it.each([
    [0, 3],
    [2, 3],
    [3, 7],
    [6, 7],
    [7, 14],
    [13, 14],
    [14, 30],
    [30, 30],
  ])('selects the next milestone for %i days', (streak, milestone) => {
    expect(getNextStreakMilestone(streak)).toBe(milestone)
  })

  it.each([
    [0, 0],
    [3, 100],
    [7, 100],
    [14, 100],
    [30, 100],
  ])('calculates milestone progress for %i days', (streak, progress) => {
    expect(getStreakMilestoneProgress(streak)).toBe(progress)
  })
})
