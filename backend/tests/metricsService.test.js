import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateDashboardMetrics } from '../services/metricsService.js'

test('calculateDashboardMetrics computes expected KPIs', () => {
  const appointments = [
    {
      userId: 'u1', docId: 'd1', cancelled: false, payment: true, isCompleted: true,
      slotDate: '25_12_2026', slotTime: '10:00 AM', date: new Date('2026-12-20T10:00:00Z').getTime(),
    },
    {
      userId: 'u2', docId: 'd1', cancelled: false, payment: false, isCompleted: false,
      slotDate: '01_01_2025', slotTime: '10:00 AM', date: new Date('2024-12-30T10:00:00Z').getTime(),
    },
    {
      userId: 'u3', docId: 'd2', cancelled: true, payment: false, isCompleted: false,
      slotDate: '01_01_2025', slotTime: '11:00 AM', date: new Date('2024-12-30T10:00:00Z').getTime(),
    },
  ]

  const carePlans = [
    { userId: 'u1', docId: 'd1', lastReminderAt: new Date('2026-12-19T10:00:00Z') },
    { userId: 'u4', docId: 'd9', lastReminderAt: new Date('2026-12-19T10:00:00Z') },
  ]

  const metrics = calculateDashboardMetrics({
    appointments,
    carePlans,
    now: new Date('2026-12-21T10:00:00Z'),
  })

  assert.equal(typeof metrics.bookingSuccessRate, 'number')
  assert.equal(typeof metrics.noShowRate, 'number')
  assert.equal(typeof metrics.reminderEffectiveness, 'number')
  assert.equal(typeof metrics.medianTimeToBookHours, 'number')

  assert.equal(metrics.bookingSuccessRate, 33.3)
  assert.equal(metrics.noShowRate, 100)
  assert.equal(metrics.reminderEffectiveness, 50)
})
